# Tutorial project schema

The authoritative runtime schema is `packages/shared/src/schema.ts`. JSON Schema snapshots are in `schemas/project.schema.json`, `schemas/timeline.schema.json`, and `schemas/assets.schema.json`; regenerate with `npm run build` then `npm run schemas`. Cross-field refinements (unique IDs, matching viewport/video size, exact origin normalization, chronology) are enforced by runtime Zod validation and are not fully expressible in the generated snapshots.

See `examples/local-dashboard.json` for a complete runnable project and `templates/project.json` for a public-site starter. A project uses schemaVersion `1.0`, stable projectId, title, objective, url, outputDir, viewport, recording budgets, network policy, privacy masks, cursor preferences, pacing and actions. Unknown properties are rejected. No arbitrary executable JavaScript, shell commands or model instruction strings are accepted as actions.

Viewport/recording dimensions: 320–3840 CSS pixels each, and exactly equal. Duration: 1 second–1 hour. Recording size: 1 KB–2 GB. Defaults: 1280×720, 2 minutes, 250 MB. IDs use 1–80 ASCII letters, digits, underscore or hyphen. `_initial_navigation` is reserved by the runner. Actions must have unique IDs; maximum 500 steps.

## Locators

```json
{ "by": "role", "role": "button", "name": "Reports" }
{ "by": "label", "value": "Filter reports" }
{ "by": "text", "value": "Revenue report" }
{ "by": "testId", "value": "report-list" }
{ "by": "css", "value": "#status" }
```

Role, label and text locators use exact matching. Ambiguous locators fail rather than silently taking the first match. Use accessible names when practical; CSS is available for controlled fixtures. Supported roles are listed in the JSON schema. Frames, popups, shadow-selector customization and keyboard-only action plans are outside this MVP.

## Action fields

Every action has `id`, `type`, optional `label`, `narration`, `beforeMs`, `afterMs` and `effect` (`read` by default). Pacing overrides are 0–60000 milliseconds. Labels appear on screen; narration is a metadata cue, not synthesized speech.

| Type | Additional fields |
|---|---|
| navigate | url (explicitly allowed HTTP(S) URL) |
| click, hover, wait | target |
| type | target, value (replaces the field contents) |
| select | target, value (native select option value) |
| assert | target, optional text (visible element containing text) |
| scroll | y, optional x (relative CSS pixels; twelve controlled wheel steps) |
| pause | ms (0–60000) |
| screenshot | none; stores screenshots/ID.png |
| dialog | response: accept/dismiss; dialogType: alert/confirm/prompt/beforeunload |

Declare `dialog` immediately before the action that opens it. The next matching dialog is consumed once. Unexpected or unused expected dialogs fail the run; prompt text entry is not supported. Downloads and popups are disabled. An initial navigate action is automatically added to the timeline.

Input plans contain literal typed values and should never contain credentials. The saved run project is a summary with URL queries removed; it does not duplicate the original action values. Selectors, labels, cue text, titles and objectives are retained and can themselves contain sensitive information; review them before export.
