const path = require('path');
const { COMMANDS } = require('./constants');
const { ensureDir, copyDir, writeFile, upsertDelimitedBlock, log } = require('./utils');
const { selectLanguage } = require('./prompts');
const { generateWrappers } = require('./wrappers');
const { installMCPs } = require('./mcp');
const { migrate: migrateGsd } = require('./migrate-gsd');

const SCAFFOLD_DIR = path.join(__dirname, '..', 'scaffold');

async function run({ force = false, lang = null, mode = 'init' }) {
  const projectRoot = process.cwd();
  const isUpdate = mode === 'update';

  // In update mode, always overwrite managed files (commands, templates, references, scripts, skills)
  // but never touch user files (rules, spec, MCPs)
  const managedForce = isUpdate ? true : force;

  console.log(`\n  dev-workflow ${isUpdate ? 'update' : 'init'}`);
  console.log(`  ${'='.repeat(40)}\n`);

  // 0. GSD migration (idempotent; only runs if legacy GSD artifacts are detected)
  if (isUpdate) {
    migrateGsd(projectRoot);
  }

  // 1. Select language
  const selectedLang = await selectLanguage(lang);
  console.log(`\n  Language: ${selectedLang}\n`);

  const commands = COMMANDS[selectedLang];
  const langDir = path.join(SCAFFOLD_DIR, selectedLang);

  // Track totals
  let totalCreated = 0;
  let totalSkipped = 0;
  let totalOverwritten = 0;

  // 2. Copy commands
  console.log('  Commands:');
  const cmdResults = copyDir(
    path.join(langDir, 'commands'),
    path.join(projectRoot, '.dw', 'commands'),
    managedForce
  );
  totalCreated += cmdResults.created;
  totalSkipped += cmdResults.skipped;
  totalOverwritten += cmdResults.overwritten;
  console.log(`    ${cmdResults.created} created, ${cmdResults.skipped} skipped, ${cmdResults.overwritten} overwritten\n`);

  // 3. Copy templates (override-aware: .dw/templates/overrides/<name> wins over scaffold core)
  console.log('  Templates:');
  const templatesDir = path.join(projectRoot, '.dw', 'templates');
  const overridesDir = path.join(templatesDir, 'overrides');
  const tplResults = copyDir(
    path.join(langDir, 'templates'),
    templatesDir,
    managedForce,
    overridesDir
  );
  totalCreated += tplResults.created;
  totalSkipped += tplResults.skipped;
  totalOverwritten += tplResults.overwritten;
  console.log(`    ${tplResults.created} created, ${tplResults.skipped} skipped, ${tplResults.overwritten} overwritten\n`);

  // 3.1. Seed .dw/templates/overrides/ with README on first init (never overwritten)
  ensureDir(overridesDir);
  const overridesReadmeSrc = path.join(SCAFFOLD_DIR, 'templates-overrides-readme.md');
  const overridesReadmeDest = path.join(overridesDir, 'README.md');
  if (require('fs').existsSync(overridesReadmeSrc)) {
    const ovrStatus = writeFile(
      overridesReadmeDest,
      require('fs').readFileSync(overridesReadmeSrc, 'utf-8'),
      false
    );
    if (ovrStatus === 'created') totalCreated++;
    else totalSkipped++;
  }

  // 3.5. Copy references (language-specific)
  const refsSrcDir = path.join(langDir, 'references');
  if (require('fs').existsSync(refsSrcDir)) {
    console.log('  References:');
    const refsResults = copyDir(
      refsSrcDir,
      path.join(projectRoot, '.dw', 'references'),
      managedForce
    );
    totalCreated += refsResults.created;
    totalSkipped += refsResults.skipped;
    totalOverwritten += refsResults.overwritten;
    console.log(`    ${refsResults.created} created, ${refsResults.skipped} skipped, ${refsResults.overwritten} overwritten\n`);
  }

  // 3.6. Copy scripts (language-independent)
  const scriptsSrcDir = path.join(SCAFFOLD_DIR, 'scripts');
  if (require('fs').existsSync(scriptsSrcDir)) {
    console.log('  Scripts:');
    const scriptsResults = copyDir(
      scriptsSrcDir,
      path.join(projectRoot, '.dw', 'scripts'),
      managedForce
    );
    totalCreated += scriptsResults.created;
    totalSkipped += scriptsResults.skipped;
    totalOverwritten += scriptsResults.overwritten;
    console.log(`    ${scriptsResults.created} created, ${scriptsResults.skipped} skipped, ${scriptsResults.overwritten} overwritten\n`);
  }

  // 4. Create .dw/rules/ with README
  if (!isUpdate) {
    console.log('  Rules:');
    ensureDir(path.join(projectRoot, '.dw', 'rules'));
    const rulesReadmeSrc = path.join(SCAFFOLD_DIR, 'rules-readme.md');
    const rulesReadmeDest = path.join(projectRoot, '.dw', 'rules', 'README.md');
    const status = writeFile(
      rulesReadmeDest,
      require('fs').readFileSync(rulesReadmeSrc, 'utf-8'),
      false
    );
    log(status, rulesReadmeDest);
    if (status === 'created') totalCreated++;
    else totalSkipped++;
    console.log();
  }

  // 5. Create .dw/spec/
  if (!isUpdate) {
    ensureDir(path.join(projectRoot, '.dw', 'spec'));
  }

  // 5.5. Copy bundled skills to .agents/skills/
  const skillsSrcDir = path.join(SCAFFOLD_DIR, 'skills');
  if (require('fs').existsSync(skillsSrcDir)) {
    console.log('  Bundled skills:');
    const skillsResults = copyDir(
      skillsSrcDir,
      path.join(projectRoot, '.agents', 'skills'),
      managedForce
    );
    totalCreated += skillsResults.created;
    totalSkipped += skillsResults.skipped;
    totalOverwritten += skillsResults.overwritten;
    console.log(`    ${skillsResults.created} created, ${skillsResults.skipped} skipped, ${skillsResults.overwritten} overwritten\n`);
  }

  // 5.7. Install CLAUDE.md + AGENTS.md with auto-trigger decision tree
  // Both files receive the same content (Claude Code reads CLAUDE.md; Codex/Copilot/OpenCode
  // converge on AGENTS.md). Merge-aware: user edits outside the dev-workflow markers are preserved.
  const agentInstructionsSrc = path.join(langDir, 'agent-instructions.md');
  if (require('fs').existsSync(agentInstructionsSrc)) {
    console.log('  Agent instructions:');
    const blockContent = require('fs').readFileSync(agentInstructionsSrc, 'utf-8');
    const startMarker = '<!-- dev-workflow:start -->';
    const endMarker = '<!-- dev-workflow:end -->';
    for (const fileName of ['CLAUDE.md', 'AGENTS.md']) {
      const target = path.join(projectRoot, fileName);
      const status = upsertDelimitedBlock(target, blockContent, startMarker, endMarker);
      log(status === 'unchanged' ? 'skipped' : (status === 'created' ? 'created' : 'overwritten'), target);
      if (status === 'created') totalCreated++;
      else if (status === 'updated') totalOverwritten++;
      else totalSkipped++;
    }
    console.log();
  }

  // 6. Create .opencode/package.json
  const opencodePackageJson = path.join(projectRoot, '.opencode', 'package.json');
  const opencodeContent = JSON.stringify({ dependencies: { '@opencode-ai/plugin': '1.2.17' } }, null, 2) + '\n';
  const opcStatus = writeFile(opencodePackageJson, opencodeContent, false);
  if (opcStatus === 'created') totalCreated++;
  else totalSkipped++;

  // 6.5. Clean up legacy .codex/skills/ (now served by .agents/skills/)
  const legacyCodexDir = path.join(projectRoot, '.codex', 'skills');
  if (require('fs').existsSync(legacyCodexDir)) {
    console.log('  Legacy cleanup:');
    require('fs').rmSync(legacyCodexDir, { recursive: true });
    console.log('    Removed .codex/skills/ (now served by .agents/skills/)\n');
  }

  // 7. Generate platform wrappers
  console.log('  Platform wrappers:');
  const wrapperResults = generateWrappers(projectRoot, commands, managedForce);
  totalCreated += wrapperResults.created;
  totalSkipped += wrapperResults.skipped;
  totalOverwritten += wrapperResults.overwritten;
  console.log();

  // 9. Install MCPs (always, including updates)
  console.log('  MCP Servers:');
  const mcpResults = installMCPs(projectRoot);
  console.log(`    ${mcpResults.added} configured, ${mcpResults.skipped} already present\n`);

  // 10. Summary
  console.log(`  ${'='.repeat(40)}`);
  console.log(`  Done! ${totalCreated} created, ${totalSkipped} skipped, ${totalOverwritten} overwritten`);
  console.log();
  console.log('  Next steps:');
  console.log('    1. Run /dw-analyze-project to generate project rules');
  console.log('    2. Run /dw-brainstorm to start a new feature');
  console.log('    3. Run /dw-help to see all available commands');
  console.log();
}

module.exports = { run };
