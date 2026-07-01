# .opencode — Agent Configuration

This directory contains the OpenCode multi-agent configuration for this repository, powered by **Oh My OpenCode Slim** (`oh-my-opencode-slim`).

The configuration follows a **source / generated split**:

| Layer | File | Role |
| --- | --- | --- |
| **Source of truth** | `oh-my-opencode-slim.source.jsonc` | **Source of truth for agent config** — JSONC file with comments, `promptPath`/`orchestratorPromptPath` references to external Markdown files, and all agent metadata (model, variant, temperature, skills, MCPs). Edit this file to add, remove, or reconfigure agents. |
| **Maintained prompt body** | `prompts/agents/<name>.prompt.md` | **Maintained prompt body** — canonical Markdown of every custom agent's system prompt. Referenced from the source via `promptPath` and inlined into the runtime by the build script. Edit to update prompt text; rebuild after editing. |
| **Maintained orchestrator routing policy** | `prompts/agents/<name>.orchestrator.md` | **Maintained orchestrator routing policy** — canonical Markdown of every custom agent's orchestrator delegation rules. Referenced from the source via `orchestratorPromptPath` and inlined into the runtime by the build script. Edit to update routing policy; rebuild after editing. |
| **Generated runtime** | `oh-my-opencode-slim.json` | **Generated runtime — do not edit.** Compiled JSON produced by the build script. Contains all prompts inlined; `promptPath`/`orchestratorPromptPath` are resolved and removed. Consumed by the OMO Slim plugin at runtime. Rebuild after editing source or prompt files. |
| **Build script** | `scripts/build-oh-my-opencode-slim-config.mjs` | **Build script — do not edit unless build logic changes.** Reads `oh-my-opencode-slim.source.jsonc`, resolves `promptPath`/`orchestratorPromptPath` to inline prompt content from `prompts/agents/`, and writes the compiled `oh-my-opencode-slim.json`. Supports `--check` mode for drift detection. |
| **Maintained policy artifact** | `oh-my-opencode-slim/default-preset/orchestrator_append.md` | **Maintained policy artifact — edit directly.** Orchestrator addendum with project-specific orchestration rules, routing policy, and delegation logic. This is NOT generated; it is a hand-maintained file. |

## Source Configuration Workflow

1. **Edit** `oh-my-opencode-slim.source.jsonc` — add, remove, or reconfigure agents. Prompt text lives in `prompts/agents/` and is referenced via `promptPath`/`orchestratorPromptPath`. All metadata fields (`model`, `variant`, `temperature`, `skills`, `mcps`, `multiplexer`, `council`, `fallback`, `todoContinuation`) stay in the source JSONC only.
2. **Edit prompt bodies** under `prompts/agents/` — each agent has two files:
   - `<agent-name>.prompt.md` — the agent's system prompt
   - `<agent-name>.orchestrator.md` — the orchestrator routing policy
3. **Rebuild** the runtime file (see below).

## Prompt File Structure

```text
prompts/agents/
├── validator.prompt.md
├── validator.orchestrator.md
├── e2e-validator.prompt.md
├── e2e-validator.orchestrator.md
├── integration-validator.prompt.md
├── integration-validator.orchestrator.md
├── planner.prompt.md
├── planner.orchestrator.md
├── quality-implementer.prompt.md
├── quality-implementer.orchestrator.md
├── architecture-reviewer.prompt.md
├── architecture-reviewer.orchestrator.md
├── frontend-reviewer.prompt.md
├── frontend-reviewer.orchestrator.md
├── test-reviewer.prompt.md
├── test-reviewer.orchestrator.md
├── docs-reviewer.prompt.md
├── docs-reviewer.orchestrator.md
├── ops-reviewer.prompt.md
├── ops-reviewer.orchestrator.md
├── code-quality-reviewer.prompt.md
├── code-quality-reviewer.orchestrator.md
├── frontend-implementer.prompt.md
├── frontend-implementer.orchestrator.md
├── test-implementer.prompt.md
├── test-implementer.orchestrator.md
├── docs-implementer.prompt.md
├── docs-implementer.orchestrator.md
├── ops-implementer.prompt.md
└── ops-implementer.orchestrator.md

(30 files for 15 custom agents)
```

