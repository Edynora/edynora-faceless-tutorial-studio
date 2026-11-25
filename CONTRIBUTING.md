# Contributing

Use Node 24+ and a supported Playwright host. Install with `npm ci --ignore-scripts`, build, then `npx playwright install chromium`. Run `npm run check`, `npm run build` and `npm test` before proposing changes. The tests use synthetic local HTTP fixtures and real Chromium. Do not substitute external production websites or live credentials.

Source modules live in packages/. shared owns contracts and safe file helpers; core owns lifecycle; browser owns actions; cursor owns visualization/masking; privacy owns network policy; recorder checks containers; exporters owns portable assets; cli owns commands. One npm package ships the compiled modules. A GUI, model integration or new browser backend requires a scoped design and contract tests first.

Add a test that reproduces a behavior defect, then fix it and run the full suite. Verify security boundaries, cancellation, errors and Windows path behavior. Keep command output JSON, avoid raw browser diagnostics, and never add arbitrary eval/shell actions or persistent profile import. Test recording playback with optional ffprobe/FFmpeg when altering capture code; container magic checks alone do not prove playback.

If changing contracts, update JSON Schema snapshots with `npm run schemas`, examples and format documentation. Use a schema-version change for incompatible exports. Do not claim Video Workflow/agent compatibility without running the actual consuming integration. `npm run licenses` refreshes installed dependency inventory and notices; review new licenses and npm audit. Binary redistribution requires a separate review.

Original project code: Copyright 2026 Edynora, Apache-2.0 under LICENSE, as specified by the maintainer. Submit only code you have authority to license; retain applicable copyright and attribution notices. No assumption is made that Edynora is a registered legal entity. Source and ordinary bug reports are hosted at [Edynora/edynora-faceless-tutorial-studio](https://github.com/Edynora/edynora-faceless-tutorial-studio); use SECURITY.md for private vulnerability reporting. Perform the release checks in docs/RELEASE_NOTES.md before tagging a release.

Nothing in the local build process authorizes publishing, cloud deployment, paid services, or recording another person's private account. See SECURITY.md for security reports.
