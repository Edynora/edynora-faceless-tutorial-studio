// SPDX-License-Identifier: Apache-2.0
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import type { Project } from '../../shared/src/schema.js';

function ipv4Number(ip: string): number { return ip.split('.').reduce((n, s) => n * 256 + Number(s), 0); }
export function isPublicAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const n = ipv4Number(ip);
    const denied: [string, number][] = [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3]];
    return !denied.some(([base, bits]) => Math.floor(n / 2 ** (32 - bits)) === Math.floor(ipv4Number(base) / 2 ** (32 - bits)));
  }
  // Conservative global-unicast IPv6 only. Exclude transition, mapped and documentation ranges.
  if (isIP(ip) === 6) {
    const [first, second] = ip.split(':').map(s => parseInt(s || '0', 16));
    return first !== undefined && first >= 0x2000 && first <= 0x3fff && first !== 0x2002 && first !== 0x3fff && !(first === 0x2001 && (second! < 0x200 || second === 0xdb8));
  }
  return false;
}
export function safeUrl(raw: string): string {
  try { const u = new URL(raw); return `${u.origin}${u.pathname}`; } catch { return '[invalid URL]'; }
}
export function redact(message: string): string {
  return message.replace(/https?:\/\/[^\s"'<>]+/g, m => safeUrl(m)).replace(/(password|token|secret|api[_-]?key|authorization)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]');
}
export async function checkUrl(raw: string, policy: Project['network']): Promise<URL> {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error('Invalid URL'); }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw new Error('Only HTTP(S) URLs without credentials are permitted');
  if ([...u.searchParams.keys()].some(k => /password|token|secret|api.?key|authorization/i.test(k))) throw new Error('Credential query parameters are forbidden');
  if (!policy.allowedOrigins.includes(u.origin)) throw new Error('URL origin is not on the explicit allowlist');
  const host = u.hostname.replace(/^\[|\]$/g, '');
  if (policy.allowLoopback && (host === '127.0.0.1' || host === '::1')) return u;
  const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(a => !isPublicAddress(a.address))) throw new Error('Private, loopback or reserved destination is blocked');
  return u;
}
export async function validateNetwork(project: Project): Promise<void> {
  for (const origin of project.network.allowedOrigins) await checkUrl(origin, project.network);
  await checkUrl(project.url, project.network);
  for (const action of project.actions) if (action.type === 'navigate') await checkUrl(action.url, project.network);
}
