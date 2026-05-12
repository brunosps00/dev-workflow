<!-- dev-workflow:start -->
# dev-workflow — AI Agent Instructions

This project uses [`@brunosps00/dev-workflow`](https://www.npmjs.com/package/@brunosps00/dev-workflow) (`dw-*` commands) for structured AI-driven development. The commands compose into a PRD → TechSpec → Tasks → Implement → Review → Commit → PR pipeline with hard gates for security, constitution compliance, and verification.

**The whole point of this file:** when the user states an intent that matches the Trigger Map below, run the matching `dw-*` command **without asking permission first** — unless the change is genuinely trivial (see Escape Hatches).

## Trigger Map

| User intent (literal or paraphrased) | Auto-trigger |
|--------------------------------------|--------------|
| "Implement X" / "Build Y" / "Add feature Z" / "I need ..." / "Create ..." | `/dw-autopilot "X"` |
| Pasted error / "X is broken" / "Bug in Y" / failing test screenshot | `/dw-bugfix "X"` |
| "Run this task" (with task ID) | `/dw-run-task <ID>` |
| "Run all pending tasks" / "Execute the plan" | `/dw-run-plan` |
| "Review my PR" / "Check code quality" / "Is this ready to ship?" | `/dw-code-review` |
| "Time to commit" / changes are validated and ready | `/dw-commit` |
| "Open a PR" / "Ship this" | `/dw-generate-pr` |
| "Write a PRD for X" / "Spec out Y" | `/dw-create-prd` |
| "Design the architecture" / "Make the techspec" | `/dw-create-techspec` |
| "Break this into tasks" | `/dw-create-tasks` |
| "Where is X?" / "What uses Y?" / "How is Z structured?" | `/dw-intel "<question>"` |
| "Audit our dependencies" / "Are we behind on packages?" | `/dw-deps-audit` |
| "Scan for vulnerabilities" / "Security check" | `/dw-security-check` |
| "QA this feature" / "Run the test plan" | `/dw-run-qa` |
| "Fix the QA bugs" | `/dw-fix-qa` |

**Priority:** when in doubt between two commands, `/dw-autopilot` is the safest default for any non-trivial feature request — it composes the rest.

## Hard Gates (the commands enforce these — don't bypass)

- **`.dw/constitution.md`**: principles with `severity: high` or `critical` block PRs / techspecs without an ADR justifying the deviation. Missing constitution? Commands auto-install defaults at `severity: info` (non-blocking) and continue — never blocks on absence.
- **`.dw/spec/<prd>/tasks-validation.md`**: auto-generated at the end of `/dw-create-tasks`. Any FAIL dimension blocks user approval until resolved or explicitly overridden.
- **Verification**: `/dw-generate-pr` requires a fresh `dw-verify` PASS (tests + lint + build) after the last edit.
- **Security**: TS / Python / C# / Rust projects must pass `/dw-security-check` (Trivy + OWASP + lockfile audit) before the PR opens.

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

/dw-brainstorm ─► /dw-create-prd ─► /dw-create-techspec ─► /dw-create-tasks
                                                              │
                                                              ▼
/dw-commit + /dw-generate-pr ◄──── /dw-code-review ◄──── /dw-run-plan
```

Full command list and contextual help: `/dw-help`.

## Editing this section

This block lives between `<!-- dev-workflow:start -->` and `<!-- dev-workflow:end -->` markers. Anything you write **outside** these markers in `CLAUDE.md` / `AGENTS.md` is preserved on every `dev-workflow update`. Anything **inside** is refreshed from the package — your edits inside the block will be overwritten.

To customize the trigger map permanently, copy the block content to outside the markers (or to a separate file like `.dw/agent-instructions-custom.md`) and edit there.
<!-- dev-workflow:end -->
