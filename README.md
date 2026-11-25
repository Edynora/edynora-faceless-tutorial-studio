# Edynora Faceless Tutorial Studio

**AI Workflows. Intelligent Automation. Smarter Work.**

Automate. Demonstrate. Record. Teach.

A local TypeScript engine and CLI that turns a website URL and an explicit JSON action plan into a browser tutorial recording. Run it independently of any AI agent. The optional Claude Code plugin delegates to the same CLI. No model subscription or cloud recording service is required.

This is a tested local MVP, not a production-readiness claim. It records one Chromium viewport to silent WebM, with an in-page cursor, highlights, screenshots, scene markers and narration cues. It does not generate narration, control the Windows mouse, record the desktop, or infer arbitrary natural-language actions. Edynora Video Workflow import compatibility is **unverified** pending its actual contract.

## Quick start — Windows PowerShell

Install Node.js 24 LTS or a later supported LTS, then open PowerShell in this checkout:

```powershell
git clone https://github.com/Edynora/edynora-faceless-tutorial-studio.git
Set-Location edynora-faceless-tutorial-studio
npm ci --ignore-scripts
npm run build
npx playwright install chromium
npm run cli -- doctor
npm run cli -- demo --output output/sample
```

The demo starts a temporary loopback dashboard with synthetic data, records it, and prints the run directory. Open `recording.webm` there to review. `timeline.json` contains recording-relative action timestamps. No private account is used. To see the browser window while it records, add `--headed`.

To install a local CLI command after building:

```powershell
npm link
edynora --help
edynora init my-tutorial.json --url https://example.com --title "My tutorial" --objective "Teach navigation"
edynora validate my-tutorial.json
edynora record my-tutorial.json --headed
edynora inspect "<printed-run-directory>"
edynora export "<printed-run-directory>" --out output/tutorial-package
```

Edit the plan's `actions` before recording. `npm link` updates your local npm command directory; it does not publish. You may use `npm run cli --` in place of `edynora` throughout. For a repeatable local walkthrough with an editable plan, see [installation and walkthrough](docs/INSTALLATION.md).

Optional Claude Code adapter, from this built checkout:

```powershell
$env:EDYNORA_STUDIO_ROOT = (Get-Location).Path
claude plugin install edynora-studio --marketplace ./ --scope user
```

See [the plugin guide](docs/CLAUDE_CODE_PLUGIN.md) for commands and tested behavior.

## Features and boundaries

- Strict manifests and robust role/label/text/test-ID/CSS locators; navigation, click, type, hover, select, scroll, wait, assertions, screenshots, pauses and expected dialogs.
- Smooth cursor overlay, real pointerdown click effects, target highlights, optional trails, step labels, reduced motion and pacing.
- Fresh isolated Chromium sessions, explicit origin allowlist, private-address checks, configured privacy masking and action approval boundaries.
- Duration/size budgets, interruption cleanup, finalized failed-run recordings and readable structured errors.
- Portable directory exports with JSON schemas, SHA-256 asset integrity, footage-only export and independent consumption.
- Installable Claude Code plugin; core execution requires no Claude installation.

Only record environments you are authorized to demonstrate. Use synthetic accounts and data. Review every video, screenshot, selector, label and cue before sharing. Masks cover configured DOM elements; they cannot recognize all secrets or safely record an adversarial site. The network policy is not a hardened OS network sandbox.

## Documentation

| Topic | Guide |
|---|---|
| Windows install, Linux/macOS notes and local walkthrough | [INSTALLATION.md](docs/INSTALLATION.md) |
| CLI and exit codes | [CLI.md](docs/CLI.md) |
| Plan, actions and schemas | [PROJECT_SCHEMA.md](docs/PROJECT_SCHEMA.md) |
| Recording and cursor | [RECORDING.md](docs/RECORDING.md), [CURSOR.md](docs/CURSOR.md) |
| Privacy and security | [SECURITY_PRIVACY.md](docs/SECURITY_PRIVACY.md) |
| Claude Code | [CLAUDE_CODE_PLUGIN.md](docs/CLAUDE_CODE_PLUGIN.md) |
| Architecture and export contract | [ARCHITECTURE.md](docs/ARCHITECTURE.md), [EXPORT_FORMAT.md](docs/EXPORT_FORMAT.md) |
| Research and license obligations | [OPEN_SOURCE_RESEARCH.md](docs/OPEN_SOURCE_RESEARCH.md), [THIRD_PARTY_LICENSES.md](docs/THIRD_PARTY_LICENSES.md) |
| Troubleshooting, results and limitations | [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md), [VERIFICATION.md](docs/VERIFICATION.md), [RELEASE_NOTES.md](docs/RELEASE_NOTES.md) |

## Development

```powershell
npm run check
npm run build
npm test
npm run schemas
npm run licenses
npm audit
claude plugin validate .
```

Tests use a local fixture and actual Chromium; install the browser first. [CONTRIBUTING.md](CONTRIBUTING.md) explains the layout. Original code: Copyright 2026 Edynora, licensed under [Apache-2.0](LICENSE), as specified by the project maintainer. Dependencies and browser binaries retain their respective licenses. Source is hosted on [GitHub](https://github.com/Edynora/edynora-faceless-tutorial-studio). No npm package or hosted recording service is published.
