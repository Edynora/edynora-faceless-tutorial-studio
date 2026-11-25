import { describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
function bridge(args: string[], env: NodeJS.ProcessEnv) { const r = spawnSync(process.execPath, ['scripts/claude-adapter.mjs', ...args], { encoding: 'utf8', env, timeout: 15000 }); return { status: r.status, body: JSON.parse(r.stdout || '{}') }; }
describe('Claude adapter execution without a model call', () => {
  it('invokes core CLI with literal arguments including spaces and shell metacharacters', async () => {
    const root = await mkdtemp(join(tmpdir(), 'edynora adapter '));
    const manifest = join(root, 'project & literal.json');
    const env = { ...process.env, EDYNORA_STUDIO_ROOT: resolve('.') };
    expect(bridge(['init', manifest, '--url', 'https://example.com', '--title', 'literal $(text) & title'], env).status).toBe(0);
    expect(bridge(['validate', manifest, '--offline'], env).body.ok).toBe(true);
  });
  it('rejects missing configuration and unsupported commands', () => {
    expect(bridge(['doctor'], { ...process.env, EDYNORA_STUDIO_ROOT: '' }).status).toBe(2);
    expect(bridge(['arbitrary-command'], { ...process.env, EDYNORA_STUDIO_ROOT: resolve('.') }).status).toBe(2);
  });
});
