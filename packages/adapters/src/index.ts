// SPDX-License-Identifier: Apache-2.0
import type { Project, RunOptions, RunResult } from '../../core/src/index.js';
/** Interface only. No untested Codex/AI/orchestrator integration is advertised. */
export interface TutorialAdapter { readonly name: string; run(project: Project, options?: RunOptions): Promise<RunResult> }