### Agents (all 15)

| Agent | Role |
| --- | --- |
| `validator` | Command-based non-browser repository verification |
| `e2e-validator` | Command-based browser-driven E2E validation via Playwright MCP |
| `integration-validator` | Cross-cutting integration quality gate |
| `planner` | Delegation planner |
| `quality-implementer` | Bounded quality improvement |
| `architecture-reviewer` | Architecture and structure reviewer |
| `frontend-reviewer` | Frontend quality reviewer |
| `test-reviewer` | Test coverage and quality reviewer |
| `docs-reviewer` | Documentation consistency reviewer |
| `ops-reviewer` | CI/container/dependency reviewer |
| `code-quality-reviewer` | Maintainability and clean-code reviewer |
| `frontend-implementer` | React/Vite/TypeScript frontend implementation |
| `test-implementer` | Test implementation, including Playwright E2E test authoring |
| `docs-implementer` | Markdown docs, ADRs, setup notes, prompt files, skill files, and terminology alignment |
| `ops-implementer` | CI/Docker/dependency implementation and build configuration |

### Built-in Orchestrator and Preset-Only Config Agents

The 15 agents listed above are custom agents defined in `oh-my-opencode-slim.source.jsonc`. OMO Slim also ships built-in orchestrator behavior and preset-only config agents (e.g., `@oracle`, `@fixer`, `@council`, `@explorer`, `@librarian`, `@designer`, `@observer`) that are configured within the OMO Slim preset system, not as standalone prompt files under `prompts/agents/`. These built-ins are documented in `orchestrator_append.md` under the Default workflow, Subagent Failure Recovery Protocol, and Cost-control rules sections. They do not appear in the agent table because they are not custom agents; they are part of the OMO Slim framework and are referenced only as fallback or support roles. The project explicitly sets `disabled_agents: []` (empty array) in `oh-my-opencode-slim.source.jsonc` to override the OMO Slim framework default that disables `@observer`, ensuring all built-in agents remain enabled by default.

## Orchestrator Behavior: Routing-Only Principle

The orchestrator is strictly a delegation and coordination layer. It must not:

- Self-implement (edit source code, tests, config, migrations, or documentation)
- Self-review (perform its own review instead of delegating to specialist reviewers)
- Self-remediate (fix issues found by reviewers without delegating to implementers)
- Self-validate (run build/test commands instead of delegating to @validator)

Every orchestrator prompt (`.orchestrator.md`) begins with `@<agent-name>` and describes only when and how the orchestrator should **delegate** to that agent. These prompts contain explicit "Orchestrator must not self-implement; always delegate" language reinforced across all 15 agents.

Recovery from agent failure follows a strict retry-delegate chain: retry the same agent once, then route to the nearest domain specialist, and only escalate to @oracle for architectural, security, or persistently ambiguous failures. The orchestrator must never "just fix it" as a fallback.

## Standardized Reviewer Output Format

All reviewer agents produce reports using a consistent structured format:

| Field | Description |
| ------- | ------------- |
| **Agent** | Agent name that produced the report |
| **Verdict** | PASS, FAIL, or PASS_WITH_WARNINGS |
| **Severity** | Critical / High / Medium / Low |
| **Scope** | Files or modules reviewed |
| **Confidence** | Assessment confidence and rationale |
| **Findings table** | Sev, Category, Location, Evidence, Impact, Recommended fix, Suggested agent |
| **Validation** | Commands run and exact results (pass/fail/NOT_AVAILABLE) |
| **Follow-up** | Reviewers to rerun, implementers to delegate, validators to run |

Categories include: `build`, `test`, `lint`, `format`, `security`, `architecture`, `frontend`, `docs-drift`, `ops`, `maintainability`, `quality`, `coverage`.

When no issues exist, the report uses a compact no-findings variant: Agent, Verdict PASS, Scope, "No findings.", "No follow-up required."

