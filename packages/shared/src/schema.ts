// SPDX-License-Identifier: Apache-2.0
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const dimension = z.number().int().min(320).max(3840);
const id = z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/);
const milliseconds = z.number().int().min(0).max(60000);
export const locatorSchema = z.discriminatedUnion('by', [
  z.object({ by: z.literal('role'), role: z.enum(['button', 'link', 'textbox', 'combobox', 'checkbox', 'heading', 'tab', 'menuitem', 'radio', 'option', 'switch']), name: z.string().min(1).max(500) }).strict(),
  z.object({ by: z.literal('label'), value: z.string().min(1).max(500) }).strict(),
  z.object({ by: z.literal('text'), value: z.string().min(1).max(500) }).strict(),
  z.object({ by: z.literal('testId'), value: z.string().min(1).max(500) }).strict(),
  z.object({ by: z.literal('css'), value: z.string().min(1).max(500) }).strict()
]);
const base = {
  id, label: z.string().max(200).optional(), narration: z.string().max(2000).optional(),
  beforeMs: milliseconds.optional(), afterMs: milliseconds.optional(),
  effect: z.enum(['read', 'consequential']).default('read')
};
export const actionSchema = z.discriminatedUnion('type', [
  z.object({ ...base, type: z.literal('navigate'), url: z.url() }).strict(),
  ...(['click', 'hover', 'wait'] as const).map(type => z.object({ ...base, type: z.literal(type), target: locatorSchema }).strict()),
  z.object({ ...base, type: z.literal('type'), target: locatorSchema, value: z.string().max(10000) }).strict(),
  z.object({ ...base, type: z.literal('select'), target: locatorSchema, value: z.string().max(500) }).strict(),
  z.object({ ...base, type: z.literal('scroll'), x: z.number().int().min(-10000).max(10000).default(0), y: z.number().int().min(-10000).max(10000) }).strict(),
  z.object({ ...base, type: z.literal('assert'), target: locatorSchema, text: z.string().max(1000).optional() }).strict(),
  z.object({ ...base, type: z.literal('screenshot') }).strict(),
  z.object({ ...base, type: z.literal('pause'), ms: milliseconds }).strict(),
  z.object({ ...base, type: z.literal('dialog'), response: z.enum(['accept', 'dismiss']), dialogType: z.enum(['alert', 'confirm', 'prompt', 'beforeunload']) }).strict()
]);
export const projectSchema = z.object({
  schemaVersion: z.literal('1.0'), projectId: id,
  title: z.string().min(1).max(200), objective: z.string().min(1).max(2000),
  url: z.url(), outputDir: z.string().min(1).max(1000).default('output'),
  viewport: z.object({ width: dimension, height: dimension }).strict(),
  recording: z.object({ width: dimension, height: dimension, maxDurationMs: z.number().int().min(1000).max(3600000), maxBytes: z.number().int().min(1024).max(2_000_000_000) }).strict(),
  network: z.object({ allowedOrigins: z.array(z.url()).min(1).max(50), allowLoopback: z.boolean().default(false) }).strict(),
  privacy: z.object({ maskSelectors: z.array(z.string().min(1).max(500)).max(50).default([]) }).strict(),
  cursor: z.object({ enabled: z.boolean(), size: z.number().min(12).max(80), speed: z.number().min(50).max(5000), trail: z.boolean(), clickAnimation: z.boolean(), reducedMotion: z.boolean() }).strict(),
  pacing: z.object({ beforeMs: milliseconds, afterMs: milliseconds, actionTimeoutMs: z.number().int().min(100).max(60000) }).strict(),
  actions: z.array(actionSchema).max(500)
}).strict().superRefine((p, ctx) => {
  if (p.recording.width !== p.viewport.width || p.recording.height !== p.viewport.height) ctx.addIssue({ code: 'custom', message: 'Recording dimensions must equal viewport dimensions', path: ['recording'] });
  if (new Set(p.actions.map(a => a.id)).size !== p.actions.length) ctx.addIssue({ code: 'custom', message: 'Action IDs must be unique', path: ['actions'] });
  for (const origin of p.network.allowedOrigins) {
    try { if (new URL(origin).origin !== origin) throw new Error(); }
    catch { ctx.addIssue({ code: 'custom', message: 'Allowlist entries must be exact origins without paths', path: ['network', 'allowedOrigins'] }); }
  }
});
export type Project = z.infer<typeof projectSchema>;
export type Action = z.infer<typeof actionSchema>;
export type Target = z.infer<typeof locatorSchema>;
export function createProject(url: string, title: string, objective: string): Project {
  return projectSchema.parse({ schemaVersion: '1.0', projectId: randomUUID(), title, objective, url,
    outputDir: 'output', viewport: { width: 1280, height: 720 },
    recording: { width: 1280, height: 720, maxDurationMs: 120000, maxBytes: 250_000_000 },
    network: { allowedOrigins: [new URL(url).origin], allowLoopback: false }, privacy: { maskSelectors: [] },
    cursor: { enabled: true, size: 26, speed: 900, trail: false, clickAnimation: true, reducedMotion: false },
    pacing: { beforeMs: 200, afterMs: 500, actionTimeoutMs: 10000 }, actions: [] });
}

const time = z.number().finite().nonnegative();
const point = z.object({ x: z.number().finite(), y: z.number().finite() }).strict();
export const timelineSchema = z.object({
  schemaVersion: z.literal('1.0'), projectId: id, recordingId: id,
  sourceUrl: z.url(), status: z.enum(['success', 'failed', 'cancelled']),
  viewport: z.object({ width: dimension, height: dimension }).strict(),
  recording: z.object({ file: z.literal('recording.webm'), width: dimension, height: dimension, bytes: z.number().int().nonnegative(), valid: z.boolean(), durationMs: time }).strict(),
  clock: z.object({ unit: z.literal('milliseconds'), origin: z.literal('recorded-page-created'), accuracy: z.literal('approximate-not-frame-accurate'), coordinateSystem: z.literal('viewport-css-pixels') }).strict(),
  actions: z.array(z.object({ id, type: z.string(), target: locatorSchema.optional(), startMs: time, endMs: time, result: z.enum(['success', 'failed']), error: z.string().optional(), screenshot: z.string().optional() }).strict()),
  cursor: z.array(z.object({ ...point.shape, atMs: time, actionId: id, kind: z.enum(['move', 'click', 'hover']) }).strict()),
  highlights: z.array(z.object({ ...point.shape, width: time, height: time, atMs: time, actionId: id }).strict()),
  sceneMarkers: z.array(z.object({ actionId: id, atMs: time, label: z.string() }).strict()),
  narrationCues: z.array(z.object({ actionId: id, atMs: time, text: z.string() }).strict()),
  error: z.string().optional(), blockedRequests: z.number().int().nonnegative(),
  reviewRequired: z.literal(true)
}).strict().superRefine((t, ctx) => {
  let end = 0;
  for (const a of t.actions) {
    if (a.endMs < a.startMs || a.startMs < end || a.endMs > t.recording.durationMs) ctx.addIssue({ code: 'custom', message: 'Invalid action chronology' });
    end = a.endMs;
  }
});
export type Timeline = z.infer<typeof timelineSchema>;
export const assetManifestSchema = z.object({
  format: z.literal('edynora-tutorial/1'), schemaVersion: z.literal('1.0'), projectId: id,
  workflowCompatibility: z.literal('unverified'), reviewRequired: z.literal(true),
  assets: z.array(z.object({ path: z.string(), bytes: z.number().int().positive(), sha256: z.string().regex(/^[0-9a-f]{64}$/) }).strict()).min(3)
}).strict();
