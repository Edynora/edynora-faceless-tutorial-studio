# Portable tutorial package v1

Directory layout:

```text
tutorial-package/
  assets.json
  project.json
  timeline.json
  recording.webm
  screenshots/
    preview.png
```

`assets.json` has format `edynora-tutorial/1`, schemaVersion `1.0`, projectId, `workflowCompatibility: unverified`, `reviewRequired: true` and assets listing normalized relative path, byte size and lowercase SHA-256. The manifest lists all payloads except itself. Consumers need no Studio installation: parse JSON, verify safe relative paths and hashes, then read WebM/PNG with ordinary media tools. ZIP the directory separately if desired; no ZIP parser is needed by Studio.

`project.json` is a summary: schemaVersion, projectId, title, objective, sanitized sourceUrl, viewport, reviewRequired. It intentionally omits typed values and is not a reusable action manifest. Retain the original input JSON locally to replay a tutorial.

`timeline.json` includes projectId/recordingId, source URL without query, status, viewport, recording file/dimensions/bytes/valid/container checks/duration estimate, clock declaration, action sequence and timestamps, cursor samples, highlight rectangles, scene markers, screenshots and narration cues. Times are nonnegative monotonic milliseconds relative to recorded page creation; x/y are viewport CSS pixels. Action end must follow start, actions must not overlap, and end must be within duration. Cursor/highlight events carry action IDs. Scene markers and narration cues carry text. Cues do not synthesize or include narration audio.

Use the JSON Schema snapshots for structural checks and the runtime Zod refinements for cross-field validation. `inspect` verifies source recordings and package hashes. A missing asset in a declared manifest is an error. Only successful runs can export. `--footage-only` produces only recording.webm; it is not a full package and cannot be inspected as a timeline package.

No actual Edynora Video Workflow importer contract was supplied or found in this empty workspace. This format is a proposed interchange, not a tested integration. The next integration task is to obtain that contract and test a real import against sample output before changing the compatibility marker.
