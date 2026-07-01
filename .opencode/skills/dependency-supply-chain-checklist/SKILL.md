---
name: dependency-supply-chain-checklist
description: Project-specific dependency and supply-chain checklist for manifests/lockfiles, pinned versions/images/actions, provenance, and reproducibility. Use when adding, updating, or verifying dependencies.
license: MIT
metadata:
  author: ops
  version: "1.0"
---

# Dependency Supply-Chain Checklist Skill

## When to Use

Trigger this skill when implementing or reviewing dependency changes:
- Adding or updating npm/pnpm packages
- Modifying `package.json` or `pnpm-lock.yaml`
- Changing GitHub Actions versions or third-party action references
- Wiring new dependencies across modules or layers
- Verifying dependency consistency across the repository

## Required Context

Before making dependency edits, confirm the agent has applied:
- `AGENTS.md`

Key rules to check:
- No framework-specific dependencies in root `package.json`
- No version drift between root and sub-project `package.json` files

## Manifest Consistency

- [ ] `package.json` dependencies are justified and no unnecessary libraries added
- [ ] `pnpm-lock.yaml` (or equivalent lockfile) is present and committed
- [ ] No duplicate dependency declarations across `package.json` files
- [ ] No deprecated, unmaintained, or known-vulnerable dependencies introduced
- [ ] Supply-chain signals checked: download counts, maintainer history, provenance, typosquatting risk
- [ ] New dependencies are from reputable sources (official registries, no custom feeds without justification)

## Version Pinning

- [ ] npm/pnpm dependencies use intentional version ranges; no floating `*` or `latest` tags
- [ ] Docker base images use pinned tags (not `latest`)
- [ ] Third-party GitHub Actions use pinned SHA commits (not floating version tags)
- [ ] No unversioned dependencies in scripts or config files

## Docker and CI

- [ ] Dockerfiles pin base image versions with specific tags
- [ ] CI workflow actions reference pinned SHAs or specific versions
- [ ] Build arguments and environment variables do not inject unversioned dependencies

## Reproducibility

- [ ] Lockfile is up to date with `package.json` declarations
- [ ] CI installs use the lockfile (e.g., `pnpm install --frozen-lockfile`)
- [ ] No postinstall scripts that fetch unversioned external content
- [ ] Build produces deterministic output given the same dependency versions

## Route Away When

Do **not** own these findings. Route them to the appropriate specialist:

| Finding type | Route to |
|---|---|
| Application code quality or naming | @code-quality-reviewer |
| Frontend component behavior | @frontend-reviewer |
| Documentation changes needed | @docs-implementer |
