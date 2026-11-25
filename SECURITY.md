# Security policy

This is an initial local MVP. Only the current development branch is maintained; no published release support window is promised. Use trusted synthetic demonstration environments, fresh contexts and current browsers. Do not record real passwords, tokens or confidential accounts.

The network and masking controls are defense in depth with documented limits, including DNS rebinding, browser protocols outside routed HTTP, DOM/canvas/iframe masking limitations and local filesystem races. See docs/SECURITY_PRIVACY.md for the precise threat boundary. Do not deploy this as a multiuser recording service without a separate sandbox/authentication/egress/security design.

Report vulnerabilities privately using [GitHub private vulnerability reporting](https://github.com/Edynora/edynora-faceless-tutorial-studio/security/advisories/new). Private reporting is enabled for this repository. Include a synthetic reproduction, affected version and impact. Do not include real credentials, private recordings or personal browser profiles in public issues. Use [GitHub Issues](https://github.com/Edynora/edynora-faceless-tutorial-studio/issues) for ordinary bugs that do not disclose sensitive security details. Only the current development version is maintained; no older-release support commitment is made.

Maintainers should reproduce with a local fixture, add a regression test, fix the boundary and rerun strict checks, all tests, package audit and relevant browser advisory review. npm audit does not cover Chromium or the native recorder. No automatic vulnerability remediation or external reporting service is enabled.
