const fs = require('fs');
const path = require('path');
const { COMMANDS } = require('./constants');
const removedSkills = require('./removed-bundled-skills');
const removedCommands = require('./removed-commands');

/**
 * Cleanup-on-update for dev-workflow.
 *
 * Two complementary scans:
 *
 * 1. Removed bundled skills (data-driven from `removed-bundled-skills.js`):
 *    Detects `.agents/skills/<name>/` directories that match the manifest of
 *    skills removed in past releases. Removes them and notes the replacement.
 *
 * 2. Orphan command wrappers (state-comparison vs `constants.js`):
 *    Lists `.claude/skills/dw-*`, `.agents/skills/dw-*`, and
 *    `.opencode/commands/dw-*.md` wrappers on disk. Any `dw-*` wrapper whose
 *    base name is NOT present in the current `COMMANDS[lang]` is removed.
 *
 * Only touches names with prefix `dw-` (or names explicitly listed in the
 * manifest). Never touches third-party skills/commands.
 *
 * Idempotent: silent when nothing to clean.
 *
 * Run automatically from lib/init.js when mode === 'update'.
 */
function migrate(projectRoot) {
  const removed = scanRemovedBundledSkills(projectRoot);
  const orphans = scanOrphanCommandWrappers(projectRoot);

  if (removed.length === 0 && orphans.length === 0) {
    return null; // silent — nothing to clean
  }

  console.log('\n  Skill migration:');

  for (const entry of removed) {
    console.log(
      `    \x1b[33m-\x1b[0m [v${entry.removedIn}] Removing legacy skill ${entry.name} (replaced by ${entry.replacedBy})`
    );
    rmRecursive(entry.path);
  }

  // Pre-build a map { commandName -> { removedIn, replacedBy } } for friendly messaging.
  const removedCommandMap = new Map(removedCommands.map((r) => [r.name, r]));

  for (const entry of orphans) {
    const rel = path.relative(projectRoot, entry.path);
    const baseName = entry.commandName;
    const known = baseName ? removedCommandMap.get(baseName) : null;
    const suffix = known
      ? `(replaced in v${known.removedIn} by \`${known.replacedBy}\`)`
      : `(command no longer exists)`;
    console.log(`    \x1b[33m-\x1b[0m [orphan] Removing wrapper ${rel} ${suffix}`);
    rmRecursive(entry.path);
  }

  console.log();
  return { removed: removed.length, orphans: orphans.length };
}

function scanRemovedBundledSkills(projectRoot) {
  const matches = [];
  const agentsSkillsDir = path.join(projectRoot, '.agents', 'skills');

  if (!fs.existsSync(agentsSkillsDir)) return matches;

  for (const entry of removedSkills) {
    const target = path.join(agentsSkillsDir, entry.name);
    if (fs.existsSync(target)) {
      matches.push({ ...entry, path: target });
    }
  }
  return matches;
}

function scanOrphanCommandWrappers(projectRoot) {
  const orphans = [];

  // Build the canonical "known names" set:
  //  - Commands from constants.js (en + pt-br union) — these become wrappers.
  //  - Bundled skills from scaffold/skills/ — these are copied verbatim into
  //    .agents/skills/ and .claude/skills/ alongside wrappers. They're NOT
  //    orphans even though they share the .agents/skills/ directory with
  //    command wrappers.
  const canonical = new Set();
  for (const lang of Object.keys(COMMANDS)) {
    for (const cmd of COMMANDS[lang]) {
      canonical.add(cmd.name);
    }
  }
  const scaffoldSkillsDir = path.join(__dirname, '..', 'scaffold', 'skills');
  if (fs.existsSync(scaffoldSkillsDir)) {
    for (const entry of fs.readdirSync(scaffoldSkillsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) canonical.add(entry.name);
    }
  }

  // Scan locations
  const locations = [
    { dir: path.join(projectRoot, '.claude', 'skills'), type: 'directory' },
    { dir: path.join(projectRoot, '.agents', 'skills'), type: 'directory' },
    { dir: path.join(projectRoot, '.opencode', 'commands'), type: 'file', suffix: '.md' },
  ];

  for (const loc of locations) {
    if (!fs.existsSync(loc.dir)) continue;
    const entries = fs.readdirSync(loc.dir, { withFileTypes: true });

    for (const entry of entries) {
      const name = loc.suffix ? entry.name.replace(loc.suffix, '') : entry.name;

      // Only scan dw-* prefix
      if (!name.startsWith('dw-')) continue;

      // Skip if it matches a canonical command OR a bundled skill
      if (canonical.has(name)) continue;

      // Match the expected entry type (directory or file)
      const isExpected = loc.type === 'directory' ? entry.isDirectory() : entry.isFile();
      if (!isExpected) continue;

      orphans.push({ path: path.join(loc.dir, entry.name), commandName: name });
    }
  }

  return orphans;
}

function rmRecursive(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

module.exports = { migrate };
