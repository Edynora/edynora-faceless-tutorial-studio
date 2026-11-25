#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
import { parseArgs } from 'node:util';
import path from 'node:path';
import { createServer } from 'node:http';
import { access } from 'node:fs/promises';
import { chromium } from 'playwright';
import { ZodError } from 'zod';
import { createProject, projectSchema, runProject } from '../../core/src/index.js';
import { readJson, writeJson, assertNoSymlinks, ensureRoot, safePath } from '../../shared/src/files.js';
import { validateNetwork } from '../../privacy/src/index.js';
import { exportProject, inspectRun } from '../../exporters/src/index.js';
import { fixtureHtml } from '../../browser/src/fixture.js';

const HELP = `Edynora Faceless Tutorial Studio 0.1.0
Automate. Demonstrate. Record. Teach.

init <project.json> --url <https://...> [--title <text>] [--objective <text>]
validate <project.json> [--offline]
run|record <project.json> [--headed] [--approve <action-id>] (repeatable)
inspect <run-or-package-directory>
export <run-directory> --out <new-directory> [--footage-only]
doctor
fixture [--port 4173]
demo [--output output/demo] [--headed]

All commands emit JSON. Exit 0 success, 1 run/dependency failure,
2 invalid input/policy/file error, 130 cancellation. Review before publishing.`;
const definitions: Record<string, Record<string, { type: 'string' | 'boolean'; multiple?: boolean }>> = {
  init: { url: { type: 'string' }, title: { type: 'string' }, objective: { type: 'string' } },
  validate: { offline: { type: 'boolean' } },
  run: { headed: { type: 'boolean' }, approve: { type: 'string', multiple: true } },
  record: { headed: { type: 'boolean' }, approve: { type: 'string', multiple: true } },
  inspect: {}, export: { out: { type: 'string' }, 'footage-only': { type: 'boolean' } },
  doctor: {}, fixture: { port: { type: 'string' } }, demo: { output: { type: 'string' }, headed: { type: 'boolean' } }
};
function emit(value: unknown) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }
function required(value: unknown, name: string): string { if (typeof value !== 'string' || !value) throw new Error(`Missing ${name}`); return value; }
async function serve(port: number) {
  const server = createServer((req, res) => {
    if (req.method !== 'GET' || !['/', '/dashboard'].includes((req.url ?? '').split('?')[0]!)) { res.writeHead(404); res.end('Not found'); return; }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store'); res.end(fixtureHtml);
  });
  await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  const address = server.address() as { port: number };
  return { server, url: `http://127.0.0.1:${address.port}` };
}
async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === '--help' || command === 'help') { emit({ ok: true, help: HELP }); return; }
  const options = definitions[command]; if (!options) throw new Error('Unknown command; use --help');
  const { positionals, values } = parseArgs({ args, options, allowPositionals: true, strict: true });
  const expected = ['init', 'validate', 'run', 'record', 'inspect', 'export'].includes(command) ? 1 : 0;
  if (positionals.length !== expected) throw new Error(`Expected ${expected} positional argument(s)`);
  const file = positionals[0];
  switch (command) {
    case 'init': {
      const url = required(values.url, '--url'); const u = new URL(url);
      if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new Error('URL must use HTTP(S) without credentials');
      const project = createProject(url, String(values.title ?? 'Untitled tutorial'), String(values.objective ?? 'Demonstrate a browser workflow'));
      await assertNoSymlinks(path.resolve(file!)); await writeJson(path.resolve(file!), project, true);
      emit({ ok: true, project: path.resolve(file!), message: 'Edit actions, origins and privacy masks, then validate before recording' }); return;
    }
    case 'validate': {
      const project = projectSchema.parse(await readJson(file!));
      if (!values.offline) await validateNetwork(project);
      emit({ ok: true, projectId: project.projectId, actions: project.actions.length, networkChecked: !values.offline }); return;
    }
    case 'run': case 'record': {
      const project = projectSchema.parse(await readJson(file!));
      const controller = new AbortController(), cancel = () => controller.abort();
      process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
      try {
        const result = await runProject(project, { baseDir: path.dirname(path.resolve(file!)), headed: !!values.headed, approvedActionIds: values.approve as string[] | undefined, signal: controller.signal });
        emit({ ok: result.timeline.status === 'success', runDir: result.runDir, status: result.timeline.status, error: result.timeline.error, reviewRequired: true });
        process.exitCode = result.timeline.status === 'cancelled' ? 130 : result.timeline.status === 'success' ? 0 : 1;
      } finally { process.off('SIGINT', cancel); process.off('SIGTERM', cancel); }
      return;
    }
    case 'inspect': {
      const timeline = await inspectRun(file!);
      emit({ ok: true, status: timeline.status, recording: timeline.recording, actions: timeline.actions, reviewRequired: true }); return;
    }
    case 'export': {
      const destination = required(values.out, '--out');
      const manifest = await exportProject(file!, destination, !!values['footage-only']);
      emit({ ok: true, output: path.resolve(destination), assets: manifest.assets.length, footageOnly: !!values['footage-only'], workflowCompatibility: 'unverified', reviewRequired: true }); return;
    }
    case 'doctor': {
      let browserInstalled = false, launchable = false;
      try { await access(chromium.executablePath()); browserInstalled = true; const b = await chromium.launch({ headless: true, chromiumSandbox: true }); await b.close(); launchable = true; } catch { /* Return actionable dependency status without raw diagnostics. */ }
      emit({ ok: launchable, node: process.version, platform: process.platform, browserInstalled, launchable, install: 'npx playwright install chromium', recordingFormat: 'WebM (browser-selected codec)', modelRequired: false });
      process.exitCode = launchable ? 0 : 1; return;
    }
    case 'fixture': {
      const port = Number(values.port ?? '4173'); if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port must be an integer from 1024 to 65535');
      const { server, url } = await serve(port);
      emit({ ok: true, url, message: 'Synthetic local fixture; Ctrl+C to stop' });
      process.once('SIGINT', () => server.close()); process.once('SIGTERM', () => server.close()); return;
    }
    case 'demo': {
      const root = await ensureRoot(String(values.output ?? 'output/demo'));
      const { server, url } = await serve(0);
      const controller = new AbortController(), cancel = () => controller.abort();
      process.once('SIGINT', cancel); process.once('SIGTERM', cancel);
      try {
        const p = createProject(url, 'Edynora local dashboard tutorial', 'Open Reports, filter Revenue, select a period and prepare a report.');
        p.network.allowLoopback = true; p.outputDir = root; p.privacy.maskSelectors = ['[data-private]'];
        p.actions = projectSchema.shape.actions.parse([
          { id: 'intro', type: 'pause', ms: 600, label: 'Explore the dashboard' },
          { id: 'reports', type: 'click', target: { by: 'role', role: 'button', name: 'Reports' }, label: 'Open Reports', narration: 'Open Reports from the navigation bar.' },
          { id: 'filter', type: 'type', target: { by: 'label', value: 'Filter reports' }, value: 'Revenue', label: 'Filter the report list' },
          { id: 'period', type: 'select', target: { by: 'label', value: 'Period' }, value: 'month', label: 'Choose This month' },
          { id: 'prepare', type: 'click', target: { by: 'role', role: 'button', name: 'Prepare report' }, label: 'Prepare a report for review' }
        ]);
        p.actions.push(...projectSchema.shape.actions.parse([
          { id: 'verify', type: 'assert', target: { by: 'css', value: '#status' }, text: 'Report prepared for review' },
          { id: 'preview', type: 'screenshot', label: 'Ready to teach' },
          { id: 'hold', type: 'pause', ms: 1000 }
        ]));
        const manifestPath = await safePath(root, `demo-project-${p.projectId}.json`); await writeJson(manifestPath, p, true);
        const result = await runProject(p, { headed: !!values.headed, signal: controller.signal });
        emit({ ok: result.timeline.status === 'success', status: result.timeline.status, runDir: result.runDir, project: manifestPath, error: result.timeline.error, reviewRequired: true });
        process.exitCode = result.timeline.status === 'success' ? 0 : result.timeline.status === 'cancelled' ? 130 : 1;
      } finally {
        process.off('SIGINT', cancel); process.off('SIGTERM', cancel);
        await new Promise<void>(resolve => server.close(() => resolve()));
      }
      return;
    }
  }
}
main().catch(error => {
  // Do not echo browser diagnostics, plan values, URLs, or paths in errors.
  const message = error instanceof ZodError ? 'Invalid input schema; consult the project schema and examples' : error instanceof Error && /^(Missing |Unknown command|Expected \d|URL must |Port must |Explicit approval|Only successful|Export destination|Unsafe relative|Symlink paths|URL origin|Private, loopback|Credential query)/.test(error.message) ? error.message : (error as NodeJS.ErrnoException).code === 'EEXIST' ? 'Destination already exists; choose a new path' : 'Operation failed; check input, dependencies, file permissions and documented security policy';
  emit({ ok: false, error: message }); process.exitCode = 2;
});
