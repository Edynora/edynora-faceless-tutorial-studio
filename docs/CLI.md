# CLI reference

Use `edynora` after `npm link`, or `npm run cli --` from the checkout. Every completed command prints one JSON result to stdout. Progress is represented by the finalized timeline; the CLI does not stream individual actions yet.

| Command | Behavior |
|---|---|
| `--help` | JSON help with version and usage |
| `init <file> --url <URL> [--title <text>] [--objective <text>]` | Creates a new plan; refuses overwrite. Parent directory must already exist. |
| `validate <file> [--offline]` | Strict schema and URL/DNS policy check. Offline checks only the schema, not network permission. |
| `run <file> [--headed] [--approve <id>]` | Executes and records; approval flag is repeatable. |
| `record <file> [--headed] [--approve <id>]` | Alias of run; always records a new isolated session. |
| `inspect <directory>` | Validates timeline and WebM container/size; verifies hashes if assets.json is present. |
| `export <runDir> --out <newDir> [--footage-only]` | Copies a successful run into a portable package, or only the video. |
| `doctor` | Checks Node/platform and a real Chromium launch; gives browser-install command. |
| `fixture [--port 4173]` | Serves only the bundled synthetic dashboard on numeric loopback. |
| `demo [--output output/demo] [--headed]` | Serves, records and stops an ephemeral local fixture. |

Unknown flags, extra positional arguments and invalid schemas fail. Relative outputDir resolves from the manifest directory; demo output resolves from the working directory. Output/exports can be selected outside the checkout by the user; the tool rejects symlink ancestors and asset traversal. It never runs a shell action from a plan.

Exit codes: **0** successful operation; **1** unsuccessful/cancelled-by-budget browser run or dependency check; **2** invalid input, policy, filesystem or setup error; **130** explicit user cancellation. Ctrl+C during capture triggers context closure to finalize the partial video and timeline. Forced process termination/power loss cannot guarantee a finalized file.

## Approval

Mark any consequential action `"effect": "consequential"`. After reviewing its exact target and value, explicitly authorize that action ID at invocation:

```powershell
edynora record approved-test-plan.json --approve submit-test-data
```

An ID is not approval for another action. The runner checks non-read HTTP requests against the active approved action. Delayed background submissions outside that action are blocked. It cannot determine every business consequence of a GET or click; human plan review remains necessary. Never use this flag as a locator or network-policy workaround.
