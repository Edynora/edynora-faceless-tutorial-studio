# Open-source research — November 24, 2026

## Evidence and method

Read the eight requested upstream repositories and official recording/plugin/legal documentation before substantial implementation. [RESEARCH_REVISIONS.md](RESEARCH_REVISIONS.md) records exact GitHub commits, license-file URLs and maintenance timestamps. [research-evidence.json](research-evidence.json) stores GitHub API results with license text for those revisions. Research pins describe inspected candidates, not npm release commits. Installed release versions are pinned separately in package-lock.json; their package license files and bundled notices are captured in [dependency-licenses.json](dependency-licenses.json) and licenses/.

Commercial use is allowed by all considered open-source licenses subject to their obligations; commercial permission does not imply permissive redistribution. No source was copied from rejected projects. Unselected candidates were not installed or benchmarked, so their full transitive license/security trees are **not approved**. Assess those again at a pinned release before adoption. The installed tree and bundled notices were inspected, and npm audit was run; zero advisories is only a point-in-time registry result, not a security guarantee.

## Capabilities and suitability comparison

| Candidate | Local/offline and installation | Windows / browser scope | Recording / cursor | Reliability and integration decision |
|---|---|---|---|---|
| Playwright | Node plus browser download; no model service needed | Windows supported upstream; Chromium/Firefox/WebKit. MVP tests Chromium only. | Native viewport WebM; no automatic visible OS cursor | Explicit locators and waits suit repeatable demos. Selected and exercised locally. |
| Browser Use | Python agent ecosystem, model/provider configuration; cloud features separate | Browser automation ecosystem; Windows setup requires additional Python/browser validation | Not a replacement for a controlled recorder; cursor not guaranteed | Useful future AI planning; larger stack and model nondeterminism. Deferred. |
| Stagehand | TypeScript SDK, model and browser configuration; local/hosted options | Chromium-oriented local/remote SDK; Windows not tested here | Automation abstraction rather than tutorial cursor/capture layer | Potential future natural-language planning. Not needed for explicit steps. Deferred. |
| browser-harness | Agent connection to the user's existing Chrome, including logged-in state | Chrome integration; installation/OS behavior not tested here | No verified synchronized tutorial recording or cursor contract | Existing personal browser state conflicts with clean-session privacy. Rejected for MVP. |
| OBS Studio | Native desktop app; no model API; heavier setup/build | Windows/macOS/Linux, whole screens/apps rather than browser actions | Strong desktop capture and OS cursor options | Wrong scope for isolated browser MVP; GPL source not incorporated. Optional future external integration only after review. |
| FFmpeg | Native executable/libraries and codec configuration | Cross-platform builds; no browser automation | Media capture/encode/mux; no automatic tutorial cursor engine | Useful for future postprocessing, but separate pipeline unnecessary. No application FFmpeg binary bundled. Playwright's own recorder discussed below. |
| Vitest | Node development tool | Upstream cross-platform; no browser control by itself | Tests, not recording | Selected for real contract/unit/integration tests, including Chromium through Playwright. |
| Zod | Small TypeScript runtime dependency | Platform independent validation | Schemas, not recording | Selected strict input and timeline validation; generated JSON schemas plus runtime cross-field refinements. |

Native performance was tested only on the synthetic dashboard. Repeated successful and failed recording tests establish local functionality, not long-session, hostile-site, enterprise, multiple-browser or performance certification.

## Licensing and redistribution comparison

| Candidate | Inspected license | Conditions / dependency concerns | Adoption |
|---|---|---|---|
| Playwright | Apache-2.0 | Preserve license, attribution/NOTICE and bundled notices. Downloaded browsers and recorder are separately licensed. | Runtime 1.65.1, no browser binaries in npm package |
| Browser Use | MIT | Retain copyright/permission text; model SDK and Python dependency audit still needed. Cloud/API terms are separate. | Research only |
| Stagehand | MIT | Retain notice; validate transitive SDK/model and hosted service terms before adding. | Research only |
| browser-harness | MIT | Retain notice; full agent/Chrome dependency review outstanding; private-session risks. | Research only |
| OBS Studio | GPL-2.0 metadata; source license terms apply, including later-version options where granted | Source/derivative distribution obligations; dependencies have additional notices. Do not relicense OBS code Apache. | No dependency/code reuse |
| FFmpeg | GitHub metadata NOASSERTION; actual upstream license is configuration-dependent LGPL-2.1-or-later / GPL variants | Inspect COPYING/LICENSE and enabled components. GPL/nonfree flags change obligations/distributability. Binary/source/relinking requirements need build-specific review. | No separate bundled pipeline |
| Vitest | MIT | Retain notices for test framework and build tool tree. Vite 7 pinned to avoid unnecessary MPL CSS compiler. | Development only 5.1.1 |
| Zod | MIT | Retain copyright and permission text. | Runtime 4.6.7 |

### Recorder binary distinction

Playwright's native video feature uses its own downloaded FFmpeg binary. This is **not an all-permissive binary stack** merely because Playwright's JS API is Apache-2.0. The tested Windows recorder is `n7.0.1-playwright-build-1013`, with COPYING.LGPLv2.1 in its upstream cache. Its printed configuration enables libvpx_vp9 and has no `--enable-gpl` or `--enable-nonfree`. The local output decodes as VP9/WebM. These binaries are neither copied into this repository nor bundled in npm pack. Users download them via upstream Playwright installation. Redistributing an offline installer/browser cache would require a separate complete binary/source/notices compliance review and approval.

## Advisory review

The public GitHub advisory page for each requested repo was opened. Public pages may be incomplete or gated; no empty page should be read as proof that a package has no vulnerabilities. In particular, Vitest's page lists historical advisories; choose and audit the actual installed release. FFmpeg advisories also require its own upstream [security page](https://ffmpeg.org/security.html), rather than relying on a GitHub mirror. npm-audit.json records the selected installed tree's registry audit. Browser binaries are outside npm audit and need separate upstream update review.

Advisory indexes: [Playwright](https://github.com/microsoft/playwright/security/advisories), [Browser Use](https://github.com/browser-use/browser-use/security/advisories), [Stagehand](https://github.com/browserbase/stagehand/security/advisories), [browser-harness](https://github.com/browser-use/browser-harness/security/advisories), [OBS](https://github.com/obsproject/obs-studio/security/advisories), [FFmpeg mirror](https://github.com/FFmpeg/FFmpeg/security/advisories), [Vitest](https://github.com/vitest-dev/vitest/security/advisories), [Zod](https://github.com/colinhacks/zod/security/advisories).

## Decision and primary references

Choose Playwright + Zod + strict TypeScript, with Vitest in development and a modular CLI. This is local-first, avoids paid services, and directly satisfies deterministic browser recording. Add a browser cursor overlay because automation APIs do not inherently show a pointer in captured page content. [Playwright video documentation](https://playwright.dev/docs/videos) requires closing the context to finalize files and explains viewport/video scaling. [FFmpeg legal guidance](https://ffmpeg.org/legal.html) explains configuration-dependent licensing. [Claude's manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference) defines the adapter layout and native validation command.

Original copyright notice was subsequently supplied by the maintainer: Copyright 2026 Edynora, Apache-2.0. Before public release: review optional platform package notices on each supported build; audit browser/recorder binaries if distributing them; confirm real importer behavior; run release QA on supported OS versions. No repository publication or cloud deployment was performed.
