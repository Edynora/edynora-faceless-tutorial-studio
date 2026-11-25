// SPDX-License-Identifier: Apache-2.0
import { copyFile, mkdir, readFile, stat, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { timelineSchema, assetManifestSchema, type Timeline } from '../../shared/src/schema.js';
import { assertNoSymlinks, ensureRoot, readJson, safePath, writeJson } from '../../shared/src/files.js';
import { validateVideo } from '../../recorder/src/index.js';
async function hashFile(file: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest('hex');
}

export async function inspectRun(root: string): Promise<Timeline> {
  const timeline = timelineSchema.parse(await readJson(await safePath(root, 'timeline.json')));
  const video = await validateVideo(await safePath(root, timeline.recording.file));
  if (!video.valid || video.bytes !== timeline.recording.bytes) throw new Error('Recording does not match the timeline');
  let manifestInput: unknown;
  try { manifestInput = await readJson(await safePath(root, 'assets.json')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (manifestInput !== undefined) {
    const manifest = assetManifestSchema.parse(manifestInput);
    if (manifest.projectId !== timeline.projectId) throw new Error('Export project ID does not match timeline');
    const names = new Set<string>();
    for (const asset of manifest.assets) {
      if (names.has(asset.path)) throw new Error('Duplicate asset path'); names.add(asset.path);
      const file = await safePath(root, asset.path);
      if (!(await stat(file)).isFile() || (await stat(file)).size !== asset.bytes || await hashFile(file) !== asset.sha256) throw new Error('Asset integrity check failed');
    }
    for (const required of ['project.json', 'timeline.json', 'recording.webm']) if (!names.has(required)) throw new Error('Required asset missing');
    for (const action of timeline.actions) if (action.screenshot && !names.has(action.screenshot)) throw new Error('Screenshot missing from asset manifest');
  }
  return timeline;
}

export async function exportProject(source: string, destination: string, footageOnly = false) {
  const timeline = await inspectRun(source);
  if (timeline.status !== 'success') throw new Error('Only successful recordings may be exported; inspect the failed run');
  const dest = path.resolve(destination);
  await assertNoSymlinks(dest);
  if (dest === path.resolve(source) || dest.startsWith(path.resolve(source) + path.sep)) throw new Error('Export must be outside the run directory');
  try { await lstat(dest); throw new Error('Export destination already exists'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await ensureRoot(path.dirname(dest)); await mkdir(dest);
  const files = footageOnly ? ['recording.webm'] : ['project.json', 'timeline.json', 'recording.webm', ...timeline.actions.flatMap(a => a.screenshot ? [a.screenshot] : [])];
  const assets: { path: string; bytes: number; sha256: string }[] = [];
  for (const file of [...new Set(files)]) {
    if (!['project.json', 'timeline.json', 'recording.webm'].includes(file) && !/^screenshots\/[a-zA-Z0-9_-]{1,80}\.png$/.test(file)) throw new Error('Unexpected asset path');
    const from = await safePath(source, file), to = await safePath(dest, file);
    if (!(await stat(from)).isFile()) throw new Error('Asset must be a regular file');
    await mkdir(path.dirname(to), { recursive: true }); await copyFile(from, to);
    assets.push({ path: file, bytes: (await stat(to)).size, sha256: await hashFile(to) });
  }
  const manifest = { format: 'edynora-tutorial/1' as const, schemaVersion: '1.0' as const, projectId: timeline.projectId, workflowCompatibility: 'unverified' as const, reviewRequired: true as const, assets };
  if (!footageOnly) { assetManifestSchema.parse(manifest); await writeJson(await safePath(dest, 'assets.json'), manifest, true); }
  return manifest;
}
