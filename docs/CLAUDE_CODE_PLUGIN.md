# Claude Code plugin

The standalone CLI works without Claude Code. The plugin uses the official `.claude-plugin/plugin.json`, root `commands/` and `skills/` layout. It adds `edynora-studio:doctor`, `edynora-studio:record` and `edynora-studio:tutorial`. There is no hook, MCP server, model dependency in the engine, or duplicate browser logic in the prompts.

## Install locally in PowerShell

Build and install Chromium first. Then, from the checkout:

```powershell
$env:EDYNORA_STUDIO_ROOT = (Get-Location).Path
claude plugin validate .
claude plugin install edynora-studio --marketplace ./ --scope user
claude plugin list
claude plugin details edynora-studio@edynora-local
claude
```

Use `./`, not bare `.`, as the local marketplace source for Claude Code 2.1.327. The source repository is available at [Edynora/edynora-faceless-tutorial-studio](https://github.com/Edynora/edynora-faceless-tutorial-studio); clone and build it before following this tested local installation path. The environment variable must point to the built checkout and be present when Claude starts. The installed plugin bridge launches Node with the CLI path under that checkout. Rebuild Studio when source changes; the plugin adapter does not copy/implement the core. For temporary development loading, `claude --plugin-dir .` is also available without a marketplace installation.

Inside Claude:

```text
/edynora-studio:doctor
/edynora-studio:record C:\absolute\path\to\project.json
```

The command instructs Claude to validate and then record through `scripts/claude-adapter.mjs`. Arguments must be passed literally with shell-appropriate quoting. The bridge itself uses `spawn(..., {shell:false})`. `EDYNORA_STUDIO_ROOT` is required deliberately; plugin cache paths are not assumed to contain a working npm dependency installation.

You can test the adapter without a model invocation:

```powershell
node scripts/claude-adapter.mjs doctor
node scripts/claude-adapter.mjs demo --output output/plugin-demo
```

## Verified behavior and limits

The installed Claude Code 2.1.327 CLI validated the plugin, installed it from the local marketplace into an isolated CLAUDE_CONFIG_DIR, listed it enabled, and reported its component inventory. The cached installed bridge was executed directly to record the synthetic dashboard. Automated tests also invoke its init/validate path with spaces and shell metacharacters.

No model-backed Claude conversation or slash-command end-to-end inference was run, because this request forbids paid API/cloud charges. Native install/discovery and the installed deterministic bridge are tested; a human slash-command invocation remains an acceptance step. The command prompt's agent behavior is therefore not claimed fully validated. Future adapters exist only as an interface.

To repeat isolated installation without changing ordinary Claude settings:

```powershell
$env:CLAUDE_CONFIG_DIR = Join-Path (Get-Location) '.claude-test'
$env:EDYNORA_STUDIO_ROOT = (Get-Location).Path
claude plugin install edynora-studio --marketplace ./ --scope user --json
claude plugin list --json
claude plugin details edynora-studio@edynora-local
```

Restart the shell or remove the process environment variable to return to your normal Claude configuration. This test directory is gitignored. Public plugin-directory submission is not performed; its optional listing/icon/safety review is separate from local runtime validation. Official specification: [manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference).
