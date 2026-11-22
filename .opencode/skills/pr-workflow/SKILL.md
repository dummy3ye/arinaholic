---

name: Pull request workflow
description: 'Prepare, review, or finish an Arinaholic pull request. Use when the user asks for a PR, branch, push, merge, ship, or wants CI status checked, even if they do not say "workflow".'
license: MIT
compatibility: opencode

---

# Pull requests

1. Read `AGENTS.md` and `CONTRIBUTING.md` for the branch and quality-gate
   expectations. The default branch is `master`.
2. Summarize the change with `git status --short` and `git diff --stat`.
3. Run the appropriate checks lane from `@project-checks` before proposing a
   PR. Do not merge on partial check success.
4. Use `.github/PULL_REQUEST_TEMPLATE.md` as the description structure. Keep it
   short and factual.
5. Follow the user's explicit delivery instruction. The default is branch →
   push → all checks pass → squash merge → delete the branch. A direct push is
   used only when the user asks for it.
6. After a merge, verify post-merge workflows before cleaning up the branch.

## Completion

Report the exact branch, commit, or PR state, which checks passed, and any
remaining follow-up.
