# dev-workflow

AI-driven development workflow commands for any project. Scaffolds a complete PRD-to-PR pipeline with multi-platform AI assistant support.

## Install

```bash
npx @brunosps00/dev-workflow init
```

This will:
1. Ask you to select a language (English or Portuguese)
2. Create `.dw/commands/` with 31 workflow commands
3. Create `.dw/templates/` with document templates (PRD, TechSpec, Tasks, ADR, etc.)
4. Create `.dw/rules/` (populated by `/dw-analyze-project`)
5. Install bundled skills (`dw-verify`, `dw-memory`, `dw-review-rigor`, `ui-ux-pro-max`, `security-review`, etc.) to `.agents/skills/`
6. Generate skill wrappers for Claude Code, Codex, Copilot, and OpenCode
7. Configure MCP servers (Context7 + Playwright)

> **Compozy-inspired disciplines.** Since 0.5.0, dev-workflow bundles three primitives — `dw-verify`, `dw-memory`, `dw-review-rigor` — adapted from the [Compozy](https://github.com/compozy/compozy) project and invoked internally by existing commands. See [docs/compozy-integration.md](docs/compozy-integration.md) for what was ported and what was not.

Optional dependencies (Playwright browsers, react-doctor, Trivy, Docker):
```bash
npx @brunosps00/dev-workflow install-deps
```

## Commands

### Planning

#### `/dw-brainstorm`
Facilitates structured ideation before opening a PRD or implementation. Explores multiple directions — conservative, balanced, and bold — with trade-offs for each, then converges on concrete next steps. **Product-aware**: when PRDs or rules exist, automatically reads them to produce a Feature Inventory and tags each option as `[IMPROVES: <feature>]`, `[CONSOLIDATES: <A>+<B>]`, or `[NEW]`. With optional `--onepager` flag, generates a durable one-pager at `.dw/spec/ideas/<slug>.md` that `/dw-create-prd` can consume to reduce clarification questions. Inspired by [`addyosmani/agent-skills@idea-refine`](https://skills.sh/addyosmani/agent-skills/idea-refine), adapted to product-level (features) rather than code-level grounding. No code is written or project files modified by the brainstorm itself.

#### `/dw-autopilot`
Full pipeline orchestrator that takes a wish and automatically runs the entire development flow: codebase intelligence (`/dw-map-codebase` + `/dw-intel`), research (conditional), brainstorm, PRD, techspec, tasks, execution (gated by goal-backward plan verification, then wave-based parallel dispatch from the `dw-execute-phase` bundled skill), QA, review, and commit. Stops at 3 gates: PRD approval, tasks approval, and PR confirmation.

#### `/dw-create-prd`
Creates a Product Requirements Document by first asking at least 7 clarification questions to fully understand the feature. Generates a structured PRD with numbered functional requirements focused on what and why, saved to `.dw/spec/prd-[feature-name]/prd.md`.

#### `/dw-create-techspec`
Generates a Technical Specification from an existing PRD after performing web searches and asking at least 7 clarification questions. Evaluates existing libraries vs custom development, defines testing strategy, branch naming, and integration architecture. Output is saved to `.dw/spec/prd-[feature-name]/techspec.md`.

#### `/dw-create-tasks`
Breaks down the PRD and TechSpec into implementable tasks with a target of ~6 tasks per feature (max 2 functional requirements each). Creates individual task files with subtasks and success criteria, ensuring end-to-end coverage across backend, frontend, and functional UI. Requires approval before finalizing.

### Execution

#### `/dw-run-task`
Executes a single task from the task list, implementing code that follows project patterns and includes mandatory unit tests. Performs Level 1 validation (acceptance criteria + tests + standards check) and creates a commit upon completion.

#### `/dw-run-plan`
Executes all pending tasks via the `dw-execute-phase` bundled skill — gated by 6-dimension goal-backward verification (`plan-checker` agent) before any code is touched. Wave-based parallel dispatch (`executor` agent) for independent tasks; atomic commit per task; deviation handling. After all tasks complete, performs a final Level 2 review (PRD compliance) with an interactive corrections cycle until no gaps remain or the user accepts pending items.

#### `/dw-bugfix`
Analyzes and fixes bugs with automatic triage that distinguishes between bugs, feature requests, and excessive scope. Asks exactly 3 clarification questions before proposing a solution. Supports Direct mode (executes fix immediately) and Analysis mode (`--analysis`) that generates a document for the techspec/tasks pipeline.

#### `/dw-redesign-ui`
Audits existing frontend pages or components, proposes 2-3 design directions using `ui-ux-pro-max` (colors, typography, layout), waits for user approval, then implements the redesign following the project's CSS methodology. Framework-agnostic (React, Angular, Vue). Generates a design contract persisted for consistency across tasks.

### Quality

#### `/dw-run-qa`
Validates the implementation against PRD, TechSpec, and Tasks. **Mode-aware**: in UI mode, drives Playwright MCP for E2E browser tests with happy paths, edge cases, negative flows, regressions, WCAG 2.2 accessibility, and screenshot evidence. In API mode (auto-detected when no UI deps are in the manifest, or forced via `--api`), composes per-RF `.http` / pytest+httpx / supertest / WebApplicationFactory / reqwest scripts from the bundled `api-testing-recipes` skill, executes them, and writes JSONL request/response logs to `QA/logs/api/` as evidence. The matrix expands to {200 happy / 4xx validation/auth/authz/not-found/conflict / 5xx / contract drift / cross-tenant denial}. Optional `--from-openapi` adds a baseline derived from the project's OpenAPI spec. Generates a QA report, documents bugs with mode-aware evidence, and detects stub/placeholder pages (UI) or unmapped spec endpoints (API).

#### `/dw-fix-qa`
Fixes bugs found during QA testing with evidence-driven retesting. **Mode-aware**: in UI mode replays the failing flow via Playwright MCP and saves a retest screenshot; in API mode replays the failing `.http`/recipe and appends a `verdict: PASS|FAIL` JSONL line to `QA/logs/api/BUG-NN-retest.log`. Runs iterative cycles of identify, fix, retest, updating `QA/bugs.md` and `QA/qa-report.md` with status and mode-correct evidence.

#### `/dw-review-implementation`
Compares documented requirements (PRD + TechSpec + Tasks) against actual code as a Level 2 review. Maps each requirement to endpoints and tasks with evidence, identifies gaps, partial implementations, and extra undocumented code. After the coverage map is complete, automatically chains `/dw-code-review` (Level 3 quality layer) so a single invocation produces a consolidated coverage + quality report — pass `--no-code-review` if you want only Level 2.

#### `/dw-code-review`
Performs a formal Level 3 code review before PR creation, verifying PRD compliance, code quality (SOLID, DRY, complexity, security), and conformance with project rules in `.dw/rules/`. Runs tests, verifies coverage targets, and generates a persistent report with APPROVED, APPROVED WITH CAVEATS, or REJECTED status.

#### `/dw-refactoring-analysis`
Audits the codebase for code smells and refactoring opportunities using Martin Fowler's catalog. Detects bloaters, change preventers, dispensables, couplers, conditional complexity, and DRY violations, then maps each to a concrete refactoring technique with before/after code sketches. Includes coupling/cohesion metrics, SOLID analysis, and a prioritized action plan (P0-P3).

#### `/dw-security-check`
Rigid multi-layer security check for **TypeScript, Python, C#, and Rust** projects. Combines OWASP static review (language-aware, via the bundled `security-review` skill), Trivy SCA/secret/IaC scanning (`trivy fs` + `trivy config`), and native lockfile audit (`npm audit` / `pip-audit` / `dotnet list package --vulnerable` / `cargo audit`). Consults Context7 MCP for framework-version-specific best practices (Next.js, Django, ASP.NET Core, Actix/Axum/Rocket, etc.). Hard gates: any CRITICAL or HIGH finding produces REJECTED status, blocking `/dw-code-review`, `/dw-review-implementation`, and `/dw-generate-pr`. No bypass flag. Requires Trivy (install via `install-deps`).

#### `/dw-deps-audit`
Supply-chain remediation orchestrator for **TypeScript, Python, C#, and Rust** projects. Runs three detection signals — `npm/pnpm/pip-audit/dotnet/cargo audit` for known CVEs, the `outdated` companions for stale versions, and an OSV.dev + GitHub Advisories cross-check (with a hardcoded fallback list of historical malicious-package incidents like `event-stream`, `ua-parser-js`, `node-ipc`) for supply-chain attacks. Classifies findings into COMPROMISED / CRITICAL / HIGH / OUTDATED-MAJOR / OUTDATED-MINOR tiers, maps each affected package to the files that import it and the tests that cover those files, then drafts a per-package update plan with three options (Conservative / Balanced / Bold) and trade-offs. Modes: `--scan-only` (CI), `--plan` (default — no file writes), `--execute` (applies updates with scoped tests, one `/dw-fix-qa` retry, atomic commits, and `/dw-run-qa` as final gate; reverts and marks BLOCKED if recovery fails). Complementary to `/dw-security-check`: that one is the single-shot gate, this one is the planner-and-remediator.

### Git & PR

#### `/dw-commit`
Analyzes pending changes, groups them by feature or logical context, and creates atomic semantic commits following the Conventional Commits format. Uses allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.

#### `/dw-generate-pr`
Pushes the branch to remote and creates a Pull Request on GitHub with a structured description. Collects information from the PRD and modified files, runs tests, then generates a PR body with summary, changes grouped by module, test plan, and deploy notes. **Hard gate**: requires a fresh `dw-verify` PASS in the current session before the push.

#### `/dw-revert-task`
Safely reverts the commits of a specific task created by `/dw-run-task`, with dependency-aware checks (blocks if subsequent tasks already executed depend on it) and explicit user confirmation. Updates `tasks.md` to re-mark the task as pending.

### Project Bootstrap

#### `/dw-new-project`
Bootstraps a new project from an empty directory. Runs a wide stack interview (frontend/backend/fullstack, language, framework, db, cache, queue, email, storage, search, auth, observability, reverse proxy, scheduler, CI, linter), then wraps the right official `create-*` tools (`pnpm create next-app`, `pnpm create vite`, `pnpm dlx create-t3-app`, `dotnet new webapi`, `cargo new`, etc.) to scaffold the apps. Composes a `docker-compose.dev.yml` from the bundled `docker-compose-recipes` skill (postgres, redis, mailhog by default for email-in-dev, minio, meilisearch, jaeger, traefik, etc.), seeds `.env.example`, root scripts (`dev:up`/`down`/`logs`/`reset`), `.gitignore`/`.dockerignore`, GitHub Action, README with port table, and a minimal `.dw/rules/index.md`. Hard gate: presents a one-pager + plan and waits for explicit approval before touching disk.

### Containerization

#### `/dw-dockerize`
Reads an existing project, detects language / framework / package manager / runtime infra deps (postgres, redis, queue, email, storage, search, OTel) by parsing manifests and import statements, then proposes Docker artifacts. Modes: `--dev` (default if no Dockerfile exists) generates `docker-compose.dev.yml` + `Dockerfile.dev` from the bundled `docker-compose-recipes` skill; `--prod` generates a multi-stage `Dockerfile` (Conservative slim / Balanced alpine / Bold distroless — brainstormed with trade-offs) + optional `docker-compose.prod.yml` with non-root user, healthcheck, no secrets baked in; `--both` ships both; `--audit` (default if Docker artifacts already exist) reports findings against `security-review/infrastructure/docker.md` without overwriting. Hard gate: presents the file tree and waits for approval before any write. Sister command to `/dw-new-project` — they share the `docker-compose-recipes` bundled skill.

### Architectural Decisions

#### `/dw-adr`
Records an Architecture Decision Record (ADR) for a non-trivial decision during PRD execution. Creates `.dw/spec/<prd>/adrs/adr-NNN.md` with Context / Decision / Alternatives / Consequences, and updates cross-references in the PRD/TechSpec/Task. Inspired by the ADR pattern from [Compozy](https://github.com/compozy/compozy).

### Intelligence

#### `/dw-intel`
Queries codebase intelligence to answer questions about patterns, conventions, and architecture. Reads `.dw/intel/` (built by `/dw-map-codebase`) as primary source, falls back to `.dw/rules/` and direct grep when absent. Surfaces stale-index warnings (>7 days). Always cites sources with file paths and line numbers.

#### `/dw-analyze-project`
Scans the repository to identify tech stack, architectural patterns, naming conventions, and anti-patterns. Generates structured documentation in `.dw/rules/` with a project overview (`index.md`) and per-module rule files containing real code examples. Also invokes `/dw-map-codebase` to build the queryable index in `.dw/intel/` (the two are complementary — rules are human-readable, intel is machine-queryable).

#### `/dw-deep-research`
Conducts multi-source research with citation tracking and verification across quick, standard, deep, and ultradeep modes. Executes parallel information gathering, triangulation, and cross-reference verification through 8+ phases, producing a professional report with complete bibliography.

#### `/dw-functional-doc`
Generates a functional documentation dossier with screen mapping, E2E flows, and Playwright validation. Maps routes, components, and user journeys into structured documentation with evidence.

#### `/dw-help`
Displays the complete guide of available commands, integration flows, and when to use each one. Can be invoked without arguments for the full guide or with a specific command name for a detailed section.

#### `/dw-find-skills`
Discovers skills from the open agent skills ecosystem (`npx skills` / [skills.sh](https://skills.sh/)) when no `dw-*` already covers the request. Checks the leaderboard first, then runs `npx skills find <query>` if needed, vets each candidate (install count, source reputation, GitHub stars), and presents 1–3 options with the install commands. Asks whether to install globally (`-g`, lands in `~/.agents/skills/`) or locally (this repo) before running `npx skills add`. Falls back to `/dw-brainstorm` or `/dw-run-task` when no skill matches. Ports the `find-skills` Claude superpowers skill into a `dw-*` command so every supported platform gets the same discovery on-ramp.

## Workflow

```
/dw-autopilot "wish"  ------>  Runs entire pipeline automatically
                                (gates: PRD approval, Tasks approval, PR confirmation)
    --- OR ---

/dw-brainstorm  ------>  /dw-create-prd  -->  .dw/spec/prd-{name}/prd.md
                            |
                        /dw-create-techspec  -->  .dw/spec/prd-{name}/techspec.md
                            |
                        /dw-create-tasks  -->  .dw/spec/prd-{name}/tasks.md + {N}_task.md
                            |
                        /dw-run-task (one at a time)
                            |       or
                        /dw-run-plan (all tasks — wave-based parallel native)
                            |
                        /dw-run-qa  -->  .dw/spec/prd-{name}/QA/
                            |
                        /dw-fix-qa (if bugs found)
                            |
                        /dw-review-implementation  -->  PRD compliance check
                            |
                        /dw-code-review  -->  .dw/spec/prd-{name}/QA/dw-code-review.md
                            |
                        /dw-commit + /dw-generate-pr

Shortcuts:
  /dw-intel "question"         Query codebase intelligence
  /dw-redesign-ui "target"     Visual redesign of a page or component
```

## Constitution

A **constitution** is a declarative list of principles your team commits to (e.g., "every state-changing endpoint requires server-side authorization", "every bug fix ships with a regression test"). It lives at `.dw/constitution.md` and complements `.dw/rules/`:

| File | Type | Authored by |
|------|------|-------------|
| `.dw/rules/` | Analytical — describes what the code IS (observed patterns) | `/dw-analyze-project` |
| `.dw/constitution.md` | Declarative — describes what the code SHOULD BE (committed principles) | `/dw-analyze-project` (Step 8) or auto-installed defaults |

**How it works:**

- `/dw-analyze-project` offers three paths: synthesize from observed patterns (with your approval), install canonical defaults, or skip.
- If `/dw-create-prd`, `/dw-create-techspec`, or `/dw-code-review` run **without** a constitution, they auto-install the defaults template (10 canonical principles at `severity: info`), notify in chat, and continue. Ausência nunca bloqueia.
- Once principles exist:
  - `severity: info` → reported, never blocks.
  - `severity: high` → blocks PR/techspec when violated, unless an ADR justifies the deviation.
  - `severity: critical` → blocks plus requires reviewer sign-off in the ADR.
- Defaults start at `info`; you promote severities as your team trusts enforcement.

**Tasks consistency check.** At the end of `/dw-create-tasks`, a 5-dimension consistency check validates PRD ↔ TechSpec ↔ Tasks alignment (FR coverage, task grounding, test coverage, dependency DAG, constitution alignment) and writes `.dw/spec/prd-<feature>/tasks-validation.md`. Any FAIL blocks user approval until resolved or explicitly overridden.

## Template Overrides

Customize templates locally without losing dev-workflow updates. Drop a file at `.dw/templates/overrides/<name>.md`; the override is used in place of the bundled core template on every `update`. Subdirectories work too (e.g., `.dw/templates/overrides/functional-doc/e2e-runbook.md`). See `.dw/templates/overrides/README.md` (created on init) for the workflow and `diff` cadence guidance.

## Platform Support

| Platform | Wrapper Location | Status |
|----------|-----------------|--------|
| Claude Code | `.claude/skills/` | Full support |
| Codex CLI | `.agents/skills/` | Full support |
| Copilot | `.agents/skills/` | Full support |
| OpenCode | `.opencode/commands/` | Full support |

All wrappers point to `.dw/commands/` as the single source of truth.

## Project Structure (after init)

```
your-project/
├── .dw/
│   ├── commands/          # 30 workflow command files
│   ├── templates/         # Document templates (PRD, TechSpec, etc.)
│   │   └── overrides/     # Project-local template customizations (override > core)
│   ├── rules/             # Project-specific rules (run /dw-analyze-project)
│   ├── constitution.md    # Declarative principles (auto-installed when missing)
│   ├── references/        # Reference documentation
│   ├── scripts/           # Utility scripts
│   └── spec/              # PRD directories — each contains tasks-validation.md
├── .claude/
│   ├── skills/            # Claude Code wrappers
│   └── settings.json      # MCP servers (Context7, Playwright)
├── .agents/skills/        # Codex/Copilot wrappers + bundled skills
└── .opencode/commands/    # OpenCode wrappers
```

## Bundled Skills

Skills installed to `.agents/skills/` for use by all commands.

### Workflow discipline (invoked internally by dw-* commands)

These are not slash commands — they are primitives other commands call to enforce discipline. You never invoke them directly; the commands that need them do so transparently.

| Skill | Description | Invoked by | Inspired by |
|-------|-------------|------------|-------------|
| **dw-verify** | Enforces fresh verification evidence before any completion, commit, or PR claim — with Iron Law, gate function, and Verification Report template | `dw-run-task`, `dw-run-plan`, `dw-fix-qa`, `dw-bugfix`, `dw-code-review`, `dw-generate-pr` | [Compozy](https://github.com/compozy/compozy) `cy-final-verify` |
| **dw-memory** | Two-tier workflow memory (shared `MEMORY.md` + per-task `<N>_memory.md`) with promotion test and compaction rules, so cross-task context persists cleanly | `dw-run-task`, `dw-run-plan`, `dw-autopilot` | [Compozy](https://github.com/compozy/compozy) `cy-workflow-memory` |
| **dw-review-rigor** | Review discipline: de-duplication, severity ordering, verify-intent-before-flagging, skip-linter-issues, signal-over-volume | `dw-code-review`, `dw-review-implementation`, `dw-refactoring-analysis` | [Compozy](https://github.com/compozy/compozy) `cy-review-round` |
| **dw-council** | Multi-advisor debate (3-5 archetypes) with steel-manning, concession tracking, and dissent-preserving synthesis. Opt-in only. | `dw-brainstorm --council`, `dw-create-techspec --council` | [Compozy](https://github.com/compozy/compozy) `cy-idea-factory` |
| **dw-codebase-intel** | Codebase intelligence (`stack.json`, `files.json`, `apis.json`, `deps.json`, `arch.md`) with incremental updates and query patterns. Cross-cutting reference: `api-design-discipline` (Hyrum's Law, contract-first, error semantics) used when techspecs design API endpoints. | `/dw-intel`, `/dw-map-codebase`, `dw-create-techspec` | [`get-shit-done-cc`](https://github.com/gsd-build/get-shit-done) (MIT) + [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) |
| **dw-execute-phase** | Goal-backward 6-dimension plan verification (`plan-checker`) and wave-based parallel task execution (`executor`) with atomic commit, deviation handling, and checkpoint recovery | `dw-run-plan`, `dw-autopilot` | [`get-shit-done-cc`](https://github.com/gsd-build/get-shit-done) (MIT) |
| **dw-source-grounding** | Detect → Fetch → Implement → Cite protocol with `[source: <url>, version: X.Y, retrieved: YYYY-MM-DD]` citations. Strict source-priority hierarchy (Tier 1 official docs > Tier 2 maintainer blogs > Tier 3 Stack Overflow as discovery only). | `dw-create-techspec`, `dw-deps-audit`, `dw-deep-research` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) |
| **dw-simplification** | Chesterton's Fence (understand WHY before changing), behavior-preserving refactor protocol (test gate before/after), complexity metrics (cyclomatic, cognitive, depth, fan-out), Rule of 500 for large refactors | `dw-code-review`, `dw-refactoring-analysis` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) |
| **dw-debug-protocol** | Stop-the-line discipline plus six-step triage (Reproduce → Localize → Reduce → Fix Root Cause → Guard → Verify End-to-End). Error categorization matrix; instrument-first non-reproducible-bug strategy. | `dw-bugfix`, `dw-fix-qa` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) |
| **dw-git-discipline** | Trunk-based pattern (1-3 day branches, daily rebase, feature flags), atomic commit discipline (one intent per commit; refactor separate from feature), Conventional Commits, branch hygiene | `dw-commit`, `dw-generate-pr` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) |

### Domain expertise

| Skill | Description | Source | License |
|-------|-------------|--------|---------|
| **ui-ux-pro-max** | Design intelligence: 50+ styles, 161 color palettes, 57 font pairings, 99 UX guidelines across 10 stacks | [Next Level Builder](https://github.com/skills-sh) | MIT |
| **vercel-react-best-practices** | 67 React/Next.js performance optimization rules across 8 priority categories. Wraps the rules with `references/perf-discipline.md` (measure → identify → fix → verify → guard) so perf work is data-driven, not vibes-based | [Vercel Labs](https://github.com/vercel-labs/agent-skills) + [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | MIT |
| **security-review** | Systematic vulnerability review based on OWASP with confidence-based reporting | [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) | CC BY-SA 4.0 |
| **humanizer** | Detects and removes 24 AI writing patterns based on Wikipedia's "Signs of AI Writing" guide | [Wikipedia AI Writing Guide](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) | -- |
| **remotion-best-practices** | 25+ rules for video creation in React with Remotion | [Remotion](https://www.remotion.dev/) | -- |
| **webapp-testing** | Playwright-based browser testing toolkit for E2E validation and screenshots. Cross-cutting references: `security-boundary` (every byte from a browser is potentially attacker-controlled) and `three-workflow-patterns` (UI bugs vs network issues vs perf — distinct workflows, don't conflate) | [Playwright](https://playwright.dev/) + [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | -- |

## Dependencies

Installed via `npx @brunosps00/dev-workflow install-deps`:

| Dependency | Purpose | Link |
|------------|---------|------|
| **Playwright** | Browser automation for QA, E2E tests, and visual validation | [playwright.dev](https://playwright.dev/) |
| **Context7 MCP** | Contextual documentation lookup for AI assistants | [upstash/context7-mcp](https://github.com/upstash/context7-mcp) |
| **react-doctor** | Health score and diagnostics for React projects | [react.doctor](https://www.react.doctor/) |
| **Trivy** | Native binary scanner used by `/dw-security-check` for CVE, secret, and IaC scanning. `install-deps` detects presence and prints OS-specific install instructions (brew / curl script / choco / Docker) — does not install automatically. | [aquasecurity.github.io/trivy](https://aquasecurity.github.io/trivy/) |
| **Docker + Docker Compose** | Required by `/dw-new-project` and `/dw-dockerize` for dev dependency seeding and image generation. `install-deps` detects presence and prints OS-specific install instructions — does not install automatically. | [docs.docker.com](https://docs.docker.com/engine/install/) |

## Options

```bash
npx @brunosps00/dev-workflow init                  # Interactive language selection
npx @brunosps00/dev-workflow init --lang=en        # English, skip prompt
npx @brunosps00/dev-workflow init --lang=pt-br     # Portuguese, skip prompt
npx @brunosps00/dev-workflow init --force          # Overwrite existing files
npx @brunosps00/dev-workflow update                # Update commands/templates only
npx @brunosps00/dev-workflow install-deps          # Install Playwright, react-doctor; check Trivy, Docker
npx @brunosps00/dev-workflow help                  # Show help
```

## Getting Started

After running `npx @brunosps00/dev-workflow init`:

1. **Run `/dw-analyze-project`** in your AI assistant to generate project rules
2. **Run `/dw-brainstorm`** to start planning a new feature
3. **Run `/dw-help`** to see all available commands and workflows
4. **(Optional) Run `npx @brunosps00/dev-workflow install-deps`** to install Playwright + react-doctor and check Trivy + Docker
5. **Run `/dw-map-codebase`** once your project has source files to build the queryable index in `.dw/intel/`

## Acknowledgements

Codebase intelligence (`/dw-intel`, `/dw-map-codebase`, the `dw-codebase-intel` bundled skill) and phase execution patterns (the `dw-execute-phase` bundled skill, with its `plan-checker` and `executor` agents) were adapted from [`get-shit-done-cc`](https://github.com/gsd-build/get-shit-done) by gsd-build (MIT). Schemas (`stack.json`, `files.json`, `apis.json`, `deps.json`, `arch.md`), the goal-backward verification protocol, and the wave-based parallel execution pattern come from there. dev-workflow specifics: `.dw/` namespace instead of `.planning/`, agent-driven runtime instead of `gsd-sdk` CLI, integration with the rest of the `dw-*` command surface.

Source-driven development, code simplification, debugging discipline, and git workflow patterns adapted from [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) by Addy Osmani (MIT) into the bundled `dw-source-grounding`, `dw-simplification`, `dw-debug-protocol`, and `dw-git-discipline` skills. Performance-optimization workflow (`vercel-react-best-practices/references/perf-discipline.md`), API-design discipline (`dw-codebase-intel/references/api-design-discipline.md`), and browser-DevTools patterns (`webapp-testing/references/{security-boundary, three-workflow-patterns}`) also incorporated as enhancements to existing bundled skills.

Spec-Driven Development patterns — declarative constitution (`.dw/constitution.md`), cross-artifact consistency check (PRD ↔ TechSpec ↔ Tasks), and template override layer (`.dw/templates/overrides/`) — adapted from [`github/spec-kit`](https://github.com/github/spec-kit) by GitHub (MIT). dev-workflow specifics: embedded into existing commands instead of new slash commands, severity-graded enforcement (`info`/`high`/`critical`) with ADR-justified deviation as the escape hatch, ausência-of-constitution never blocks (auto-installs defaults and continues), and integration with the analytical `.dw/rules/` already produced by `/dw-analyze-project`.

## License

MIT
