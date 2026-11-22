# OpenCode project setup

Shared OpenCode configuration for Arinaholic. Everything here is project-scoped
and safe to commit; it contains no personal models, keys, or paths.

- `../opencode.jsonc` — project config: formatter and watcher ignores
- `agents/` — reusable subagents
- `commands/` — slash commands such as `/check`, `/verify`, `/research`
- `skills/` — on-demand guidance loaded by the agent

Shared project rules live in `../AGENTS.md`. These files assume OpenCode loads
that automatically; they add procedures and repo-specific detail rather than
restating the rules.