### Integration-Validator Report Format

The integration-validator follows the same standardized format above and adds a mandatory **Finalization safety** field (`SAFE` | `BLOCKED` | `RISK_KNOWN`) to every report. This field signals whether finalization may proceed, is blocked by Critical/High findings or incomplete traceability, or carries known deferred risks.

The integration-validator is a cross-cutting integration gate, not a replacement for @validator. It consumes @validator output and runs narrow targeted checks; it does not duplicate broad build/test/lint validation.

### Expected Output Conventions (Non-Reviewer Agents)

Non-reviewer agents (implementers, planner, validator) use a normalized expected output format. Individual agent prompts extend these fields with specialist-specific additions but must not contradict them.

## Quality Implementer / Fixer Policy

The project uses two agents for quality and recovery cleanup with distinct roles. `@quality-implementer` is the **primary quality cleanup agent** — use it by default for bounded cross-cutting cleanup, reviewer notes, nits, naming, duplication, and maintainability improvements. `@fixer` (OMO Slim built-in) is an **external/default fallback only** — only route to it when no specialist implementer can handle the issue. If a quality note belongs to a domain specialist, route there first.

## Tie-Breaker Rules for Overlapping Domains

When multiple agents could handle a change, the planner and orchestrator follow these deterministic tie-breakers:

| Overlap | Routing |
| --------- | --------- |
| Frontend + test coverage | Route frontend to @frontend-implementer and test gaps to @test-implementer (parallel if contracts stable) |
| Architecture + code quality | Route structural decisions to @architecture-reviewer, code-level quality to @code-quality-reviewer |
| Docs + any domain | Route docs to @docs-implementer parallel with implementation |

## Source-Only Fields (Non-Prompt Semantics)

The following fields in `oh-my-opencode-slim.source.jsonc` are **not** extracted into prompt files because they are configuration metadata, not prompt text. These fields are edited directly in `.opencode/oh-my-opencode-slim.source.jsonc`:

- `model` — model identifier per agent
- `variant` — variant tier (`low`, `medium`, `high`)
- `temperature` — sampling temperature
- `skills` — skill identifiers (e.g., `pr-review`, `simplify`, `agent-browser`)
- `mcps` — MCP tool identifiers (e.g., `grep_app`, `context7`)
- `multiplexer` — multiplexer settings (type, layout, pane sizes)
- `council` — council configuration (presets, councillor agents, timeouts)
- `fallback` — fallback chains per agent
- `todoContinuation` — todo continuation settings

Metadata fields can also appear in `presets` entries. To modify any of these, edit `oh-my-opencode-slim.source.jsonc` directly.

### Orchestrator Temperature Rationale

The orchestrator preset temperature is set to `0.1`. The lower value makes routing and delegation decisions more deterministic, reducing variance in specialist selection, retry classification, and reviewer assignment across repeated runs of the same task. This is intentional: the orchestrator's job is coordination, not creative generation, and predictable delegation improves reviewability and reduces unnecessary recovery cycles.

## Custom Skills Inventory

Of the skills tracked on disk under `.opencode/skills/`, the authored skills listed below cover planner output normalization, reviewer finding consolidation, agent failure recovery, prompt maintenance auditing, config/policy auditing, integration gating, and implementation and review discipline across frontend, test, docs, ops, architecture, code-quality, and accessibility domains. Additional bundled or external skills also reside under `.opencode/skills/` with their own `SKILL.md` files — utilities such as `pr-review`, `simplify`, `codemap`, `clonedeps`, and `deepwork`. Skills such as `agent-browser` are built-in OMO Slim skills loaded externally and do not have local directories under `.opencode/skills/`.

All entries below are real skill directories with `SKILL.md` files. They are grouped by primary usage context.

### Orchestration and audit skills

Used by the orchestrator, planner, or docs-implementer for task routing, output normalization, and configuration auditing.

