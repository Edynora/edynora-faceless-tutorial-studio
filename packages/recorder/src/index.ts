// SPDX-License-Identifier: Apache-2.0
import { open, stat } from 'node:fs/promises';
export async function validateVideo(file: string, maxBytes = Number.MAX_SAFE_INTEGER): Promise<{ bytes: number; valid: boolean }> {
  const s = await stat(file);
  if (!s.isFile() || s.size < 256 || s.size > maxBytes) return { bytes: s.size, valid: false };
  const handle = await open(file, 'r');
  try {
    const header = Buffer.alloc(4096); await handle.read(header, 0, header.length, 0);
    return { bytes: s.size, valid: header.readUInt32BE(0) === 0x1a45dfa3 && header.includes(Buffer.from('webm')) };
  } finally { await handle.close(); }
}
