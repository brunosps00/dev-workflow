const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { ensureDir, writeFile } = require('./utils');
const { multiSelect } = require('./prompts');
const { addMcpServer } = require('./mcp');
const { CATEGORIES, listCategories, resolvePrefixes, matchesPrefixes } = require('./azure-categories');

const UPSTREAM_REPO = 'https://github.com/MicrosoftDocs/Agent-Skills.git';
const MCP_NAME = 'microsoft-learn';
const MCP_CONFIG = {
  type: 'http',
  url: 'https://learn.microsoft.com/api/mcp',
};

const AZURE_MCP_INSTRUCTIONS = `# Azure Documentation MCP — How the agent should use it

Installed by \`/dw-install-azure-skills\` (or \`npx @brunosps00/dev-workflow install-azure-skills\`). Lives at \`.dw/references/azure-mcp-instructions.md\` and is automatically discoverable by any \`dw-*\` command that touches Azure code paths.

## Available MCP tools (from \`microsoft-learn\` server)

| Tool | When to call it |
|------|-----------------|
| \`microsoft_docs_search\` | The user asks "how does X work in Azure", "what's the limit of Y", "best practice for Z" — anything conceptual or capability-oriented. Returns indexed hits from learn.microsoft.com. |
| \`microsoft_docs_fetch\` | A specific Learn URL is already in context (cited by the user, returned by a previous search, in an error message) and you need the full page content. Pass the URL. |
| \`microsoft_code_sample_search\` | The user wants an official code snippet — \`az cli\` invocation, .NET / Python / TypeScript SDK call, ARM/Bicep template, Terraform AzureRM example. Returns first-party samples. |

## When NOT to call

- Pure code review with no Azure surface. Use \`dw-review\` rules + project conventions.
- Questions about non-Microsoft tech (AWS, GCP, vendor SaaS). The Microsoft MCP only returns Learn content; calling it on unrelated topics wastes budget.
- Trivial syntactic questions answerable from the codebase or from current model knowledge — fetching docs is overkill.

## Source-grounding discipline

Every claim about Azure that comes from these tools MUST be cited per the \`dw-source-grounding\` skill format:

\`\`\`
[source: <Learn URL>, version: <as displayed on the doc>, retrieved: YYYY-MM-DD]
\`\`\`

If a tool call returns no result, fall back to web search and clearly label the answer as uncertain. Do not invent Azure API surface — Azure surface drifts and a wrong claim has cascading consequences in TechSpec → Tasks → implementation.

## Companion skills

The \`.agents/skills/azure/\` directory holds per-service skills installed by \`/dw-install-azure-skills\`. They contain curated guidance per service (e.g., \`azure-container-apps\`, \`azure-openai\`). When the user's task touches a service, prefer loading the matching skill BEFORE calling the MCP tools — the skill often answers without a network round-trip.

## Refresh / uninstall

- **Refresh:** re-run \`/dw-install-azure-skills\` (or \`npx @brunosps00/dev-workflow install-azure-skills\`). The command clears \`.agents/skills/azure/\` and pulls upstream fresh.
- **Uninstall:** delete \`.agents/skills/azure/\` and remove the \`microsoft-learn\` entry from \`.claude/settings.json\` \`mcpServers\`.

## Attribution

Skills are sourced from [\`MicrosoftDocs/Agent-Skills\`](https://github.com/MicrosoftDocs/Agent-Skills) (CC-BY-4.0). The MCP server is documented at [Microsoft Learn](https://learn.microsoft.com/en-us/training/support/mcp-get-started).
`;

