// SPDX-License-Identifier: Apache-2.0
import { readFile, readdir, mkdir, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const rows = [];
for (const [location, entry] of Object.entries(lock.packages)) {
  if (!location) continue;
  let pkg;
  try { pkg = JSON.parse(await readFile(path.join(location, 'package.json'), 'utf8')); }
  catch (e) { if (e.code === 'ENOENT' && entry.optional) { rows.push({ location, version: entry.version, license: entry.license ?? 'not declared in lockfile', installed: false, optional: true }); continue; } throw e; }
  const dest = path.join('docs/licenses', location.replaceAll('/', '__'));
  const notices = [];
  async function collect(dir, relative = '') {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const rel = path.join(relative, item.name);
      if (item.isDirectory()) { if (!['node_modules', '.git'].includes(item.name)) await collect(path.join(dir, item.name), rel); }
      else if (/license|notice|copying/i.test(item.name) && !/\.(?:js|mjs|cjs|ts|map|json)$/.test(item.name)) {
        const target = path.join(dest, rel); await mkdir(path.dirname(target), { recursive: true }); await copyFile(path.join(dir, item.name), target); notices.push(rel.replaceAll('\\', '/'));
      }
    }
  }
  await collect(location);
  rows.push({ location, name: pkg.name, version: pkg.version, license: pkg.license ?? 'UNDECLARED', installed: true, dev: !!entry.dev, optional: !!entry.optional, notices });
}
await writeFile('docs/dependency-licenses.json', JSON.stringify(rows, null, 2) + '\n');
console.log(JSON.stringify({ installed: rows.filter(r => r.installed).length, optionalNotInstalled: rows.filter(r => !r.installed).length, undeclared: rows.filter(r => r.installed && r.license === 'UNDECLARED').map(r => r.name), licenses: [...new Set(rows.filter(r => r.installed).map(r => r.license))] }));
