// SPDX-License-Identifier: Apache-2.0
import type { BrowserContext, Locator, Page } from 'playwright';
import type { Project, Timeline } from '../../shared/src/schema.js';
import { delay } from '../../shared/src/timing.js';

type Overlay = { cursor?: HTMLElement; ring?: HTMLElement; highlight?: HTMLElement; label?: HTMLElement };
declare global { interface Window { __edynoraOverlay?: Overlay } }

export async function installOverlay(context: BrowserContext, project: Project): Promise<void> {
  await context.addInitScript(({ cursor, masks }) => {
    const selectors = ['input[type="password"]', '[autocomplete="current-password"]', '[autocomplete="new-password"]', '[data-private]', ...masks];
    const applyPrivacy = () => {
      for (const selector of selectors) for (const element of document.querySelectorAll<HTMLElement | SVGElement>(selector)) {
        // CSSOM property setters work with strict style-src; opacity also hides descendants
        // that explicitly override inherited visibility. Reapply after dynamic DOM/style changes.
        if (element.style.transitionProperty !== 'none' || element.style.getPropertyPriority('transition-property') !== 'important') element.style.setProperty('transition-property', 'none', 'important');
        if (element.style.animation !== 'none' || element.style.getPropertyPriority('animation') !== 'important') element.style.setProperty('animation', 'none', 'important');
        if (element.style.opacity !== '0' || element.style.getPropertyPriority('opacity') !== 'important') element.style.setProperty('opacity', '0', 'important');
        if (element.style.visibility !== 'hidden' || element.style.getPropertyPriority('visibility') !== 'important') element.style.setProperty('visibility', 'hidden', 'important');
      }
    };
    new MutationObserver(applyPrivacy).observe(document, { childList: true, subtree: true, attributes: true });
    const mount = () => {
      if (!document.documentElement || window.__edynoraOverlay) return;
      applyPrivacy();
      const host = document.createElement('div'); host.id = 'edynora-tutorial-overlay';
      host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;contain:layout style;';
      host.setAttribute('aria-hidden', 'true');
      const shadow = host.attachShadow({ mode: 'closed' });
      const pointer = document.createElement('div');
      pointer.style.cssText = `position:absolute;left:24px;top:24px;width:${cursor.size}px;height:${cursor.size * 1.35}px;display:${cursor.enabled ? 'block' : 'none'};filter:drop-shadow(0 2px 2px #0008)`;
      pointer.innerHTML = '<svg viewBox="0 0 24 32" width="100%" height="100%"><path d="M2 2 L2 26 L8 20 L13 30 L18 27 L13 18 L23 18 Z" fill="#fff" stroke="#102331" stroke-width="2" stroke-linejoin="round"/></svg>';
      const ring = document.createElement('div'); ring.style.cssText = 'position:absolute;border:4px solid #ed9224;background:#ed922433;border-radius:50%;width:42px;height:42px;display:none;box-sizing:border-box';
      const highlight = document.createElement('div'); highlight.style.cssText = 'position:absolute;border:3px solid #f0a12f;border-radius:7px;box-shadow:0 0 0 3px #ffffff66;display:none;box-sizing:border-box';
      const label = document.createElement('div'); label.style.cssText = 'position:absolute;left:24px;bottom:24px;max-width:80%;padding:12px 20px;border-radius:8px;background:#102331;color:white;font:bold 20px system-ui;display:none';
      shadow.append(highlight, ring, pointer, label); document.documentElement.append(host);
      window.__edynoraOverlay = { cursor: pointer, ring, highlight, label };
      document.addEventListener('pointerdown', event => {
        if (!cursor.enabled || !cursor.clickAnimation || cursor.reducedMotion || !event.isTrusted) return;
        Object.assign(ring.style, { display: 'block', left: event.clientX - 21 + 'px', top: event.clientY - 21 + 'px' });
        ring.getAnimations().forEach(a => a.cancel());
        ring.animate([{ transform: 'scale(.4)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 500, fill: 'forwards' });
        setTimeout(() => { ring.style.display = 'none'; }, 500);
      }, { capture: true });
    };
    mount();
    if (!window.__edynoraOverlay) new MutationObserver((_m, observer) => { mount(); if (window.__edynoraOverlay) observer.disconnect(); }).observe(document, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  }, { cursor: project.cursor, masks: project.privacy.maskSelectors });
}

export async function showLabel(page: Page, text?: string): Promise<void> {
  await page.evaluate(value => {
    const label = window.__edynoraOverlay?.label;
    if (label) { label.textContent = value ?? ''; label.style.display = value ? 'block' : 'none'; }
  }, text);
}

export class Cursor {
  private x = 24;
  private y = 24;
  constructor(private page: Page, private project: Project, private timeline: Timeline, private now: () => number, private signal?: AbortSignal) {}
  recordClick(actionId: string): void { this.timeline.cursor.push({ x: this.x, y: this.y, atMs: this.now(), actionId, kind: 'click' }); }
  async target(locator: Locator, actionId: string, kind: 'move' | 'click' | 'hover'): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    const box = await locator.boundingBox();
    if (!box) throw new Error('Target has no visible bounding box');
    const { width, height } = this.project.viewport;
    const x = Math.max(0, Math.min(width - 1, box.x + box.width / 2));
    const y = Math.max(0, Math.min(height - 1, box.y + box.height / 2));
    const distance = Math.hypot(x - this.x, y - this.y);
    const duration = this.project.cursor.reducedMotion ? 0 : Math.min(2000, distance / this.project.cursor.speed * 1000);
    const frames = Math.max(1, Math.ceil(duration / 25));
    const startX = this.x, startY = this.y;
    for (let i = 1; i <= frames; i++) {
      const t = i / frames, smooth = t * t * (3 - 2 * t);
      this.x = startX + (x - startX) * smooth; this.y = startY + (y - startY) * smooth;
      await this.page.mouse.move(this.x, this.y);
      await this.page.evaluate(({ x, y, trail }) => {
        const o = window.__edynoraOverlay;
        if (!o?.cursor) return;
        o.cursor.style.left = x + 'px'; o.cursor.style.top = y + 'px';
        if (trail) {
          const dot = document.createElement('div'); dot.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:5px;height:5px;border-radius:50%;background:#ef9b32;opacity:.5`;
          o.cursor.parentNode?.appendChild(dot); setTimeout(() => dot.remove(), 250);
        }
      }, { x: this.x, y: this.y, trail: this.project.cursor.enabled && this.project.cursor.trail && !this.project.cursor.reducedMotion });
      this.timeline.cursor.push({ x: this.x, y: this.y, atMs: this.now(), actionId, kind: 'move' });
      if (frames > 1) await delay(duration / frames, this.signal);
    }
    if (kind !== 'click') this.timeline.cursor.push({ x, y, atMs: this.now(), actionId, kind });
    this.timeline.highlights.push({ ...box, atMs: this.now(), actionId });
    await this.page.evaluate(({ box, enabled }) => {
      const o = window.__edynoraOverlay;
      if (o?.highlight) { Object.assign(o.highlight.style, { display: enabled ? 'block' : 'none', left: box.x + 'px', top: box.y + 'px', width: box.width + 'px', height: box.height + 'px' }); }
    }, { box, enabled: this.project.cursor.enabled });
  }
}
