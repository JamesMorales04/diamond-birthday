# AGENTS.md — Repository Operating Rules

This file is auto-loaded into agent context on every OpenCode session.

## Project identity

**diamond-birthday** — A romantic birthday SPA (single-page application), personalised and interactive.

- **Stack:** React · Vite · TypeScript · CSS
- **Deployment:** Static site served via GitHub Pages
- **State:** Mini-game high scores persisted in `localStorage`
- **No backend, no database, no API server.**

## Entry points

| Resource                | Purpose                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `README.md`             | Full project documentation: setup, content editing, deployment, customisation |
| `.opencode/README.md`   | Agent configuration, routing policy, and skill inventory                      |
| `src/content/page.json` | Canonical source for all visible text and editorial data                      |

## Operating rules

1. **Read-only first.** Before editing any file, read the relevant canonical source to understand the current structure and conventions.
2. **Do not create stale references.** If a referenced file (e.g., `codemap.md`) does not yet exist, do not reference it in `AGENTS.md` until the orchestrator or a workflow skill generates it.
3. **Route, do not self-implement.** The orchestrator is a delegation layer. Specialist agents implement; reviewers review; validators validate.
4. **Prompt/config synchronisation.** After editing prompt files, skill files, or source JSONC, rebuild the runtime file (`node .opencode/scripts/build-oh-my-opencode-slim-config.mjs`) to prevent drift.
5. **No `codemap.md` generated yet.** This repository does not currently have a root `codemap.md`. When the `codemap` skill generates one, update this file to add a `## Repository Map` section referencing it.

## Agent configuration

See `.opencode/README.md` for the full agent roster, prompt file structure, source/generated split, and rebuild workflow.
