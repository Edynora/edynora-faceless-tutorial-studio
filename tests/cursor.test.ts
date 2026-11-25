import { describe, expect, it } from 'vitest';
import { chromium } from 'playwright';
import { createProject } from '../packages/shared/src/schema.js';
import { installOverlay } from '../packages/cursor/src/index.js';
describe('privacy and visual overlay', () => {
  it('masks declared private content and passwords despite strict style CSP, including dynamic nodes', async () => {
    const browser = await chromium.launch({ chromiumSandbox: true });
    try {
      const context = await browser.newContext();
      const p = createProject('https://fixture.invalid', 'Privacy test', 'Keep configured private content out of video');
      p.privacy.maskSelectors = ['.private'];
      await installOverlay(context, p);
      await context.route('https://fixture.invalid/', route => route.fulfill({ contentType: 'text/html', headers: { 'Content-Security-Policy': "default-src 'self'; style-src 'self'" }, body: '<html><body><p class="private">synthetic secret</p><input type="password" value="synthetic"><button>Safe</button></body></html>' }));
      const page = await context.newPage(); await page.goto(p.url);
      const visible = () => page.locator('.private').first().evaluate(el => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));
      expect(await visible()).toBe(false);
      expect(await page.locator('input').evaluate(el => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))).toBe(false);
      await page.evaluate(() => { const p = document.createElement('p'); p.className = 'private'; p.textContent = 'another synthetic secret'; document.body.append(p); });
      expect(await page.locator('.private').last().evaluate(el => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))).toBe(false);
      expect(await page.locator('#edynora-tutorial-overlay').count()).toBe(1);
      expect(await page.getByRole('button', { name: 'Safe' }).isVisible()).toBe(true);
      await page.evaluate(() => {
        const el = document.createElement('div'); el.id = 'transition-private'; el.textContent = 'synthetic transitioning content';
        el.style.transition = 'opacity 60s, visibility 60s'; document.body.append(el);
      });
      await page.locator('#transition-private').evaluate(el => getComputedStyle(el).opacity);
      await page.locator('#transition-private').evaluate(el => el.setAttribute('data-private', ''));
      expect(await page.locator('#transition-private').evaluate(el => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))).toBe(false);
      await context.close();
    } finally { await browser.close(); }
  });
});
