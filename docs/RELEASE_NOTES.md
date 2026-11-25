# 0.1.0 — local MVP, November 24, 2026

Implemented standalone core and CLI, strict project/timeline/asset schemas, deterministic Chromium interactions, cursor/highlight/label overlays, configurable pacing, fresh sessions, network/private-address controls, known-selector privacy masks, action approval flags, WebM recording, duration/size limits, cancellation/failure recovery, metadata, screenshots and portable/footage-only exports. Added a local synthetic dashboard and reusable sample. Added a native Claude Code plugin plus shell-free bridge, Windows guides, pinned research/licenses and CI configuration.

## Verified release evidence

See VERIFICATION.md for exact checks, results and sample media paths. Build/type checks and local fixture/CLI/adapter tests were executed on Windows. The sample video was inspected with ffprobe and decoded with the user's installed FFmpeg. Native Claude installation/discovery and execution of the installed adapter were verified. No model-backed slash-command invocation, actual external importer or GitHub CI run is claimed.

## Known limitations

- Single Chromium viewport only; silent WebM using the upstream recorder's codec, with approximate rather than frame-calibrated timestamps. No desktop/terminal/audio/MP4 pipeline.
- No GUI, autonomous natural-language execution, narrator generation, profile/authenticated-account support, downloads, popups, iframe targeting, keyboard action engine or persistent session reuse.
- Only Windows was run locally. Linux CI is configured but unobserved; macOS/other browsers are untested.
- Configured DOM masks cannot discover all secrets or protect against a deliberately hostile site. Network routing is not an OS sandbox and does not pin DNS. User review and trusted synthetic environments remain necessary.
- The proposed Video Workflow export has not been tested against its actual importer. `workflowCompatibility` remains unverified.
- Claude's prompt/command behavior through a model-backed conversation is a remaining acceptance check; no paid model API was called.
- Copyright 2026 Edynora under Apache-2.0 is the maintainer-supplied notice. No registered corporate status is asserted. Repository and private security reporting links are provided in README.md and SECURITY.md. Upstream binaries retain separate license obligations. Public plugin catalog icon/listing/safety review is not completed.

## Next priorities

1. Complete one real Claude slash-command recording and formal tagged-release review. The maintainer has reviewed the synthetic sample playback and exercised export locally.
2. Obtain Edynora Video Workflow's actual import contract and add consumer contract tests.
3. Calibrate native capture timestamps against encoded frames; broaden Windows and Linux/CI validation and browser/recorder update policy.
4. Harden deployment isolation/egress if hosting or recording less-trusted sites; add supported iframe and keyboard workflows only with privacy tests.
5. Consider a lightweight review/plan editor after the CLI workflow is accepted. Keep optional model planners separate from the deterministic core.

The maintainer authorized GitHub publication on November 24, 2026. Source is hosted at [Edynora/edynora-faceless-tutorial-studio](https://github.com/Edynora/edynora-faceless-tutorial-studio), with private vulnerability reporting enabled. No npm package, external recording service or paid model integration is published. The npm package remains marked private to prevent accidental registry publication. Generated recordings and local test/account configuration are excluded from Git.