function checkGit() {
  try {
    execSync('git --version', { stdio: 'pipe', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

function shallowClone(targetDir) {
  ensureDir(path.dirname(targetDir));
  execSync(`git clone --depth=1 ${UPSTREAM_REPO} "${targetDir}"`, {
    stdio: 'inherit',
    timeout: 180000,
  });
}

function listSkillDirs(repoRoot) {
  const skillsDir = path.join(repoRoot, 'skills');
  if (!fs.existsSync(skillsDir)) return [];
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function copySkillTree(srcDir, destDir) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copySkillTree(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

// Parse --products=csv override from process.argv. Returns array of slugs or null.
function parseProductsFlag() {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--products=')) {
      const csv = arg.slice('--products='.length);
      return csv.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return null;
}

async function run() {
  const projectRoot = process.cwd();

  console.log('\n  dev-workflow install-azure-skills');
  console.log(`  ${'='.repeat(40)}\n`);

  if (!checkGit()) {
    console.error('  \x1b[31m✗ git not found.\x1b[0m');
    console.error('  This command needs git to clone the upstream skills repo.');
    console.error('  Install git and re-run.');
    process.exit(1);
  }

  // 1. Decide what to install
  let prefixes;
  const explicitProducts = parseProductsFlag();
  if (explicitProducts) {
    console.log(`  Explicit --products override: ${explicitProducts.join(', ')}\n`);
    prefixes = explicitProducts;
  } else {
    const categories = listCategories();
    const lines = [];
    for (const cat of categories) {
      const desc = CATEGORIES[cat].description;
      lines.push(`${cat} — ${desc}`);
    }
    const selected = await multiSelect('Select Azure skill categories to install:', lines);
    // map back from "Category — description" → category name
    const selectedNames = selected.map((s) => s.split(' — ')[0]);
    console.log(`\n  Selected: ${selectedNames.join(', ')}\n`);
    prefixes = resolvePrefixes(selectedNames);
  }

  // 2. Shallow clone upstream
  const tmpDir = path.join(os.tmpdir(), `.dw-azure-skills-${Date.now()}`);
  try {
    console.log(`  Cloning ${UPSTREAM_REPO} (shallow)...`);
    shallowClone(tmpDir);
    console.log(`  \x1b[32m✓\x1b[0m cloned to ${tmpDir}\n`);

    // 3. Filter + copy
    const allSkills = listSkillDirs(tmpDir);
    const matched = allSkills.filter((name) => matchesPrefixes(name, prefixes));

    if (matched.length === 0) {
      console.log('  \x1b[33m! No skills matched the selected categories.\x1b[0m');
      console.log('  Nothing copied. The MCP server will still be registered.\n');
    } else {
      const destRoot = path.join(projectRoot, '.agents', 'skills', 'azure');
      console.log(`  Refreshing ${destRoot} (existing content removed)...`);
      rmRecursive(destRoot);
      ensureDir(destRoot);

      let copied = 0;
      let skipped = 0;
      for (const skillName of matched) {
        const srcDir = path.join(tmpDir, 'skills', skillName);
        const destDir = path.join(destRoot, skillName);
        // Skip skills that ship executable scripts outside markdown — limit scope per plan.
        const hasShell = fs.existsSync(path.join(srcDir, 'scripts')) || hasExecutable(srcDir);
        if (hasShell) {
          skipped++;
          continue;
        }
        copySkillTree(srcDir, destDir);
        copied++;
      }
      console.log(`  \x1b[32m✓\x1b[0m copied ${copied} skill(s) to .agents/skills/azure/`);
      if (skipped > 0) {
        console.log(`  \x1b[33m! skipped ${skipped} skill(s) that ship executable scripts\x1b[0m`);
      }
      console.log();
    }

    // 4. Register MCP
    const mcpStatus = addMcpServer(projectRoot, MCP_NAME, MCP_CONFIG);
    if (mcpStatus === 'added') {
      console.log(`  \x1b[32m✓\x1b[0m registered ${MCP_NAME} MCP in .claude/settings.json`);
    } else {
      console.log(`  \x1b[33m—\x1b[0m ${MCP_NAME} MCP already present, left unchanged`);
    }

    // 5. Write instructions
    const instructionsPath = path.join(projectRoot, '.dw', 'references', 'azure-mcp-instructions.md');
    const status = writeFile(instructionsPath, AZURE_MCP_INSTRUCTIONS, true);
    console.log(`  \x1b[32m✓\x1b[0m ${status} ${instructionsPath}`);
  } finally {
    // 6. Cleanup
    rmRecursive(tmpDir);
  }

  console.log(`\n  ${'='.repeat(40)}`);
  console.log('  Done.');
  console.log();
  console.log('  Next steps:');
  console.log('    1. Restart Claude Code (or Codex / Copilot / OpenCode) so the MCP loads.');
  console.log('    2. Ask something Azure-specific to validate, e.g.');
  console.log('       "How do I deploy a containerized app to Azure Container Apps?"');
  console.log('    3. To refresh from upstream, re-run this command.');
  console.log('    4. To uninstall: rm -rf .agents/skills/azure/ and remove the');
  console.log('       "microsoft-learn" entry from .claude/settings.json mcpServers.');
  console.log();
}

// Heuristic: any .sh / .py / .js / .ts file at the skill root counts as executable.
// SKILL.md + references/ + assets/ stays text-only and is safe to copy.
function hasExecutable(skillDir) {
  if (!fs.existsSync(skillDir)) return false;
  const entries = fs.readdirSync(skillDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (/\.(sh|py|js|ts|mjs|cjs|ps1|bat)$/i.test(entry.name)) return true;
  }
  return false;
}

module.exports = { run };
