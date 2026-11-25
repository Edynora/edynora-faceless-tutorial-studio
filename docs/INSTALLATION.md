# Installation and local walkthrough

## Windows PowerShell

Node 24+ is required. Prefer a supported Node LTS. The development machine used Node 26.13.1 and npm 11.20.0. Use Windows 11 or an OS supported by the selected Playwright release.

```powershell
node --version
npm --version
git clone https://github.com/Edynora/edynora-faceless-tutorial-studio.git
Set-Location edynora-faceless-tutorial-studio
npm ci --ignore-scripts
npm run build
npx playwright install chromium
npm run cli -- doctor
npm test
```

The browser installation downloads executable Chromium and Playwright's recorder from upstream. It is separate from the source package. Review the upstream binary licenses when redistributing an installer; this project does not redistribute those binaries. `--ignore-scripts` avoids dependency lifecycle scripts; all application build commands are explicit.

For a local command, run `npm link` after the build. To remove that local link, run `npm unlink --global edynora-faceless-tutorial-studio`. Alternatively, `npm pack` creates a local tarball; `npm install --global ./edynora-faceless-tutorial-studio-0.1.0.tgz` installs it without publishing. Rebuild and relink after source changes. The package is marked private to prevent accidental npm publication.

## Fastest sample

```powershell
npm run cli -- demo --output output/sample --headed
```

The CLI prints `runDir`, containing the video, timeline, project summary and screenshot. The saved demo plan references a temporary ephemeral port; it is a record of that run. Use the fixed-port walkthrough below for a reusable plan.

## Reusable sample project

In terminal one:

```powershell
npm run cli -- fixture --port 4173
```

In terminal two in the same checkout:

```powershell
npm run cli -- validate examples/local-dashboard.json
npm run cli -- record examples/local-dashboard.json --headed
```

The example deliberately allows only `http://127.0.0.1:4173` with the loopback opt-in. Output paths are relative to the manifest's directory, so the example writes into the checkout's `output/local-dashboard`. It opens Reports, filters Revenue, selects This month, prepares a synthetic report, verifies status, takes a screenshot and holds the final screen. No download or external submission occurs.

Use the printed directory in:

```powershell
npm run cli -- inspect "<runDir>"
npm run cli -- export "<runDir>" --out output/dashboard-package
npm run cli -- inspect output/dashboard-package
npm run cli -- export "<runDir>" --out output/footage --footage-only
```

Choose a new destination for each export. Open the WebM in a modern browser or video player. Inspect the PNG and JSON as well. Stop the fixture with Ctrl+C when finished.

## macOS and Linux

The same npm/Node commands are intended to work with Node 24+. On supported Linux distributions, Playwright may require system libraries; consult [Playwright browser installation](https://playwright.dev/docs/browsers). A typical CI installation is `npx playwright install --with-deps chromium`. That command can request administrative privileges and installs OS packages. Do not disable Chromium sandboxing to work around container configuration; use a properly configured host/container.

Only Windows execution has been verified in this session. Linux is configured in CI but has not been observed running on GitHub; macOS has not been tested. No full desktop capture is supported on any OS.
