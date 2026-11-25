# Troubleshooting

| Symptom | Check / action |
|---|---|
| `edynora` not found | Build first, then `npm link`; or use `npm run cli --`. Open a new terminal if npm's command path changed. |
| Chromium executable missing | Run `npx playwright install chromium` from the same user/environment as the CLI. Sandboxes may use a different Playwright cache. |
| Browser fails to launch | Run doctor, check supported OS/system libraries and browser sandbox permissions. Do not silently disable browser sandboxing. |
| Generic setup/operation error | Check file permissions, absolute selected paths, Node version, browser installation and plan schema. Raw browser diagnostics are intentionally not printed because they can expose secrets. |
| Private destination blocked | Public sites must resolve only to public IPs. For the bundled fixture, use exact numeric loopback origin and allowLoopback:true. This does not allow private LAN ranges. |
| Network policy blocks assets/APIs | Review every required asset origin and add only authorized origins to allowedOrigins. Analytics, external fonts, WebSockets and delayed background POSTs can fail a run. |
| Click/type target times out | Confirm exact accessible name/label, visible state and unique match. Closed/hidden/disabled/covered elements fail. Increase actionTimeoutMs only if the condition legitimately needs longer. |
| Sensitive control fails | Use synthetic nonsensitive inputs. Do not bypass password/private-selector protections. |
| Unexpected/unused dialog | Add one expected dialog step immediately before its trigger with the matching type. Popups, downloads, file choosers and OS dialogs are unsupported. |
| Failed run has a video | Expected: partial capture is retained for diagnosis. Inspect its timeline. Failed/invalid output cannot be exported. |
| Recording too short/too large | Increase explicit duration/size budget within supported bounds, shorten actions or reduce resolution. Final size can exceed an in-flight check due to buffering and will be rejected. |
| Package hash or missing asset error | Do not edit exported payloads independently. Re-export from the original successful run to a new directory. |
| Video will not play in editor | Use a WebM/VP9-capable player/editor. MP4 conversion is not bundled. Optionally validate with your own ffprobe/FFmpeg build. |
| Timestamps differ from media duration | Expected approximate native-recording origin/padding; review alignment. No frame-accurate audio sync is promised. |
| Demo plan cannot replay | The demo server's random port expires when demo ends. Use fixture --port 4173 with examples/local-dashboard.json. |
| Plugin install rejects source | Use --marketplace ./ (not bare .) from the checkout. Set EDYNORA_STUDIO_ROOT before starting Claude. |
| Plugin cannot locate core | Build the referenced checkout; verify EDYNORA_STUDIO_ROOT is an absolute path and still exists. The cached plugin does not install its own core dependencies. |
| Symlink test EPERM in Codex sandbox | The host sandbox can deny junction creation or hide browser caches. Run trusted local tests in an ordinary authorized PowerShell terminal; do not skip the test and claim success. |

All commands return JSON and meaningful exit codes. Keep source plans and logs private. For reporting, prepare a minimal synthetic fixture, plan with no credentials, CLI result, Node/OS/Playwright versions and the failed action ID.