| Skill | Purpose | Trigger Keywords |
| ------- | --------- | ----------------- |
| `routing-normalizer` | Normalize planner output into a consistent 7-item delegation plan shape before the orchestrator routes. | `normalize plan`, `clean plan`, `plan shape check`, `validate delegation plan`, `normalize planner output` |
| `finding-deduper` | Merge overlapping reviewer findings into canonical remediation targets. | `dedup findings`, `merge findings`, `consolidate findings`, `finding deduplication`, `clean up reviewer output`, `overlapping findings` |
| `recovery-classifier` | Classify agent failures into canonical recovery types before retry routing. | `agent failed`, `classify failure`, `recovery type`, `retry routing`, `agent error`, `failure classification` |
| `prompt-drift-auditor` | Detect prompt, runtime JSON, routing matrix, and stale reference drift across the opencode configuration. | `check prompt drift`, `audit prompts`, `prompt sync check`, `stale references`, `routing matrix drift`, `validate opencode config` |
| `config-policy-audit` | Audit prompt policy centralization, artifact role clarity, and terminology consistency across the opencode configuration. | `audit policy centralization`, `check artifact roles`, `policy text audit`, `terminology consistency check`, `orchestrator policy audit` |
| `integration-gate-checklist` | Concise integration gate checklist for local diff review, completed integration, pre-finalization check, post-integration review, and reviewing current changes. | `integration gate`, `diff review`, `pre-finalization check`, `post-integration review` |

### Implementation checklists

Used by implementer agents during code or documentation implementation.

| Skill | Purpose | Trigger Keywords |
| ------- | --------- | ----------------- |
| `frontend-implementation-checklist` | Project-specific frontend implementation checklist for React/Vite/TypeScript SPA: component patterns, data-driven content, SCSS styling, game state with localStorage, required UI states, accessibility basics, and validation expectations. | `frontend implementation checklist`, `frontend impl check`, `frontend preflight`, `implementing frontend` |
| `test-implementation-checklist` | Project-specific implementation-side checklist for writing, updating, and structuring tests. Covers test-type selection, framework awareness, fixture isolation, assertion quality, and minimal testability changes. | `test implementation checklist`, `test impl check`, `test preflight`, `implementing tests` |
| `docs-implementation-checklist` | Project-specific docs implementation checklist for Markdown docs, ADRs, setup notes, prompt files, skill files, README skill inventory updates, and terminology alignment. | `docs implementation checklist`, `docs impl check`, `docs preflight`, `implementing docs` |
| `ops-implementation-checklist` | Project-specific ops implementation checklist for CI/GitHub Pages/build scripts, static asset configuration, dependency wiring, environment templates, and local developer setup. | `ops implementation checklist`, `ops impl check`, `ops preflight`, `implementing ops` |
| `git-delivery-lifecycle-checklist` | Project-specific git delivery lifecycle checklist for safe checkout, staged-file discipline, commit/push operations, push failure handling, and no-force-push/amend/config mutation. | `git delivery checklist`, `git lifecycle check`, `git safety check`, `checkout discipline`, `push failure handling` |
| `dependency-supply-chain-checklist` | Project-specific dependency and supply-chain checklist for manifests/lockfiles, pinned versions, provenance, and reproducibility. | `dependency supply chain check`, `dependency checklist`, `supply chain preflight`, `dependency audit`, `dependency wiring check` |

### Review checklists

Used by reviewer agents during code, architecture, or documentation review.

