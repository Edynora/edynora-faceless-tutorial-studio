// SPDX-License-Identifier: Apache-2.0
import { setTimeout } from 'node:timers/promises';
export async function delay(ms: number, signal?: AbortSignal): Promise<void> {
  await setTimeout(ms, undefined, { signal });
}
