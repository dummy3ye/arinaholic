---

description: Full pre-merge verification for Arinaholic
subagent: true

---

Load `@project-checks` and `@e2e-and-a11y`. Verify the current change set as if
preparing it for merge. If a build is unsafe while the dev server is running,
say which checks must wait instead of stopping the server. Report every command
and result.
