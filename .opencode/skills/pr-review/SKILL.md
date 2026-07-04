---
name: pr-review
description: >
  Comprehensive PR code review skill. Use when user asks to review a PR, branch, commit,
  or uncommitted changes. Triggers on: "review PR 123", "review branch feature-gallery",
  "review commit abc123", or any review request. Provides correctness, maintainability,
  and architecture analysis with severity classification.
license: MIT

metadata:
  author: opencode
  version: '1.0'
  generatedBy: '1.3.1'
---

# PR Review Skill

## When to Use

Trigger this skill when asked to review code changes, whether via:

- PR number (e.g., "review PR 123")
  - Branch name (e.g., "review branch feature-gallery")
- Commit hash (e.g., "review commit abc123")
- Default: uncommitted changes in working directory

## Step 1: Isolate the Correct Changes

**CRITICAL: Do NOT review local working directory changes unless explicitly asked.**

1. Check current branch and status
2. If a PR number is provided:
   - Prefer GitHub CLI first for diff context: `gh pr diff {number}`
   - If diff context is insufficient, gather more PR metadata before switching branches:
     - `gh pr view {number} --json baseRefName,headRefName,files,commits,url`
   - Only if additional local repository context is still required:
     - Stash any local changes: `git stash push -m "pre-pr-review"`
     - Fetch the PR: `git fetch origin pull/{number}/head:pr-{number}`
     - Checkout the PR branch: `git checkout pr-{number}`
3. If a branch name is provided:
   - Stash local changes
   - Checkout the branch: `git checkout {branch-name}`
4. Verify you're on the correct branch before proceeding
5. List changed files: `git diff --name-only main...HEAD` (or appropriate base branch)

## Step 2: Gather Complete Context

**Diffs alone are NEVER enough.**

For each changed file:

1. Read the FULL file content, not just the diff
2. Identify which parts of the file were modified vs pre-existing
3. Check related files that the changed code depends on or references
4. Look for interface/contract definitions that callers depend on
5. Verify consistency between:

- Component props/state definitions and their usage
- Data file schemas and component consumers
- TypeScript interface definitions and implementations
- Hook return types and their callers

## Step 3: Cross-Reference Verification

**Always verify references across file boundaries:**

1. **Type/Record Consistency**: If a class is instantiated with N arguments, verify the definition accepts those exact arguments
2. **Accessibility Checks**: Verify interactive elements are keyboard-accessible and have proper ARIA attributes
3. **State Consistency**: Verify component state and localStorage state are read/written consistently
4. **Error Boundaries**: Verify async operations have error handling and fallback UI
5. **Exception Handling**: Verify catch blocks don't swallow errors silently

## Step 4: What to Look For (Checklist)

### Correctness

- [ ] Compilation errors (mismatched constructors, missing imports)
- [ ] Logic errors (null checks, off-by-one, incorrect conditionals)
- [ ] Race conditions (read-then-write patterns without locking/upsert)
- [ ] Missing error handling for edge cases
- [ ] Hardcoded values that should be configurable

### Architecture & Conventions

- [ ] New code follows existing patterns in the codebase
- [ ] Proper separation of concerns
- [ ] Error handling uses specific error types, not generic throws
- [ ] Data flows are unidirectional and predictable
- [ ] Proper use of async/await

### Content Integration

- [ ] Data file schemas match component expectations
- [ ] Missing or malformed content data has fallback UI
- [ ] Content additions follow existing data schema conventions

## Step 5: Severity Classification

Classify every issue found:

- **🔴 Critical**: Compilation error, data integrity issue, broken rendering. Must be fixed before merge.
- **🟡 High**: Bug that affects correctness or UX in significant ways. Should be fixed before merge.
- **🟡 Medium**: Issue that reduces robustness, performance, or maintainability. Should be addressed.
- **🔵 Low**: Style issue, minor improvement, or nit. Can be deferred or addressed in follow-up.

## Step 6: Output Format

For each issue, provide ALL of the following:

1. **Severity emoji** (🔴 🟡 🔵)
2. **File path** (relative to repo root)
3. **Line number(s)**
4. **The actual code** at that location (not just a description)
5. **Specific comment** explaining:
   - What the bug is
   - Why it matters (impact)
   - When/how it manifests (specific scenarios)
   - How to fix it (specific, actionable)

### Example Output Structure:

````
### 🔴 Critical

#### 1. [Brief Title]

**File:** `path/to/File.cs`
**Lines:** 42-48

```csharp
// The actual code here
````

**Comment:** [Detailed explanation of the issue, impact, and fix]

```

## Step 7: Summary Table

End every review with a summary table:

```

| Severity    | Count | Categories                             |
| ----------- | ----- | -------------------------------------- |
| 🔴 Critical | N     | Compilation, Rendering, Data integrity |
| 🟡 High     | N     | Correctness, UX regression             |
| 🟡 Medium   | N     | Race conditions, Performance           |
| 🔵 Low      | N     | Style, Conventions                     |

```

Followed by a one-sentence recommendation on what must be fixed before merge.

## Common Pitfalls to Avoid

1. **Don't review the wrong code**: Always verify you're on the correct branch
2. **Don't trust diffs alone**: Read full files for context
3. **Don't assume consistency**: Verify interface/implementation alignment manually
4. **Don't be vague**: Every comment must include the exact problematic code
5. **Don't overstate severity**: Only call something a bug if you're certain
6. **Don't ignore pre-existing issues in modified files**: If a file is changed, review the whole file's logic, not just changed lines
7. **Don't skip compilation check**: If build tools are available, verify the code compiles
```
