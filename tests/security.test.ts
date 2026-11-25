import { describe, expect, it } from 'vitest';
import { projectSchema, createProject } from '../packages/shared/src/schema.js';
import { checkUrl, isPublicAddress, safeUrl } from '../packages/privacy/src/index.js';
import { safePath } from '../packages/shared/src/files.js';
import { mkdtemp, mkdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('network boundaries', () => {
  it.each(['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.2', '169.254.169.254', '0.0.0.0', '100.64.0.1', '224.0.0.1', '::1', '::', 'fc00::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1', '2001:0db8::1', '2001:20::1', '2001:30::1', '192.88.99.1'])('rejects nonpublic address %s', ip => expect(isPublicAddress(ip)).toBe(false));
  it.each(['8.8.8.8', '1.1.1.1', '2606:4700:4700::1111'])('permits public address %s', ip => expect(isPublicAddress(ip)).toBe(true));
  it('rejects local file, credential and unlisted URLs', async () => {
    for (const url of ['file:///C:/secret', 'https://user:password@example.com', 'http://127.0.0.1:9999', 'https://other.example']) {
      await expect(checkUrl(url, { allowedOrigins: ['https://example.com'], allowLoopback: false })).rejects.toThrow();
    }
  });
  it('only permits numeric loopback when explicitly allowed and listed', async () => {
    await expect(checkUrl('http://127.0.0.1:3000/demo', { allowedOrigins: ['http://127.0.0.1:3000'], allowLoopback: true })).resolves.toBeDefined();
    await expect(checkUrl('http://192.168.0.1', { allowedOrigins: ['http://192.168.0.1'], allowLoopback: true })).rejects.toThrow();
  });
  it('strips query, credentials and fragment from diagnostic URLs', () => expect(safeUrl('https://u:secret@example.com/path?token=abc#secret')).toBe('https://example.com/path'));
});

describe('manifest boundary', () => {
  it('creates reusable defaults and rejects unstructured natural-language actions', () => {
    const p = createProject('https://example.com', 'Demo', 'Teach navigation');
    expect(projectSchema.parse(p).schemaVersion).toBe('1.0');
    expect(projectSchema.safeParse({ ...p, actions: ['Click the reports'] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...p, recording: { ...p.recording, width: 0 } }).success).toBe(false);
  });
  it('rejects duplicate action IDs and mismatched recording coordinates', () => {
    const p = createProject('https://example.com', 'Demo', 'Teach navigation');
    expect(projectSchema.safeParse({ ...p, actions: [{ id: 'x', type: 'pause', ms: 0 }, { id: 'x', type: 'pause', ms: 0 }] }).success).toBe(false);
    expect(projectSchema.safeParse({ ...p, recording: { ...p.recording, width: 800 } }).success).toBe(false);
  });
});

describe('filesystem boundary', () => {
  it('rejects traversal and absolute paths', async () => {
    const root = await mkdtemp(join(tmpdir(), 'edynora-path-'));
    for (const p of ['../outside', '/absolute', 'C:\\outside', '..\\outside']) await expect(safePath(root, p)).rejects.toThrow();
    expect(await safePath(root, 'shots/one.png')).toBe(join(root, 'shots', 'one.png'));
  });
  it('rejects a symlink parent', async () => {
    const root = await mkdtemp(join(tmpdir(), 'edynora-link-'));
    const outside = await mkdtemp(join(tmpdir(), 'edynora-outside-'));
    await mkdir(join(root, 'assets'));
    await symlink(outside, join(root, 'assets', 'linked'), 'junction');
    await expect(safePath(root, 'assets/linked/leak.png')).rejects.toThrow();
  });
});
