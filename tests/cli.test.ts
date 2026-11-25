import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const cli = resolve('dist/packages/cli/src/index.js');
function run(args: string[]) { const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', timeout: 30000 }); return { status: r.status, body: JSON.parse(r.stdout || '{}'), stderr: r.stderr }; }
describe('CLI contract', () => {
  it('initializes a valid manifest, refuses overwrite and emits structured errors', async () => {
    const root = await mkdtemp(join(tmpdir(), 'edynora-cli-')), file = join(root, 'project.json');
    const r = run(['init', file, '--url', 'https://example.com', '--title', 'A demo', '--objective', 'Teach']);
    expect(r.status).toBe(0); expect(JSON.parse(await readFile(file, 'utf8')).title).toBe('A demo');
    expect(run(['init', file, '--url', 'https://example.com']).status).toBe(2);
    const bad = run(['invalid-command']); expect(bad.status).toBe(2); expect(bad.body.ok).toBe(false);
    expect(run(['init', join(root, 'bad.json'), '--url', 'file:///secret']).status).toBe(2);
  });
  it('validates schemas offline and rejects unknown flags', async () => {
    const root = await mkdtemp(join(tmpdir(), 'edynora-cli-')), file = join(root, 'project.json');
    run(['init', file, '--url', 'https://example.com']);
    expect(run(['validate', file, '--offline']).body.ok).toBe(true);
    expect(run(['validate', file, '--offlien']).status).toBe(2);
    await writeFile(file, '{}'); expect(run(['validate', file, '--offline']).status).toBe(2);
  });
  it('runs the full local demo and exports a portable package', () => {
    const r = run(['demo', '--output', 'test-output/cli-demo']);
    expect(r.status, JSON.stringify(r.body)).toBe(0);
    expect(r.body.status).toBe('success');
    expect(run(['inspect', r.body.runDir]).body.status).toBe('success');
    const exported = run(['export', r.body.runDir, '--out', r.body.runDir + '-package']);
    expect(exported.status).toBe(0); expect(exported.body.assets).toBeGreaterThan(3);
    expect(run(['inspect', r.body.runDir + '-package']).status).toBe(0);
  });
});
