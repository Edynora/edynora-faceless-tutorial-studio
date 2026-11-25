# Edynora Faceless Tutorial Studio design

Scope authority: the user's Complete Codex Development Master Prompt v0.2, supplied November 24, 2026. This design makes implementation choices within that authorized scope.

## Intent and approach
Provide reproducible browser tutorials for educators and creators using a strict JSON plan, without a paid model or private browser profile. Build a reusable TypeScript engine and CLI first. A Claude Code plugin delegates to that CLI. Keep modules in one npm package to avoid monorepo publishing infrastructure.

Alternatives: Playwright native WebM recording offers the smallest local stack; a separate FFmpeg/OBS pipeline adds capture and redistribution complexity; model-driven browser-use/Stagehand adds model requirements and nondeterminism. Select Playwright with an explicit in-page cursor. No desktop mouse/capture claim. Defer GUI and AI planning.

## Contracts
Zod validates project and timeline schemas. Actions use role, label, text, test ID or CSS locators. Actions include navigation, click, type, hover, select, scroll, wait, assert, screenshot, pause and expected-dialog handling. Failed actions stop the run and preserve a failed timeline and finalized recording. Recording and viewport sizes match to avoid cursor misalignment.

Monotonic milliseconds start when the recorded page is created. Metadata contains the estimated video origin and timing accuracy limitation; no frame-accurate audio synchronization claim. Cursor positions are CSS pixels in the viewport; highlight events carry rectangles in that same space.

## Safety
Fresh nonpersistent Chromium context; no login profile import. Explicit origin allowlist; DNS checks reject private/reserved IPv4/IPv6 and loopback except opt-in numeric loopback for local fixtures. Recheck every HTTP request and redirect; block WebSockets, service workers, downloads and popups. Non-GET requests require a separately declared approved action ID. Plans are trusted user input, web content is not. No arbitrary JS/shell action. Deny password/secret input, redact diagnostic content, mask configured selectors with an init script. Masking cannot discover all sensitive information. Network isolation is defense in depth, not an OS sandbox against hostile pages or DNS rebinding.

All writes are within explicitly selected project/output roots with traversal and symlink rejection. Exports copy a fixed set of validated assets with hashes. A new run gets a unique directory. Export destinations must be new. Duration and recording-size budgets terminate capture. Require review before publishing; this application never publishes.

## Export and adapters
Directory package format `edynora-tutorial/1` includes recording.webm, project.json, timeline.json, screenshot assets and SHA-256 asset manifest. Consumers need only JSON and a WebM player. Video Workflow compatibility remains unverified without its actual import contract. Claude plugin commands ask the agent to invoke the installed CLI with quoted arguments; no duplicate browser logic. Future adapters implement a provider-neutral plan runner interface.

## Verification and limits
Unit security/schema tests, local HTTP fixture integration with actual Chromium and recording, CLI subprocess tests, native Claude plugin validation/load checks, npm audit, dependency notice inventory, and ffprobe/decode validation where available. No claims of production readiness, cross-platform testing or Claude model invocation without evidence. Maintainer-supplied copyright notice: Copyright 2026 Edynora, Apache-2.0. This does not assert registered corporate status.
