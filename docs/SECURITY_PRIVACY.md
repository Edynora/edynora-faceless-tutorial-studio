# Security and privacy

## Consent and trusted input

The user-supplied plan is an explicit automation program with constrained actions. Review its target URLs, locators, typed values, allowed origins and effects before running. Website text is never read as privileged commands. No action supports arbitrary JavaScript, shell code, downloads, profile import or filesystem access. Generated/agent-written plans require user review before execution. The tool never publishes.

Consequential effects require `effect: consequential` and an approved action ID supplied for that run. Non-GET/HEAD/OPTIONS HTTP requests also require the active action to be approved and declared consequential. GET requests and clicks can have side effects; a semantic classifier cannot infer all of them. Do not use private accounts or real credentials in this MVP. Authentication flows, purchases, deletion and external submissions are not sample workflows.

## Network controls

Exact HTTP(S) origin allowlist, no embedded URL credentials, rejection of common credential query parameters, DNS resolution of every routed request, and conservative rejection of private/reserved IPv4/IPv6 addresses. Only exact numeric `127.0.0.1`/`::1` are exempted when `allowLoopback:true` and the origin is listed. The sample fixture binds only numeric loopback. `localhost` names do not get the exemption. Every HTTP redirect target is validated before Chromium follows it. The route proxy does not automatically follow redirects. Non-HTTP external protocols are not supported.

Service workers, WebSockets, popups and downloads are blocked. Unlisted fonts, images, APIs and analytics cause a failed run with a network-policy diagnostic; add only authorized required origins. No broad wildcard allowlist exists. TLS errors are not ignored.

These controls are defense in depth, not a network security appliance. DNS is checked before the actual connection but not pinned to a validated socket; DNS rebinding remains possible. Browser internals, WebRTC and future protocol features require OS-level egress restrictions for a hardened deployment. Some browser background networking is outside Playwright routing. Browser sandboxing is enabled, but the browser has the host user's network access. Run trusted controlled demo sites, keep Chromium updated and use a dedicated OS/container network boundary for stronger isolation. Offline/local-first means no model/cloud service is required; a public website still requires network access.

## Masking and logs

The init script hides password controls, password autocomplete fields, `[data-private]` and configured `privacy.maskSelectors`. It applies CSSOM opacity/visibility properties and watches dynamic DOM/style changes. This works under restrictive style CSP without disabling the website's CSP. Masks must be configured before recording; they are not postproduction redaction. Cross-origin frames, canvas-rendered text, images, browser UI, page scripts that deliberately defeat masks and undiscovered sensitive fields are not comprehensively masked. Never depend on masking to make a real credential safe to record.

Sensitive controls cannot be targeted for interactions. Typed values are omitted from the timeline and saved project summary. Raw Playwright diagnostics are not persisted because they can include values, DOM text and URLs. Diagnostic/source URLs remove query, credentials and fragment. Original manifests remain on disk with their literal values. Locator strings, labels, narration, title, objective, screenshots and videos can retain user content. Do not put secrets in these fields. Inspect all assets before publishing. No telemetry is added by this application; upstream tools may have their own telemetry policies.

## Files and cleanup

New UUID run directory for each recording. All run asset paths are fixed or action-ID-derived; absolute paths, traversal, Windows device filenames, symlink ancestors and unsafe separators are rejected for assets. User-selected output roots are checked for symlink ancestors. These checks do not prevent races caused by a concurrent malicious local process; use a private output directory. Exports require a new directory and copy only validated expected assets. No recursive cleanup/delete command is offered. Partial failed exports may remain and should be inspected/removed manually.

Timeout and Ctrl+C abort pacing/movement waits, close the browser context, settle execution and save the partial timeline/video where possible. There are no persistent cookies, saved login state or secret environment variable injection into pages. Install-only browser dependencies remain in the user Playwright cache; contexts are nonpersistent. Review npm audit and upstream browser advisories regularly. See SECURITY.md for reporting.
