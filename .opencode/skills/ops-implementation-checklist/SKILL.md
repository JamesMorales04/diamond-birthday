---
name: ops-implementation-checklist
description: Project-specific ops implementation checklist for CI/GitHub Pages/build scripts, static asset configuration, dependency wiring, environment templates, and local developer setup. Use when implementing operational changes that need build verification, config sync, and reviewer handoff.
license: MIT
compatibility: Works alongside ops-review-checklist.
metadata:
  author: ops
  version: '1.0'
---

# Ops Implementation Checklist Skill

## When to Use

Trigger this skill when **implementing** (not reviewing) operational changes that involve:

- CI workflow definitions (GitHub Actions for build/deploy)
- GitHub Pages deployment configuration
- Build scripts, task runners, Makefiles, and local developer workflow commands
- Environment and runtime configuration templates and defaults
- Package/project manifests, lockfiles, and dependency wiring
- Local development setup and reproducibility

## Required Context

Before making ops edits, confirm the agent has applied:

- `AGENTS.md`

## Implementation Discipline

- [ ] Inspect the current implementation before choosing a pattern
- [ ] Keep the change inside one bounded ops workstream whenever possible
- [ ] Preserve existing CI/CD topology unless explicitly asked to change it
- [ ] Use `${VAR:-default}` pattern for all environment-specific values
- [ ] Pin base image tags in Dockerfiles — never use `latest`
- [ ] Pin third-party GitHub Actions to SHA commits, not floating tags
- [ ] Keep `.dockerignore` and build context minimal
- [ ] Verify no hardcoded secrets, credentials, or environment-specific values in source or config
- [ ] Ensure build scripts are idempotent and use repository-local paths
- [ ] Avoid unrelated refactors or opportunistic cleanup outside the task scope

## CI/GitHub Pages Preflight

- [ ] Verify workflow triggers, paths, and filters are correct and scoped to the right branches/events
- [ ] Check caching configuration for package restores and build artifacts
- [ ] Confirm workflow permissions follow least-privilege (no blanket `write-all`)
- [ ] Verify GitHub Pages deploy step is correctly configured (branch, folder, action)
- [ ] Verify build output directory matches deployment configuration

## Runtime Config Sync

- [ ] Verify environment variable templates (`.env.example` or equivalent) are complete
- [ ] Confirm no runtime secrets are committed to source control
- [ ] Verify build scripts produce consistent results across platforms where required
- [ ] Confirm local development setup matches CI expectations where relevant

## Docs/Config Sync Handoff

When the ops change affects documented behavior, workflow, or setup:

- Flag the affected documentation for `@docs-implementer` sync (do not defer)
- Note which docs files need updating in the output

## Validation Handoff

- Prepare exact validation commands for `@validator`; do not claim validation you did not run
- List the specialist reviewers that should re-check the change

## Output Shape

Return work in a compact implementation summary with:

- **Files changed**: list of modified files with brief description per file
- **Operational impact**: how the change affects build, run, deploy, or developer workflows
- **Rollback considerations**: how to reverse the change safely
- **Environment/dependency assumptions**: any new prerequisites or configuration requirements
- **Docs flagged for sync**: documentation files that need updating due to the change
- **Validation commands for @validator**: exact commands to run, including working directory
- **Reviewers to re-run**: whether @ops-reviewer or other specialist reviewers should re-check
- **Assumptions**: non-obvious decisions or limitations
