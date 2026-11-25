// SPDX-License-Identifier: Apache-2.0
import { chromium, type BrowserContext, type Dialog } from 'playwright';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { mkdir, readdir, stat, rename } from 'node:fs/promises';
import { projectSchema, timelineSchema, type Project, type Action, type Timeline } from '../../shared/src/schema.js';
import { ensureRoot, safePath, writeJson } from '../../shared/src/files.js';
import { validateNetwork, checkUrl, safeUrl } from '../../privacy/src/index.js';
import { installOverlay, Cursor, showLabel } from '../../cursor/src/index.js';
import { executeAction } from '../../browser/src/index.js';
import { validateVideo } from '../../recorder/src/index.js';
import { delay } from '../../shared/src/timing.js';

export { createProject, projectSchema, timelineSchema } from '../../shared/src/schema.js';
export type { Project, Timeline, Action } from '../../shared/src/schema.js';
export interface RunOptions { baseDir?: string; approvedActionIds?: string[]; headed?: boolean; signal?: AbortSignal }
export interface RunResult { runDir: string; timeline: Timeline }

export async function runProject(input: unknown, options: RunOptions = {}): Promise<RunResult> {
  const project = projectSchema.parse(input);
  await validateNetwork(project);
  const approved = new Set(options.approvedActionIds ?? []);
  for (const action of project.actions) if (action.effect === 'consequential' && !approved.has(action.id)) throw new Error(`Explicit approval required for action ${action.id}; use --approve ${action.id}`);
  if (options.signal?.aborted) throw new Error('Run cancelled before launch');
  const root = await ensureRoot(path.resolve(options.baseDir ?? process.cwd(), project.outputDir));
  const recordingId = randomUUID();
  const runDir = await safePath(root, recordingId); await mkdir(runDir);
  await mkdir(await safePath(runDir, 'screenshots'));
  await mkdir(await safePath(runDir, 'capture'));
  const browser = await chromium.launch({ headless: !options.headed, chromiumSandbox: true, args: ['--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', '--disable-features=PreconnectToSearch,Prerender2'] });
  let context: BrowserContext | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let sizeTimer: ReturnType<typeof setInterval> | undefined;
  let start = performance.now();
  const now = () => Math.max(0, Math.round(performance.now() - start));
  const timeline: Timeline = {
    schemaVersion: '1.0', projectId: project.projectId, recordingId,
    sourceUrl: safeUrl(project.url), status: 'failed', viewport: project.viewport,
    recording: { file: 'recording.webm', width: project.recording.width, height: project.recording.height, bytes: 0, valid: false, durationMs: 0 },
    clock: { unit: 'milliseconds', origin: 'recorded-page-created', accuracy: 'approximate-not-frame-accurate', coordinateSystem: 'viewport-css-pixels' },
    actions: [], cursor: [], highlights: [], sceneMarkers: [], narrationCues: [], blockedRequests: 0, reviewRequired: true
  };
  let stopped: string | undefined;
  let closing = false;
  const execution = new AbortController();
  let work: Promise<void> | undefined;
  let active: Action | undefined;
  let expectedDialog: Extract<Action, { type: 'dialog' }> | undefined;
  let video: ReturnType<import('playwright').Page['video']>;
  let rejectStop!: (error: Error) => void;
  const stopPromise = new Promise<never>((_resolve, reject) => { rejectStop = reject; });
  // Rejection may arrive while cleanup is already in progress.
  void stopPromise.catch(() => {});
  const stop = (message: string) => { if (!stopped && !closing) { stopped = message; execution.abort(); rejectStop(new Error(message)); } };
  const abort = () => stop('Run cancelled by user');
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) abort();
  try {
    context = await browser.newContext({ viewport: project.viewport, recordVideo: { dir: path.join(runDir, 'capture'), size: project.viewport }, serviceWorkers: 'block', acceptDownloads: false, permissions: [], locale: 'en-US', timezoneId: 'UTC', reducedMotion: project.cursor.reducedMotion ? 'reduce' : 'no-preference' });
    await context.route('**/*', async route => {
      try {
        const request = route.request();
        await checkUrl(request.url(), project.network);
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) && (!active || !approved.has(active.id) || active.effect !== 'consequential')) throw new Error('Non-read request requires action approval');
        // route.fetch pins policy at every redirect hop instead of letting Chromium auto-follow.
        const response = await route.fetch({ maxRedirects: 0, timeout: project.pacing.actionTimeoutMs });
        const location = response.headers()['location'];
        if (location && response.status() >= 300 && response.status() < 400) await checkUrl(new URL(location, request.url()).href, project.network);
        await route.fulfill({ response });
      } catch {
        if (closing) { await route.abort().catch(() => {}); return; }
        timeline.blockedRequests++;
        await route.abort('blockedbyclient').catch(() => {});
        stop('Network policy blocked a request; check the origin allowlist and approvals');
      }
    });
    await context.routeWebSocket('**/*', ws => { ws.close(); timeline.blockedRequests++; stop('WebSockets are not permitted in this recording mode'); });
    await installOverlay(context, project);
    const page = await context.newPage(); start = performance.now(); video = page.video();
    await page.evaluate(selectors => { for (const selector of selectors) document.querySelector(selector); }, project.privacy.maskSelectors);
    page.setDefaultTimeout(project.pacing.actionTimeoutMs); page.setDefaultNavigationTimeout(project.pacing.actionTimeoutMs);
    context.on('page', popup => { if (popup !== page) { void popup.close().catch(() => {}); stop('Popup windows are not supported'); } });
    page.on('download', download => { void download.cancel().catch(() => {}); stop('Downloads are disabled; use an in-page preparation action'); });
    page.on('dialog', (dialog: Dialog) => {
      const expected = expectedDialog; expectedDialog = undefined;
      if (!expected || expected.dialogType !== dialog.type()) { void dialog.dismiss().catch(() => {}); stop('Unexpected browser dialog'); }
      else void (expected.response === 'accept' ? dialog.accept() : dialog.dismiss()).catch(() => stop('Dialog response failed'));
    });
    timer = setTimeout(() => stop('Recording duration limit exceeded'), project.recording.maxDurationMs);
    sizeTimer = setInterval(() => {
      void readdir(path.join(runDir, 'capture')).then(async files => {
        const sizes = await Promise.all(files.map(async file => (await stat(path.join(runDir, 'capture', file))).size));
        if (sizes.reduce((a, b) => a + b, 0) > project.recording.maxBytes) stop('Recording size limit exceeded');
      }).catch(() => {});
    }, 250);
    const cursor = new Cursor(page, project, timeline, now, execution.signal);
    const navigation: Action = { id: '_initial_navigation', type: 'navigate', url: project.url, effect: 'read' };
    if (project.actions.some(a => a.id === navigation.id)) throw new Error('Reserved action ID');
    const execute = async () => {
      for (const action of [navigation, ...project.actions]) {
        if (stopped) throw new Error(stopped);
        active = action;
        const entry: Timeline['actions'][number] = { id: action.id, type: action.type, ...('target' in action ? { target: action.target } : {}), startMs: now(), endMs: now(), result: 'failed' };
        timeline.actions.push(entry);
        try {
          if (action.type === 'dialog') {
            if (expectedDialog) throw new Error('Unconsumed expected dialog');
            expectedDialog = action;
          } else {
            if (action.label) { timeline.sceneMarkers.push({ actionId: action.id, atMs: now(), label: action.label }); await showLabel(page, action.label); }
            if (action.narration) timeline.narrationCues.push({ actionId: action.id, atMs: now(), text: action.narration });
            await delay(action.beforeMs ?? project.pacing.beforeMs, execution.signal);
            const screenshot = await executeAction(page, cursor, action, runDir, execution.signal);
            if (screenshot) entry.screenshot = screenshot;
            await delay(action.afterMs ?? project.pacing.afterMs, execution.signal);
          }
          if (stopped) throw new Error(stopped);
          entry.result = 'success';
        } catch {
          // Playwright diagnostics may contain fill values, DOM text or private URLs. Never persist them.
          entry.error = stopped ?? `Action ${action.id} (${action.type}) failed; check target visibility, page state and timeout`;
          throw new Error(entry.error);
        } finally { entry.endMs = now(); active = undefined; }
      }
      if (expectedDialog) throw new Error('Expected dialog was never shown');
      timeline.status = 'success';
    };
    work = execute(); void work.catch(() => {});
    await Promise.race([work, stopPromise]);
  } catch (error) {
    timeline.status = options.signal?.aborted ? 'cancelled' : 'failed';
    timeline.error = stopped ?? (error instanceof Error && /^Action [\w-]+ \([a-z]+\) failed/.test(error.message) ? error.message : 'Browser run failed; inspect the plan, dependencies and expected dialogs');
  } finally {
    closing = true; execution.abort();
    if (timer) clearTimeout(timer); if (sizeTimer) clearInterval(sizeTimer);
    options.signal?.removeEventListener('abort', abort);
    await context?.close().catch(() => { timeline.status = 'failed'; timeline.error = 'Recording context could not finalize'; });
    await browser.close().catch(() => {});
    await work?.catch(() => {});
    const unfinished = timeline.actions.find(a => a.result === 'failed');
    if (unfinished) { unfinished.endMs = now(); unfinished.error ??= timeline.error; }
    timeline.recording.durationMs = now();
    if (video!) {
      try {
        const raw = await video.path(); await rename(raw, await safePath(runDir, 'recording.webm'));
        Object.assign(timeline.recording, await validateVideo(path.join(runDir, 'recording.webm'), project.recording.maxBytes));
      } catch { timeline.recording.valid = false; }
    }
    if (!timeline.recording.valid) { timeline.status = 'failed'; timeline.error ??= 'Recording file is missing, invalid or exceeds size limit'; }
    await writeJson(await safePath(runDir, 'timeline.json'), timelineSchema.parse(timeline));
    // The reusable original plan stays with the user. The run copy contains no typed values or URL query strings.
    await writeJson(await safePath(runDir, 'project.json'), { schemaVersion: '1.0', projectId: project.projectId, title: project.title, objective: project.objective, sourceUrl: safeUrl(project.url), viewport: project.viewport, reviewRequired: true });
  }
  return { runDir, timeline };
}
