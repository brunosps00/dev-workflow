# dev-workflow

AI-driven development workflow commands for any project. Scaffolds a complete PRD-to-PR pipeline with multi-platform AI assistant support.

## Install

```bash
npx @brunosps00/dev-workflow init
```

This will:
1. Ask you to select a language (English or Portuguese)
2. Create `.dw/commands/` with 20 workflow commands
3. Create `.dw/templates/` with document templates (PRD, TechSpec, Tasks, ADR, etc.)
4. Create `.dw/rules/` (populated by `/dw-analyze-project`)
5. Install bundled skills (`dw-verify`, `dw-memory`, `dw-review-rigor`, `dw-ui-discipline`, `dw-testing-discipline`, `security-review`, etc.) to `.agents/skills/`
6. Generate skill wrappers for Claude Code, Codex, Copilot, and OpenCode
7. Configure MCP servers (Context7 + Playwright)

> **Compozy-inspired disciplines.** Since 0.5.0, dev-workflow bundles three primitives — `dw-verify`, `dw-memory`, `dw-review-rigor` — adapted from the [Compozy](https://github.com/compozy/compozy) project and invoked internally by existing commands. See [docs/compozy-integration.md](docs/compozy-integration.md) for what was ported and what was not.

Optional dependencies (Playwright browsers, react-doctor, Trivy, Docker):
```bash
npx @brunosps00/dev-workflow install-deps
```

## Commands

dev-workflow v1.0.0 ships **20 commands** organized into four tiers. Most users only invoke Tier 1 + Tier 2.

### Tier 1 — Gateway (3)

| Command | When |
|---------|------|
| **`/dw-autopilot "wish"`** | Default entry point. Full pipeline (PRD → TechSpec → Tasks → Run → QA → Review → Commit → PR) with 3 approval gates. |
| **`/dw-bugfix "description"`** | A bug report or pasted error. Triages bug-vs-feature-vs-scope, surgical fix or routes to a PRD. |
| **`/dw-help [keyword]`** | Discover commands. Pass a keyword for shortcuts; `--advanced` reveals internal commands. |

### Tier 2 — Pipeline granular (7)

Use these when you want step-by-step control instead of `/dw-autopilot`.

| Command | What |
|---------|------|
| **`/dw-brainstorm "idea"`** | Refine an idea before PRD. Flags: `--onepager` (durable artifact), `--council` (multi-advisor debate), `--research` (multi-source cited research), `--refactor` (Fowler code-smell catalog). |
| **`/dw-plan "feature"`** | PRD → TechSpec → Tasks sequentially with checkpoints. Stages: `prd`, `techspec`, `tasks`. Mandatory clarification questions, source-grounding, constitution gate, final consistency check. |
| **`/dw-run [task-id]`** | Execute tasks. Default: all pending in dependency order with wave-based parallel dispatch. Single-task: pass an ID. `--resume` continues an interrupted plan. |
| **`/dw-review`** | Level 2 (PRD coverage mapping) + Level 3 (code quality). Hard gates on dw-verify PASS, secure-audit, constitution violations. Flags: `--coverage-only`, `--code-only`. |
| **`/dw-qa`** | Mode-aware QA. Auto-detects UI vs API. Flags: `--fix` (iterative QA + fix-retest loop), `--api`, `--ai` (run AI eval against reference dataset). |
| **`/dw-commit`** | Atomic Conventional Commits for pending changes. Applies `dw-git-discipline` (one intent per commit, lint+tests+build green before). |
| **`/dw-generate-pr [target]`** | Push the branch, draft a PR body with summary + test plan, open the browser. Hard gates: dw-verify PASS + secure-audit. |

### Tier 3 — Specialty (5)

| Command | What |
|---------|------|
| **`/dw-analyze-project`** | Scans the repo, writes `.dw/rules/` (per-module conventions, anti-patterns, naming). Step 8 offers to generate `.dw/constitution.md` (declarative principles the team commits to). Run once per project; refresh after major refactors. |
| **`/dw-redesign-ui "target"`** | Audits a frontend page, runs the `dw-ui-discipline` 4-question grounding, proposes 2-3 design directions, ships the redesign. WCAG 2.2 AA accessibility floor is non-negotiable. |
| **`/dw-functional-doc`** | Maps screens + user flows into a functional doc, validated end-to-end with Playwright. |
| **`/dw-new-project`** | Bootstrap a new project from empty directory. Stack interview, wraps official `create-*` tools, composes docker-compose for dev, seeds `.env`, scripts, CI, `.dw/rules/`. |
| **`/dw-dockerize`** | Reads existing project, detects stack + runtime deps, proposes Dockerfile + docker-compose for dev/prod with explicit trade-offs (Conservative/Balanced/Bold). |

### Tier 4 — Hidden/Internal (5)

These are auto-invoked by Tier 1-3 commands. Available standalone via `/dw-help --advanced`.

| Command | What | Invoked by |
|---------|------|------------|
| **`/dw-adr "decision"`** | Records an Architecture Decision Record at `.dw/spec/<prd>/adrs/`. | `/dw-plan techspec --council`; deviations from constitution |
| **`/dw-intel "question"`** | Query codebase intelligence (`.dw/intel/`). `--build` (re)creates the index. | `/dw-plan`, `/dw-review`, `/dw-bugfix` |
| **`/dw-secure-audit`** | Unified security: OWASP + Trivy SCA/secret/IaC + lockfile + supply-chain check. Hard gate. Flags: `--scan-only`, `--plan`, `--execute`. | `/dw-review`, `/dw-generate-pr` (for TS/Python/C#/Rust) |
| **`/dw-find-skills "query"`** | Searches `npx skills` ecosystem, vets, installs. | manual when extending the bundle |
| **`/dw-update`** | Updates dev-workflow to latest npm release with rollback snapshot. | manual maintenance |

## Workflow

```
/dw-autopilot "wish"  ------>  Runs entire pipeline automatically
                                (3 gates: PRD approval, Tasks approval, PR confirmation)
    --- OR step-by-step ---

/dw-brainstorm  -->  /dw-plan           -->  .dw/spec/prd-{name}/{prd,techspec,tasks}.md
                          |
                    /dw-run              -->  atomic commits per task, dependency-aware
                          |
                    /dw-qa               -->  .dw/spec/prd-{name}/QA/ (UI / API / --ai)
                          |
                    /dw-review           -->  L2 PRD coverage + L3 code quality
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

## Auto-Trigger (CLAUDE.md / AGENTS.md)

`dev-workflow init` seeds two files at the project root with the same content: `CLAUDE.md` (read by Claude Code) and `AGENTS.md` (read by Codex CLI, Copilot CLI, and OpenCode). Together they tell the agent **when to invoke each `dw-*` command without being explicitly asked**.

**What's inside:**

- **Trigger Map** — 15 mappings from user intent ("Implement X", "Bug in Y", "Review my PR", ...) to the `dw-*` command the agent should run. `/dw-autopilot` is the safest default for non-trivial feature requests.
- **Hard Gates** — reminders that constitution violations (high/critical), missing `dw-verify` PASS, and security failures block downstream commands.
- **Escape Hatches** — explicit cases where the agent should NOT auto-trigger (typos, exploration, aesthetic edits, user opt-out).

**Why two files:** Claude Code, Codex, Copilot, and OpenCode all support agent-instruction conventions but use different filenames. Shipping both means every supported platform picks up the same trigger logic out of the box.

**Why descriptions, too:** every `dw-*` command's description leads with `Trigger when <user signal>...` so the agent can pick the right one even without consulting the trigger map. Both mechanisms reinforce each other.

**Merge-aware update.** The content lives between `<!-- dev-workflow:start -->` and `<!-- dev-workflow:end -->` markers. Anything you add **outside** the markers (your own house rules, project-specific guidelines) is preserved on every `dev-workflow update` — only the block inside is refreshed.

```bash
# After init, both files exist at project root
ls CLAUDE.md AGENTS.md

# Edit OUTSIDE the markers freely — survives updates
echo "## My team's house rules" >> CLAUDE.md
echo "..." >> CLAUDE.md

# Run update — block is refreshed, your additions stay
npx @brunosps00/dev-workflow update
```

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
│   ├── commands/          # 20 workflow command files (v1.0.0)
│   ├── templates/         # Document templates (PRD, TechSpec, etc.)
│   │   └── overrides/     # Project-local template customizations (override > core)
│   ├── rules/             # Project-specific rules (run /dw-analyze-project)
│   ├── constitution.md    # Declarative principles (auto-installed when missing)
│   ├── references/        # Reference documentation
│   ├── scripts/           # Utility scripts
│   └── spec/              # PRD directories — each contains tasks-validation.md
├── CLAUDE.md              # Auto-trigger decision tree for Claude Code (merge-aware)
├── AGENTS.md              # Same content for Codex / Copilot / OpenCode
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
| **dw-ui-discipline** | UI doctrine: 4 grounding questions (design source, surface job, state matrix, who/where/light/mood), 14 visual-slop patterns + 17 anti-defaults, WCAG 2.2 AA floor with verification recipes, 10 curated palette/font defaults for bootstrap | dev-workflow (original work) | MIT |
| **dw-testing-discipline** | Testing doctrine: six core rules, 12 positive patterns, 25 anti-patterns across 4 families (fragile/non-deterministic/mock-driven/suite-hygiene), 6 mandatory agent guardrails, flaky discipline + SLOs, Playwright recipes, browser security-boundary patterns | dev-workflow (original work) + browser-DevTools patterns from [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | MIT |
| **dw-incident-response** | Five-phase incident workflow (triage → investigation → resolution → communication → postmortem) with checkpoints and structured outputs to `.dw/incidents/`. Severity classification (SEV-1..4), runbook templates, on-call handoff, blameless postmortem template, action-item quality bar. | [wilsto/claude-code-starter-kit](https://github.com/wilsto/claude-code-starter-kit) (MIT, credits `wshobson/agents` v1.3.0) | MIT |
| **dw-llm-eval** | LLM/AI evaluation doctrine: five-rung oracle ladder (exact → schema → outcome → LLM-as-judge → human), judge calibration (Spearman ≥0.80 against humans), reference-dataset principle (20 from real failures > 200 synthetic), RAG metrics (precision@k + faithfulness + utilization), agent eval (outcome-vs-trajectory + 4 trajectory match modes) | Trajectory match modes from [`langchain-ai/agentevals`](https://github.com/langchain-ai/agentevals) (MIT); other patterns distilled from open evaluations literature | MIT |
| **vercel-react-best-practices** | 67 React/Next.js performance optimization rules across 8 priority categories. Wraps the rules with `references/perf-discipline.md` (measure → identify → fix → verify → guard) so perf work is data-driven, not vibes-based | [Vercel Labs](https://github.com/vercel-labs/agent-skills) + [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | MIT |
| **security-review** | Systematic vulnerability review based on OWASP with confidence-based reporting | [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) | CC BY-SA 4.0 |
| **humanizer** | Detects and removes 24 AI writing patterns based on Wikipedia's "Signs of AI Writing" guide | [Wikipedia AI Writing Guide](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) | -- |
| **remotion-best-practices** | 25+ rules for video creation in React with Remotion | [Remotion](https://www.remotion.dev/) | -- |

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

Source-driven development, code simplification, debugging discipline, and git workflow patterns adapted from [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) by Addy Osmani (MIT) into the bundled `dw-source-grounding`, `dw-simplification`, `dw-debug-protocol`, and `dw-git-discipline` skills. Performance-optimization workflow (`vercel-react-best-practices/references/perf-discipline.md`) and API-design discipline (`dw-codebase-intel/references/api-design-discipline.md`) also incorporated as enhancements to existing bundled skills. Browser security-boundary and three-workflow-patterns (originally from `addyosmani/agent-skills/browser-devtools`) now live inside `dw-testing-discipline/references/`.

Spec-Driven Development patterns — declarative constitution (`.dw/constitution.md`), cross-artifact consistency check (PRD ↔ TechSpec ↔ Tasks), and template override layer (`.dw/templates/overrides/`) — adapted from [`github/spec-kit`](https://github.com/github/spec-kit) by GitHub (MIT). dev-workflow specifics: embedded into existing commands instead of new slash commands, severity-graded enforcement (`info`/`high`/`critical`) with ADR-justified deviation as the escape hatch, ausência-of-constitution never blocks (auto-installs defaults and continues), and integration with the analytical `.dw/rules/` already produced by `/dw-analyze-project`.

UI discipline (`dw-ui-discipline`) and testing doctrine (`dw-testing-discipline`) are original works in this repository. Earlier dev-workflow versions (≤0.13.x) drew on `pedronauck/skills` `ui-craft` and `testing-boss` as inspiration, but in v0.14.0 those skills were rewritten clean-room after a license audit confirmed that the upstream repo has no explicit LICENSE file at root — the README's MIT claim is unverified. The underlying ideas (grounding before design; behavior over mocks; mutation over coverage) are widely-documented general software engineering principles available in many sources (Beck, Fowler, Meszaros, Feathers, Google SRE Book, WCAG specifications). Browser-DevTools patterns from [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) (MIT) live inside `dw-testing-discipline/references/` (`security-boundary.md`, `three-workflow-patterns.md`).

Incident response (`dw-incident-response`) adapted from [`wilsto/claude-code-starter-kit/incident-response`](https://github.com/wilsto/claude-code-starter-kit) (MIT). The 5-phase workflow structure and runbook templates come from there. wilsto credits the upstream `wshobson/agents` plugin `incident-response` (v1.3.0); attribution chain preserved. Additional reading cited in the skill: Google SRE Book, Etsy Debriefing Facilitation Guide, PagerDuty Incident Response Documentation.

LLM evaluation (`dw-llm-eval`) trajectory-match modes (strict / unordered / subset / superset) and tool-argument matching strategies adapted from [`langchain-ai/agentevals`](https://github.com/langchain-ai/agentevals) (MIT). The broader oracle-ladder framing, judge-calibration discipline, and reference-dataset principle are distilled from the open evaluations literature (OpenAI evals cookbook, Anthropic evals guidance, the academic eval-of-LLM body of work) and rewritten in our voice.

## Migration from v0.x (1.0.0 is a consolidation release)

v1.0.0 consolidates 30 commands → 20. **The `dev-workflow update` command auto-removes obsolete wrappers** via the migrator that landed in v0.13.0; no manual action required.

### Command renames (15 → 7 merged)

| Old (v0.x) | New (v1.0.0) |
|-----------|--------------|
| `/dw-create-prd` | `/dw-plan prd` |
| `/dw-create-techspec` | `/dw-plan techspec` |
| `/dw-create-tasks` | `/dw-plan tasks` |
| `/dw-run-task <id>` | `/dw-run <id>` |
| `/dw-run-plan` | `/dw-run` |
| `/dw-code-review` | `/dw-review --code-only` |
| `/dw-review-implementation` | `/dw-review --coverage-only` |
| `/dw-run-qa` | `/dw-qa` |
| `/dw-fix-qa` | `/dw-qa --fix` |
| `/dw-security-check` | `/dw-secure-audit` |
| `/dw-deps-audit` | `/dw-secure-audit --plan` |
| `/dw-map-codebase` | `/dw-intel --build` |
| `/dw-deep-research` | `/dw-brainstorm --research` |
| `/dw-refactoring-analysis` | `/dw-brainstorm --refactor` |

### Removed (1)

- `/dw-revert-task` → use `git revert <sha>` directly. No replacement.

### Bundled skill swaps (already shipped in v0.13.0; carries over)

- `ui-ux-pro-max` → `dw-ui-discipline`
- `webapp-testing` → `dw-testing-discipline`

### What the migrator does for you

On the next `npx @brunosps00/dev-workflow update`, the following happens automatically:

1. The 15 renamed commands' wrappers are detected as orphans (their names no longer exist in `lib/constants.js`) and removed from `.claude/skills/`, `.agents/skills/`, and `.opencode/commands/`.
2. The migrator prints each removal with the friendly "old → new" mapping (e.g., `[orphan] Removing wrapper .agents/skills/dw-create-prd (replaced in v1.0.0 by 'dw-plan prd')`).
3. The 20 new wrappers are installed for the consolidated commands.
4. The 17 bundled skills are refreshed.

### Backwards compatibility

**There is none** — v1.0.0 is a clean cut per design. There are no aliases. Calling `/dw-create-prd` will not work; use `/dw-plan prd`. Update your team's runbooks and AI-agent instructions (CLAUDE.md / AGENTS.md) accordingly; the auto-trigger map in `agent-instructions.md` is already updated.

### CLAUDE.md / AGENTS.md updates

The Trigger Map block (between `<!-- dev-workflow:start -->` and `<!-- dev-workflow:end -->`) refreshes automatically on update with the v1.0.0 command surface. Your edits outside the markers are preserved.

## License

MIT
