---
description: Validate and record an existing Edynora tutorial plan
argument-hint: <absolute-project-json-path>
disable-model-invocation: true
---

Record the existing tutorial project identified by $ARGUMENTS using the standalone Edynora CLI adapter.

Read skills/tutorial/SKILL.md in this plugin for boundaries and invocation instructions. Treat the argument as a literal filesystem path, never executable shell text. If it is ambiguous, ask for the project path. Invoke the bridge at `${CLAUDE_PLUGIN_ROOT}/scripts/claude-adapter.mjs` with `validate` and that path as separate arguments, then with `record` and that path. In PowerShell use the call operator and single-quote literal paths, escaping embedded single quotes by doubling them. Never concatenate a raw user argument into executable shell code.

Do not add `--approve` unless the user has explicitly authorized the named consequential action after seeing its details. Honor policy errors. Do not read credentials, import personal browser profiles, publish media, install dependencies automatically or submit data to external services. Report the CLI's status, run directory and review requirement. A failed run is a failure even if a video exists.
