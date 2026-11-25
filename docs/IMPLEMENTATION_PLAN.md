# Edynora MVP Implementation Plan

Goal: implement the user's v0.2 scope as a standalone local CLI and core with a thin Claude plugin.
Architecture: strict TypeScript modules, Playwright capture and a Zod plan/export contract.
Spec: DESIGN.md and the user's master prompt.
Execution: native in this workspace; no publication, cloud services or paid API calls.

## Global constraints
Windows PowerShell support, Node 24+; no external recording executable bundled; no AI required; actual importer compatibility and untested OS support must not be claimed.

## Review focus
Private IP/redirect requests; credentials in diagnostics; traversal/symlink outputs; recording cleanup after failures/timeouts; plugin paths containing spaces.

## Tasks
- [x] 1. Research: record candidate revisions/licenses, capabilities, obligations, and decision. Inventory selected dependencies and notices after install.
- [x] 2. Foundation/security: write failing URL/manifest/path tests; implement schemas, safe URL policy and filesystem boundaries; run unit tests and type checks.
- [x] 3. Browser/cursor/recorder: write fixture-based failing tests for actions and visible overlays; implement runner, budgets and cleanup; test successful and failed WebM output and metadata.
- [x] 4. Export/CLI: write CLI/package tests; implement init, validate, run/record, inspect, export, doctor and demo; validate portable assets and hashes.
- [x] 5. Adapter: create official manifest, commands and skill delegating to CLI; validate and test local loading/installation without a paid model call; document limits.
- [x] 6. Release documentation: generate schemas/licenses, add guides, Apache text and notices, CI; run check/build/tests/audit/pack, decode sample video and review the complete implementation.

## Ledger
Initial repository is empty with an unborn master branch. Node 26.13.1, npm 11.20.0, Claude Code 2.1.327 and ffprobe present. Use codex/mvp branch in the authorized directory; no worktree needed for this empty repository. The spec explicitly authorizes end-to-end implementation, so proceed through milestones and report evidence instead of reopening scope approval.

Completed: 42 local tests passed; typecheck/build passed; zero npm audit findings; actual Windows tarball install/CLI recording passed. Reviewer findings received tests/fixes for CSP masking, transitions, cancellation/duration cleanup, asset integrity, reserved addresses and click timing. Vite 7.3.8 chosen to keep development dependencies permissively licensed. Maintainer supplied Copyright 2026 Edynora / Apache-2.0. Native Claude plugin installation and cached adapter recording passed. Remaining acceptance gaps: model-backed slash-command invocation, actual Video Workflow importer, non-Windows execution and public-release metadata. See VERIFICATION.md for evidence.