| Skill | Purpose | Trigger Keywords |
| ------- | --------- | ----------------- |
| `architecture-review-checklist` | Project-specific architecture review checklist for module/layer boundary correctness, dependency direction, API surface placement, architecture-doc drift, shared abstraction justification, concept duplication, and explicit handoff boundaries to specialist reviewers. | _(no frontmatter triggers)_ |
| `frontend-review-checklist` | Project-specific frontend review checklist for component correctness, page/layout structure, data-driven content, state management, styling, accessibility, performance, testing, and maintainability. | _(no frontmatter triggers)_ |
| `test-review-checklist` | Project-specific test review checklist for acceptance coverage, edge cases, failure paths, regression proof, weak assertions, flaky tests, fixture quality, order dependence, environment coupling, and validation evidence quality. | _(no frontmatter triggers)_ |
| `docs-review-checklist` | Project-specific documentation review checklist for docs/code/config drift, setup/run/test instruction accuracy, terminology consistency, link/reference integrity, and materiality filtering. | _(no frontmatter triggers)_ |
| `ops-review-checklist` | Project-specific ops review checklist for CI workflows, package manifests and lockfiles, build scripts, runtime and environment configuration, reproducibility, secrets and permissions, and supply-chain risk. | _(no frontmatter triggers)_ |
| `code-quality-review-checklist` | Project-specific code quality review checklist for maintainability, duplication, readability, naming, cohesion, function/class size, error handling, edge-case coverage, pattern consistency, avoidable complexity, and low-severity quality notes. | _(no frontmatter triggers)_ |

### Deep-dive companion checklists

Optional specialist skills for platform-specific or domain-specific deep dives.

| Skill | Purpose | Trigger Keywords |
| ------- | --------- | ----------------- |
| `frontend-a11y-checklist` | Project-specific deep accessibility review checklist for WCAG 2.1 AA compliance, semantic HTML, ARIA attributes, keyboard navigation, focus management, color contrast, screen reader behavior, modal traps, and responsive accessibility. | _(no frontmatter triggers)_ |
| `frontend-storybook-checklist` | Project-specific Storybook coverage review checklist for reusable UI components, story completeness, variant/state coverage, and static build validation. | _(no frontmatter triggers)_ |

Skills are referenced in agent `skills` arrays within `oh-my-opencode-slim.source.jsonc`. To assign a skill to an agent, add its identifier to the agent's `skills` array and rebuild.

## Rebuilding the Runtime File

To regenerate `oh-my-opencode-slim.json` from the source and prompt files:

```bash
pnpm run opencode:build
# or directly:
node .opencode/scripts/build-oh-my-opencode-slim-config.mjs
```

This script:

1. Reads `oh-my-opencode-slim.source.jsonc` (JSONC format with comments and trailing commas)
2. Resolves every `promptPath`/`orchestratorPromptPath` by reading the referenced Markdown file from `prompts/agents/`
3. Inlines the prompt content and removes the `*Path` fields
4. Validates that orchestrator prompts start with the expected `@<agent-name>` tag
5. Writes `oh-my-opencode-slim.json`

## Checking for Drift

To verify that the runtime file matches the source (no drift):

```bash
pnpm run opencode:check
# or directly:
node .opencode/scripts/build-oh-my-opencode-slim-config.mjs --check
```

The `--check` flag compares the in-memory generated output to the current runtime file. It exits with code 0 if they match and code 1 if they differ, printing a message with the rebuild command.

Run `pnpm run opencode:check` locally before committing any changes to prompt files, the source JSONC, or the orchestrator append.

## Official OMO Slim User-Level Overrides

This repository configures the `oh-my-opencode-slim` plugin via **repository-local** files. Official OMO Slim user-level overrides (via the global user config directory, e.g., `~/.config/opencode/plugins/oh-my-opencode-slim/`) still apply on top of this configuration. User-level overrides can extend or override agent configurations, presets, and other settings without modifying this repository.

To inspect active user-level overrides:

```bash
ls ~/.config/opencode/plugins/oh-my-opencode-slim/ 2>/dev/null || echo "No user-level overrides found"
```

## `opencode.json`

The file `opencode.json` contains general OpenCode runtime configuration: provider, model, plugins, LSP, and disabled built-in agents. It is not part of the OMO Slim source/generated split and should be edited directly when needed.

> **Note on the two disable mechanisms**: OMO Slim's `disabled_agents` (in `oh-my-opencode-slim.source.jsonc`) controls which **OMO Slim built-in agents** (`@observer`, `@oracle`, `@fixer`, etc.) are suppressed by the plugin. OpenCode's `agent.<name>.disable` (in `opencode.json`) controls which **core OpenCode built-in agents** (`explore`, `general`, etc.) are disabled at the platform level. These are independent mechanisms targeting different agent sets — do not conflate them.
