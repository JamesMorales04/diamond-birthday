---
name: ops-review-checklist
description: >
  Project-specific ops review checklist for CI workflows, package manifests and
  lockfiles, build scripts, runtime and environment configuration, reproducibility,
  secrets and permissions, and supply-chain risk. Use when reviewing operational
  and delivery changes. Does not replace architecture or documentation specialist
  ownership.
license: MIT
compatibility: Works alongside pr-review skill.
metadata:
  author: ops
  version: "1.0"
---

# Ops Review Checklist Skill

## When to Use

Trigger this skill when reviewing operational and delivery changes that involve:
- CI workflow definitions (GitHub Actions, build/deploy pipelines)
- Dockerfiles and Docker Compose configurations
- Package manifests and lockfiles (package.json, pnpm-lock.yaml)
- Build scripts, task runners, and local developer workflow commands
- Environment and runtime configuration templates and defaults
- Reproducibility of local development and CI environments

## Review Discipline

- [ ] Inspect the **full changed file**, not just the diff — diffs can hide broken context around the change
- [ ] Verify you are reviewing the correct diff target before drawing conclusions
- [ ] Check directly related files that the changed configuration depends on or references
- [ ] Every finding must cite exact file paths, line numbers, or configuration evidence; no speculative severity claims

## CI Workflow Checks

- [ ] Workflow triggers, paths, and filters are correct and scoped to the right branches/events
- [ ] Caching configuration is present for package restores and build artifacts
- [ ] Matrix builds cover required combinations without redundant permutations
- [ ] Workflow permissions follow least-privilege (no blanket `write-all` without justification)
- [ ] Secrets are referenced by name, never hardcoded or logged
- [ ] Required status checks and branch protection rules are consistent with the workflow
- [ ] GitHub Pages deployment step is correctly configured

## Docker / Container Checks

- [ ] Dockerfiles use pinned base image tags, not `latest`
- [ ] Multi-stage builds are used to minimize image size
- [ ] Health checks are defined and appropriate for the service
- [ ] Ports, volumes, and networks are correctly mapped and documented
- [ ] Environment variables use `${VAR:-default}` pattern for safe override
- [ ] Build context is minimal (`.dockerignore` is present and effective)
- [ ] Container users are non-root where appropriate
- [ ] No secrets or credentials baked into image layers

## Package / Dependency Checks

- [ ] Package manifests (package.json) and lockfiles are consistent
- [ ] New dependencies are justified, not duplicative, and from reputable sources
- [ ] Dependency versions use ranges or pins intentionally
- [ ] No deprecated, unmaintained, or known-vulnerable dependencies are introduced
- [ ] Supply-chain signals checked: download counts, maintainer history, provenance

## Build Script / Task Runner Checks

- [ ] Scripts are idempotent — safe to re-run without side effects
- [ ] Scripts use repository-local paths, not absolute or developer-specific paths
- [ ] Formatting, linting, and test commands are consistent with CI expectations
- [ ] Scripts do not silently swallow errors or suppress warnings

## Environment / Runtime Configuration Checks

- [ ] No hardcoded environment-specific values in source or config files
- [ ] Environment configuration templates are present and complete
- [ ] `.env.example` or equivalent documents all required variables
- [ ] Secrets and sensitive config are loaded from environment or secret managers, not committed
- [ ] Default values are safe for development

## Reproducibility Checks

- [ ] Local development setup is documented and scriptable
- [ ] CI builds are reproducible (pinned images, locked dependencies, deterministic outputs)
- [ ] Build scripts produce consistent results across platforms where required

## Secrets / Permissions / Supply-Chain Risk

- [ ] No secrets, API keys, tokens, or credentials in source code or committed config files
- [ ] CI workflow secrets are scoped to the minimum required permissions
- [ ] Third-party actions and reusable workflows use pinned SHA commits
- [ ] Dependency sources are from official registries; no custom or untrusted feeds without justification

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| Frontend code, components, or UX behavior | @frontend-reviewer |
| Architecture (module boundaries, layering) | @architecture-reviewer |
| Test coverage and test quality | @test-reviewer |
| Documentation accuracy and setup drift | @docs-reviewer |
| Code-level quality (naming, duplication, readability) | @code-quality-reviewer |
