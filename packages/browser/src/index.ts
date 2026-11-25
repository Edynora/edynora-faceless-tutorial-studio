// SPDX-License-Identifier: Apache-2.0
import type { Page, Locator } from 'playwright';
import type { Action, Target } from '../../shared/src/schema.js';
import { safePath } from '../../shared/src/files.js';
import type { Cursor } from '../../cursor/src/index.js';
import { delay } from '../../shared/src/timing.js';

export function locate(page: Page, target: Target): Locator {
  switch (target.by) {
    case 'role': return page.getByRole(target.role, { name: target.name, exact: true });
    case 'label': return page.getByLabel(target.value, { exact: true });
    case 'text': return page.getByText(target.value, { exact: true });
    case 'testId': return page.getByTestId(target.value);
    case 'css': return page.locator(target.value);
  }
}
export async function executeAction(page: Page, cursor: Cursor, action: Action, runDir: string, signal?: AbortSignal): Promise<string | undefined> {
  if ('target' in action) {
    const target = locate(page, action.target);
    await target.waitFor({ state: 'visible' });
    if (['click', 'type', 'hover', 'select'].includes(action.type)) {
      if (await target.evaluate(el => !!el.closest('input[type="password"],[autocomplete="current-password"],[autocomplete="new-password"],[data-private]'))) throw new Error('Sensitive interaction is forbidden');
      if (action.type === 'click') await target.click({ trial: true });
      await cursor.target(target, action.id, action.type === 'click' ? 'click' : action.type === 'hover' ? 'hover' : 'move');
    }
    switch (action.type) {
      case 'click': await target.click(); cursor.recordClick(action.id); return;
      case 'type': await target.fill(action.value); return;
      case 'hover': await target.hover(); return;
      case 'select': await target.selectOption(action.value); return;
      case 'wait': return;
      case 'assert':
        if (action.text !== undefined && !(await target.innerText()).includes(action.text)) throw new Error('Page state assertion failed');
        return;
    }
  }
  switch (action.type) {
    case 'navigate': {
      const response = await page.goto(action.url, { waitUntil: 'load' });
      if (!response || response.status() >= 400) throw new Error('Navigation returned an HTTP error');
      return;
    }
    case 'pause': await delay(action.ms, signal); return;
    case 'scroll': {
      const steps = 12;
      for (let i = 0; i < steps; i++) { await page.mouse.wheel(action.x / steps, action.y / steps); await delay(25, signal); }
      return;
    }
    case 'screenshot': {
      const file = `screenshots/${action.id}.png`;
      await page.screenshot({ path: await safePath(runDir, file), animations: 'disabled' }); return file;
    }
  }
}
