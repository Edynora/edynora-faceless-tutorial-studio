// SPDX-License-Identifier: Apache-2.0
import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import path from 'node:path';
const root = process.env.EDYNORA_STUDIO_ROOT;
const allowed = new Set(['init', 'validate', 'run', 'record', 'inspect', 'export', 'doctor', 'demo', '--help']);
if (!root || !path.isAbsolute(root) || !allowed.has(process.argv[2])) {
  console.log(JSON.stringify({ ok: false, error: 'Set EDYNORA_STUDIO_ROOT to an absolute built checkout path and use a supported CLI command' })); process.exitCode = 2;
} else {
  const cli = path.join(root, 'dist', 'packages', 'cli', 'src', 'index.js');
  try {
    await access(cli);
    const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], { shell: false, stdio: 'inherit', windowsHide: true });
    child.once('error', () => { console.log(JSON.stringify({ ok: false, error: 'Could not launch Studio CLI' })); process.exitCode = 2; });
    child.once('exit', (code, signal) => { process.exitCode = signal ? 130 : code ?? 1; });
  } catch { console.log(JSON.stringify({ ok: false, error: 'Build Studio with npm run build before using the adapter' })); process.exitCode = 2; }
}
