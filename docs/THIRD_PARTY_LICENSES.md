# Third-party licenses and notices

Original code: Copyright 2026 Edynora, Apache-2.0, as specified by the project maintainer; see LICENSE and NOTICE. No registered corporate identity is inferred from that name. Third-party copyrights remain with their respective owners.

## Selected direct dependencies

| Dependency | Version | Use | License |
|---|---|---|---|
| playwright | 1.65.1 | Browser control and native recording API | Apache-2.0 |
| playwright-core | 1.65.1 (transitive) | Browser driver | Apache-2.0 plus bundled notices |
| zod | 4.6.7 | Validation and JSON Schema | MIT |
| vitest | 5.1.1 | Development tests | MIT |
| vite | 7.3.8 | Vitest build-tool peer selection | MIT |
| typescript | 5.9.3 | Compiler | Apache-2.0 |
| @types/node | Lockfile-pinned 24.x | Node type declarations | MIT |

Generate an exact installed and platform-optional inventory with `npm run licenses`. [dependency-licenses.json](dependency-licenses.json) records each installed package/version/license and copied notice paths; optional packages not present on Windows are explicitly marked uninstalled. [dependency-tree.json](dependency-tree.json) records dependency relationships. Full installed notices, including Playwright's inlined bundled license sidecars and ThirdPartyNotices.txt, are preserved under docs/licenses/. They must accompany redistributed copies where required.

The final installed JavaScript development/runtime tree declares MIT, Apache-2.0, ISC and BSD-3-Clause. Read bundled licenses as well as package metadata. A preliminary Vite 8 dependency selection pulled in MPL-2.0 lightningcss; the dependency was removed by pinning the supported Vite 7 peer branch. No lightningcss source/binary is needed or included. Re-audit after dependency changes rather than inferring future compatibility from this list.

MIT/ISC require retention of copyright and permission/warranty text. BSD-3-Clause adds nonendorsement terms. Apache-2.0 includes attribution, license, change notices and patent-related terms. Do not remove upstream notices or claim ownership of third-party code. This report is a technical inventory, not a legal opinion.

## User-installed executable dependencies

Chromium, its component libraries, and Playwright's recorder are separate downloads. The source/npm package excludes them. The installed Windows recorder ffmpeg-1013 contains COPYING.LGPLv2.1; its configuration uses libvpx VP9 without GPL/nonfree flags. Chromium contains BSD and mixed third-party components. These are not relicensed Apache-2.0 by this project. If shipping a browser bundle/offline installer later, preserve exact notices and satisfy source/relinking and component-specific obligations after a separate review.

OBS, Browser Use, Stagehand, browser-harness and a separately distributed system FFmpeg are not application dependencies. Research license files are evidence only. A user-installed ffprobe/FFmpeg was used to decode a development recording; the application's runtime does not require those PATH executables.

## Refresh and release gate

```powershell
npm ci --ignore-scripts
npm run licenses
npm audit --json
```

Audit results are time-specific and omit browser binary advisories. Preserve package-lock.json, review upstream notices after upgrades, and evaluate the actual built binary configuration before distributing executables. The maintainer authorized source publication to GitHub; no npm package or browser executable bundle is published.
