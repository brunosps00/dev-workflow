/**
 * Manifest of dw-* commands removed in past releases.
 *
 * APPEND-ONLY: never modify or remove entries. A removed command stays
 * in this manifest forever so old installs still get cleaned up when
 * the user runs `dev-workflow update`.
 *
 * Each entry surfaces a friendly "old → new" message during migrate-skills
 * orphan-wrapper sweep. The mapping is informational — the actual cleanup
 * is the generic orphan-wrapper scan that already matches dw-* names
 * against the current `lib/constants.js`.
 */
module.exports = [
  // v1.0.0 — pipeline consolidation
  { name: 'dw-create-prd', removedIn: '1.0.0', replacedBy: 'dw-plan prd' },
  { name: 'dw-create-techspec', removedIn: '1.0.0', replacedBy: 'dw-plan techspec' },
  { name: 'dw-create-tasks', removedIn: '1.0.0', replacedBy: 'dw-plan tasks' },
  { name: 'dw-run-task', removedIn: '1.0.0', replacedBy: 'dw-run <task-id>' },
  { name: 'dw-run-plan', removedIn: '1.0.0', replacedBy: 'dw-run' },
  { name: 'dw-code-review', removedIn: '1.0.0', replacedBy: 'dw-review --code-only' },
  { name: 'dw-review-implementation', removedIn: '1.0.0', replacedBy: 'dw-review --coverage-only' },
  { name: 'dw-run-qa', removedIn: '1.0.0', replacedBy: 'dw-qa' },
  { name: 'dw-fix-qa', removedIn: '1.0.0', replacedBy: 'dw-qa --fix' },
  { name: 'dw-security-check', removedIn: '1.0.0', replacedBy: 'dw-secure-audit' },
  { name: 'dw-deps-audit', removedIn: '1.0.0', replacedBy: 'dw-secure-audit --plan' },
  { name: 'dw-map-codebase', removedIn: '1.0.0', replacedBy: 'dw-intel --build' },
  { name: 'dw-deep-research', removedIn: '1.0.0', replacedBy: 'dw-brainstorm --research' },
  { name: 'dw-refactoring-analysis', removedIn: '1.0.0', replacedBy: 'dw-brainstorm --refactor' },
  { name: 'dw-revert-task', removedIn: '1.0.0', replacedBy: 'git revert <sha>' },
];
