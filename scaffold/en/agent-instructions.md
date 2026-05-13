<!-- dev-workflow:start -->
# dev-workflow — AI Agent Instructions

This project uses [`@brunosps00/dev-workflow`](https://www.npmjs.com/package/@brunosps00/dev-workflow) (`dw-*` commands) for structured AI-driven development. The commands compose into a PRD → TechSpec → Tasks → Implement → Review → Commit → PR pipeline with hard gates for security, constitution compliance, and verification.

**The whole point of this file:** when the user states an intent that matches the Trigger Map below, run the matching `dw-*` command **without asking permission first** — unless the change is genuinely trivial (see Escape Hatches).

## Trigger Map

| User intent (literal or paraphrased) | Auto-trigger |
|--------------------------------------|--------------|
| "Implement X" / "Build Y" / "Add feature Z" / "I need ..." / "Create ..." | `/dw-autopilot "X"` |
| Pasted error / "X is broken" / "Bug in Y" / failing test screenshot | `/dw-bugfix "X"` |
| "Plan this feature" / "Write a PRD + techspec + tasks" | `/dw-plan "X"` |
| "Write a PRD for X" / "Spec out Y" | `/dw-plan prd "X"` |
| "Design the architecture" / "Make the techspec" | `/dw-plan techspec` |
| "Break this into tasks" | `/dw-plan tasks` |
| "Run this task" (with task ID) | `/dw-run <ID>` |
| "Run all pending tasks" / "Execute the plan" | `/dw-run` |
| "Continue where I left off" | `/dw-run --resume` |
| "QA this feature" / "Run the test plan" | `/dw-qa` |
| "Fix the QA bugs" | `/dw-qa --fix` |
| "Evaluate the AI feature" / "Test the RAG / classifier" | `/dw-qa --ai` |
| "Review my PR" / "Check code quality" / "Is this ready to ship?" | `/dw-review` |
| "Just the PRD coverage check" | `/dw-review --coverage-only` |
| "Just the code quality review" | `/dw-review --code-only` |
| "Time to commit" / changes are validated and ready | `/dw-commit` |
| "Open a PR" / "Ship this" | `/dw-generate-pr` |
| "Brainstorm X" / "Explore ideas" | `/dw-brainstorm "X"` |
| "Research X" / "Compare A vs B with citations" | `/dw-brainstorm --research "X"` |
| "Code-health audit" / "Find tech debt" / "Refactoring opportunities" | `/dw-brainstorm --refactor` |
| "Where is X?" / "What uses Y?" / "How is Z structured?" | `/dw-intel "<question>"` |
| "Rebuild the codebase index" / "Refresh intel" | `/dw-intel --build` |
| "Redesign this UI" / "Audit and ship a new design" | `/dw-redesign-ui "<target>"` |
| "Audit dependencies" / "Are we behind on packages?" | `/dw-secure-audit --plan` |
| "Scan for vulnerabilities" / "Security check" | `/dw-secure-audit` |
| "Analyze this project" / "Generate rules" | `/dw-analyze-project` |
| "Open a new project" / "Bootstrap a stack" | `/dw-new-project` |
| "Dockerize this" / "Add docker-compose" | `/dw-dockerize` |
| "Functional doc" / "Map screens and flows" | `/dw-functional-doc` |

**Priority:** when in doubt between two commands, `/dw-autopilot` is the safest default for any non-trivial feature request — it composes the rest.

## Hard Gates (the commands enforce these — don't bypass)

- **`.dw/constitution.md`**: principles with `severity: high` or `critical` block PRs / techspecs without an ADR justifying the deviation. Missing constitution? Commands auto-install defaults at `severity: info` (non-blocking) and continue — never blocks on absence.
- **`.dw/spec/<prd>/tasks-validation.md`**: auto-generated at the end of `/dw-plan tasks`. Any FAIL dimension blocks user approval until resolved or explicitly overridden.
- **Verification**: `/dw-generate-pr` requires a fresh `dw-verify` PASS (tests + lint + build) after the last edit.
- **Security**: TS / Python / C# / Rust projects must pass `/dw-secure-audit` (Trivy + OWASP + lockfile audit) before the PR opens.

## Escape Hatches — do NOT auto-trigger

When any of these apply, answer directly and do **not** invoke a `dw-*` command:

- One-line typo, rename, import sort, comment fix.
- Pure exploration: "how does this work?", "show me X", "explain Y".
- Aesthetic preference: "I prefer this style" — apply, don't run a pipeline.
- User explicitly says "do this directly" / "skip autopilot" / "no need for a PRD" — honor it.
- The conversation is already inside a `dw-*` flow (you're already executing tasks; don't start a new pipeline).

## Workflow Reference

```
/dw-autopilot "wish"  ────►  Runs entire pipeline automatically
                              (3 gates: PRD approval, Tasks approval, PR confirmation)

  --- OR step-by-step ---

/dw-brainstorm ─► /dw-plan ─► /dw-run ─► /dw-qa ─► /dw-review ─► /dw-commit ─► /dw-generate-pr
```

Full command list and contextual help: `/dw-help`.

## Editing this section

This block lives between `<!-- dev-workflow:start -->` and `<!-- dev-workflow:end -->` markers. Anything you write **outside** these markers in `CLAUDE.md` / `AGENTS.md` is preserved on every `dev-workflow update`. Anything **inside** is refreshed from the package — your edits inside the block will be overwritten.

To customize the trigger map permanently, copy the block content to outside the markers (or to a separate file like `.dw/agent-instructions-custom.md`) and edit there.
<!-- dev-workflow:end -->
