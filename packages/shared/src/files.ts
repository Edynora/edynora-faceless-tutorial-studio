// SPDX-License-Identifier: Apache-2.0
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function assertNoSymlinks(target: string): Promise<void> {
  const absolute = path.resolve(target);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    try { if ((await lstat(current)).isSymbolicLink()) throw new Error('Symlink paths are not permitted'); }
    catch (e) { if ((e as NodeJS.ErrnoException).code === 'ENOENT') break; throw e; }
  }
}
export async function safePath(root: string, relative: string): Promise<string> {
  if (!relative || relative.includes('\\') || relative.includes(':') || path.isAbsolute(relative) || relative.split('/').some(p => p === '..' || p === '.' || !p || /[<>"|?*\x00-\x1f]/.test(p) || /[. ]$/.test(p) || /^(con|prn|aux|nul|com\d|lpt\d)(\.|$)/i.test(p))) throw new Error('Unsafe relative path');
  const target = path.resolve(root, relative);
  if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error('Path escapes selected root');
  await assertNoSymlinks(target);
  return target;
}
export async function ensureRoot(root: string): Promise<string> {
  const absolute = path.resolve(root);
  await assertNoSymlinks(absolute);
  await mkdir(absolute, { recursive: true });
  return absolute;
}
export async function writeJson(file: string, value: unknown, exclusive = false): Promise<void> {
  await assertNoSymlinks(file);
  await writeFile(file, JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', flag: exclusive ? 'wx' : 'w' });
}
export async function readJson(file: string): Promise<unknown> {
  await assertNoSymlinks(file);
  const s = await lstat(file);
  if (!s.isFile() || s.size > 5_000_000) throw new Error('JSON must be a regular file smaller than 5 MB');
  return JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, '')) as unknown;
}
