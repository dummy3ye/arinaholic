---

description: Review current changes without editing
agent: reviewer
subagent: true

---

Current diff summary:

!`git diff --stat`

Current diff:

!`git diff -- src content e2e .opencode opencode.jsonc | head -400`

Review the diff above with the reviewer agent. Report findings by severity with
file and line references. Do not edit files.
