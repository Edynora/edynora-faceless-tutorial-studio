---
description: Check local Edynora recording dependencies without a model API
disable-model-invocation: true
---

Invoke `node "${CLAUDE_PLUGIN_ROOT}/scripts/claude-adapter.mjs" doctor` with literal quoted paths using the user's shell. This invokes the standalone core through its CLI. Report the JSON result. If EDYNORA_STUDIO_ROOT is missing, explain that it must point to the built local Studio checkout. Do not change settings or install dependencies automatically.
