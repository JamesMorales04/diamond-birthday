---
name: git-delivery-lifecycle-checklist
description: >
  Project-specific git delivery lifecycle checklist for safe checkout, staged-file
  discipline, commit/push operations, push failure handling, and no-force-push/amend/
  config mutation. Use when performing git operations as part of delivery.
license: MIT
metadata:
  author: ops
  version: "1.0"
---

# Git Delivery Lifecycle Checklist

A safety checklist for git operations used during delivery. This skill complements `ops-implementation-checklist` and is used by @ops-implementer.

## When to Use

Trigger this skill when performing git operations such as:

- Checking out branches
- Staging and committing changes
- Pushing commits to remote

## Required Context

- `AGENTS.md`

## Pre-Operation Checks

- [ ] Confirm the current branch is the intended working branch
- [ ] Confirm tracked worktree is clean before switching branches (`git status --porcelain --untracked-files=no`)
- [ ] If the target branch is missing locally, fetch from remote before checking out
- [ ] Verify no modified tracked files will be overwritten by branch switch

## Commit Discipline

- [ ] Stage only the intended files — do not use `git add .` or `git add -A`
- [ ] Commit message is descriptive and references any relevant identifiers
- [ ] Commit does **not** include untracked files that were not part of the task
- [ ] No large binary files or build artifacts staged

## Push Safety

- [ ] Do **not** force-push under any circumstance
- [ ] Do **not** amend commits (`git commit --amend`)
- [ ] Do **not** modify git config, stash, reset, or rebase without explicit orchestrator instruction
- [ ] Verify remote tracking is set for the branch before pushing (`git push -u origin <branch-name>` on first push)
- [ ] On push failure, capture exact stderr/output, classify the likely cause (auth/permissions, network, non-fast-forward, branch protection), and report — do not proceed blindly

## Post-Operation

- [ ] Report the commit hash and push result
- [ ] On success, confirm the remote branch matches local state
