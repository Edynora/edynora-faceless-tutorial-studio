# Browser recording guide

`record` and `run` create a new nonpersistent Chromium context and record its single viewport using Playwright native WebM capture. Browser chrome, desktop apps, terminal windows, OS dialogs and audio are excluded. `--headed` makes the controlled browser visible; headless captures the same page content. Chromium sandboxing remains enabled.

Set viewport and recording dimensions to the same size. Defaults are 1280×720; the runtime rejects mismatches because video scaling otherwise changes cursor coordinates. Playwright selects its recorder codec; the local verified sample is VP9/WebM, 1280×720. A player/editor must support that codec. No MP4 transcoder is bundled.

Video capture begins when the page is created. Action timestamps use monotonic host milliseconds relative to that creation, including initial navigation and planned holds. Native capture encoding can introduce startup offset/padding and a different final duration. Metadata is approximate and not calibrated to exact frames. Validate synchronization manually before aligning narration; strict frame-accurate synchronization is future work.

Use `pacing.beforeMs` and `afterMs` for planned narration space, with per-action overrides. Condition-based waits are used for visible targets and click actionability; planned pauses are explicit. Pointer movement is interpolated at about 25ms intervals, bounded to two seconds per target. Scroll uses twelve wheel increments. Network timing, fonts, animations and target layout can still vary; deterministic actions do not guarantee byte-identical video output.

`recording.maxDurationMs` stops execution and finalizes the partial recording. The size monitor checks the active capture files every 250ms and checks the finalized size again; encoder buffering can temporarily overshoot. Over-budget output is marked invalid/failed and cannot be exported. Both successful and failed captures remain in their unique run folders for review. Launch errors may leave an empty run folder. Forced termination may leave an incomplete file.

`recording.valid` means a regular file passes minimum-size, WebM EBML magic and doctype checks and is within its configured budget. It is not a complete codec decode. `inspect` also checks declared byte size and, on export packages, hashes. For stronger verification with a separately installed user-owned FFmpeg build:

```powershell
ffprobe -v error -show_entries stream=codec_name,width,height:format=duration,size -of json "<runDir>/recording.webm"
ffmpeg -v error -i "<runDir>/recording.webm" -f null -
```

These tools are optional validation tools, not shipped runtime dependencies. Their configuration determines their license obligations. Screenshots are viewport PNGs, with the same overlay and configured masks as the video. Review them as carefully as the recording.
