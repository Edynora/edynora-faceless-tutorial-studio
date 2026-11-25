import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createServer, type Server } from 'node:http';
import { mkdtemp, readFile, stat, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runProject } from '../packages/core/src/index.js';
import { createProject, projectSchema, timelineSchema } from '../packages/shared/src/schema.js';
import { exportProject, inspectRun } from '../packages/exporters/src/index.js';
import { fixtureHtml } from '../packages/browser/src/fixture.js';

let server: Server, origin: string, output: string;
let submissions = 0;
beforeAll(async () => {
  output = await mkdtemp(join(tmpdir(), 'edynora-run-'));
  server = createServer((req, res) => {
    if (req.url === '/submit') { submissions++; res.end('submitted'); return; }
    if (req.url === '/redirect') { res.writeHead(302, { location: 'http://169.254.169.254/latest' }); res.end(); return; }
    res.setHeader('Content-Type', 'text/html'); res.end(fixtureHtml);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  origin = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())); });
function plan() {
  const p = createProject(origin, 'Local dashboard tutorial', 'Find and filter reports');
  p.network.allowLoopback = true; p.outputDir = output;
  p.pacing = { beforeMs: 20, afterMs: 40, actionTimeoutMs: 1500 };
  p.cursor.speed = 5000;
  return p;
}
describe('real Chromium recording workflow', () => {
  it('records deterministic actions, cursor, screenshot, timeline and portable export', async () => {
    const p = plan();
    p.actions = projectSchema.shape.actions.parse([
      { id: 'reports', type: 'click', target: { by: 'role', role: 'button', name: 'Reports' }, label: 'Open reports', narration: 'Open the reports panel.' },
      { id: 'ready', type: 'wait', target: { by: 'role', role: 'heading', name: 'Reports' } },
      { id: 'filter', type: 'type', target: { by: 'label', value: 'Filter reports' }, value: 'Revenue' },
      { id: 'period', type: 'select', target: { by: 'label', value: 'Period' }, value: 'month' },
      { id: 'hover', type: 'hover', target: { by: 'text', value: 'Revenue report' } },
      { id: 'check', type: 'assert', target: { by: 'testId', value: 'report-list' }, text: 'Revenue report' },
      { id: 'shot', type: 'screenshot' },
      { id: 'scroll', type: 'scroll', y: 300 },
      { id: 'hold', type: 'pause', ms: 200 },
      { id: 'back', type: 'navigate', url: origin },
      { id: 'dialog', type: 'dialog', response: 'dismiss', dialogType: 'confirm' },
      { id: 'show', type: 'click', target: { by: 'role', role: 'button', name: 'Show dialog' } }
    ]);
    const result = await runProject(p);
    expect(result.timeline.status).toBe('success');
    expect(result.timeline.actions).toHaveLength(13);
    expect(result.timeline.recording.valid).toBe(true);
    expect((await stat(join(result.runDir, 'recording.webm'))).size).toBeGreaterThan(1000);
    expect(result.timeline.cursor.some(c => c.kind === 'click' && c.actionId === 'reports')).toBe(true);
    for (const c of result.timeline.cursor) { expect(c.x).toBeGreaterThanOrEqual(0); expect(c.x).toBeLessThanOrEqual(1280); expect(c.y).toBeLessThanOrEqual(720); }
    expect(result.timeline.highlights.length).toBeGreaterThan(2);
    expect(result.timeline.narrationCues[0]?.text).toBe('Open the reports panel.');
    expect(timelineSchema.safeParse(result.timeline).success).toBe(true);
    const json = await readFile(join(result.runDir, 'timeline.json'), 'utf8');
    expect(json).not.toContain('"value": "Revenue"');
    const dest = join(output, 'export-success');
    const manifest = await exportProject(result.runDir, dest);
    expect(manifest.format).toBe('edynora-tutorial/1');
    expect(manifest.assets.some(a => a.path === 'screenshots/shot.png')).toBe(true);
    expect((await inspectRun(dest)).status).toBe('success');
    await expect(exportProject(result.runDir, dest)).rejects.toThrow();
    await unlink(join(dest, 'screenshots/shot.png'));
    await expect(inspectRun(dest)).rejects.toThrow();
  });
  it('stops after an action failure and finalizes a failed recording', async () => {
    const p = plan();
    p.actions = projectSchema.shape.actions.parse([
      { id: 'missing', type: 'click', target: { by: 'text', value: 'absent-secret-token-value' } },
      { id: 'unreachable', type: 'pause', ms: 100 }
    ]);
    const r = await runProject(p);
    expect(r.timeline.status).toBe('failed');
    expect(r.timeline.actions).toHaveLength(2); // initial navigation + failed action
    expect(r.timeline.actions.at(-1)?.result).toBe('failed');
    expect(r.timeline.error).not.toContain('absent-secret-token-value');
    expect(r.timeline.recording.valid).toBe(true);
    await expect(exportProject(r.runDir, join(output, 'failed-export'))).rejects.toThrow();
  });
  it('requires explicit approval before a consequential action and blocks implicit POST', async () => {
    const p = plan();
    p.actions = projectSchema.shape.actions.parse([{ id: 'send', type: 'click', target: { by: 'role', role: 'button', name: 'Submit test data' }, effect: 'consequential' }]);
    await expect(runProject(p)).rejects.toThrow(/approval/i);
    expect(submissions).toBe(0);
    p.actions[0]!.effect = 'read';
    const blocked = await runProject(p);
    expect(blocked.timeline.status).toBe('failed');
    expect(blocked.timeline.blockedRequests).toBeGreaterThan(0);
    expect(submissions).toBe(0);
    p.actions[0]!.effect = 'consequential';
    const allowed = await runProject(p, { approvedActionIds: ['send'] });
    expect(allowed.timeline.status).toBe('success');
    expect(submissions).toBe(1);
  });
  it('blocks redirects to metadata services', async () => {
    const p = plan(); p.url = origin + '/redirect';
    const r = await runProject(p);
    expect(r.timeline.status).toBe('failed'); expect(r.timeline.blockedRequests).toBeGreaterThan(0);
  });
  it('does not invent a click event when a disabled element cannot be clicked', async () => {
    const p = plan();
    p.actions = projectSchema.shape.actions.parse([{ id: 'disabled', type: 'click', target: { by: 'css', value: '#disabled' } }]);
    const r = await runProject(p);
    expect(r.timeline.status).toBe('failed');
    expect(r.timeline.cursor.filter(c => c.kind === 'click')).toHaveLength(0);
  });
  it('enforces duration budget and preserves the partial timeline', async () => {
    const p = plan(); p.recording.maxDurationMs = 1000;
    p.actions = projectSchema.shape.actions.parse([{ id: 'long', type: 'pause', ms: 60000 }]);
    const start = performance.now(); const r = await runProject(p);
    expect(r.timeline.status).toBe('failed'); expect(r.timeline.error).toContain('duration');
    expect(performance.now() - start).toBeLessThan(10000);
    const snapshot = JSON.stringify(r.timeline);
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(JSON.stringify(r.timeline)).toBe(snapshot);
  });
  it('honors cancellation arriving during browser launch and settles all execution', async () => {
    const p = plan(); p.actions = projectSchema.shape.actions.parse([{ id: 'hold', type: 'pause', ms: 60000 }]);
    const controller = new AbortController();
    const pending = runProject(p, { signal: controller.signal });
    const timer = setTimeout(() => controller.abort(), 50);
    try {
      const r = await pending;
      expect(r.timeline.status).toBe('cancelled');
      expect(r.timeline.actions.every(a => a.result !== 'success' || a.id !== 'hold')).toBe(true);
    } finally { clearTimeout(timer); }
  }, 10000);
  it('rejects over-budget finalized recordings and prevents export', async () => {
    const p = plan(); p.recording.maxBytes = 1024;
    p.actions = projectSchema.shape.actions.parse([{ id: 'hold', type: 'pause', ms: 300 }]);
    const r = await runProject(p);
    expect(r.timeline.status).toBe('failed'); expect(r.timeline.recording.valid).toBe(false);
    await expect(exportProject(r.runDir, join(output, 'oversize-export'))).rejects.toThrow();
  });
});
