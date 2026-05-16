const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const { ensureDir, writeFile } = require('./utils');
const { multiSelect } = require('./prompts');
const { addMcpServer } = require('./mcp');
const { CATEGORIES, listCategories, resolveDirs } = require('./aws-categories');

const UPSTREAM_REPO = 'https://github.com/aws/agent-toolkit-for-aws.git';
const MCP_NAME = 'aws-mcp';
const DEFAULT_REGION = 'us-east-1';

// AWS MCP Server endpoints — see https://docs.aws.amazon.com/aws-mcp/.
// Knowledge MCP (https://knowledge-mcp.global.api.aws) is deprecated by AWS in
// favor of the unified server. We intentionally only register the unified one.
const REGIONAL_ENDPOINTS = {
  'us-east-1': 'https://aws-mcp.us-east-1.api.aws/mcp',
  'eu-central-1': 'https://aws-mcp.eu-central-1.api.aws/mcp',
};

function buildMcpConfig(region) {
  const endpoint = REGIONAL_ENDPOINTS[region] || REGIONAL_ENDPOINTS[DEFAULT_REGION];
  return {
    command: 'uvx',
    args: [
      'mcp-proxy-for-aws@latest',
      endpoint,
      '--metadata',
      `AWS_REGION=${region}`,
    ],
    transport: 'stdio',
    timeout: 100000,
  };
}

const AWS_MCP_INSTRUCTIONS = `# AWS MCP Server — How the agent should use it

Installed by \`/dw-install-aws-skills\` (or \`npx @brunosps00/dev-workflow install-aws-skills\`). Lives at \`.dw/references/aws-mcp-instructions.md\` and is automatically discoverable by any \`dw-*\` command that touches AWS code paths.

## Available MCP tools (from \`aws-mcp\` server)

| Tool | When to call it | Destructive? |
|------|-----------------|---------------|
| \`aws___search_documentation\` | The user asks "how does X work in AWS", "what's the limit of Y", "best practice for Z" — anything conceptual or capability-oriented. Returns indexed hits from docs.aws.amazon.com. | No (read-only) |
| \`aws___read_documentation\` | A specific docs.aws.amazon.com URL is already in context (cited by the user, returned by a previous search, in an error message) and you need the full page content. | No (read-only) |
| \`aws___retrieve_skill\` | The user is starting a specific AWS task and you want a curated skill (CDK setup, Bedrock invocation pattern, etc.). Pulls from the bundled skill catalog. | No (read-only) |
| \`aws___call_aws\` | The user explicitly asked for an AWS API operation — list, describe, create, modify, delete. Executes against the user's IAM credentials. | **YES — can mutate cloud state** |
| \`aws___run_script\` | Heavier analysis or orchestration that needs Python: parsing JSON returned by \`call_aws\`, aggregating across services, running an ad-hoc query. | **YES — can call APIs from the script** |

## Destructive operations — required behavior

<critical>
Before invoking \`aws___call_aws\` for any of the following, STATE the operation in chat, the target resource (account ID, region, resource ID/name), and the expected effect. WAIT for explicit user confirmation:

- Any \`create*\`, \`put*\`, \`update*\`, \`modify*\`, \`delete*\`, \`terminate*\`, \`stop*\` API
- Any IAM change (role, policy, user, group, identity provider, permission boundary)
- Any operation that affects billing (provisioning, scaling, premium support, marketplace subscriptions)
- Any operation in production accounts (detect via account ID or tags if available)

For read-only operations (\`list*\`, \`describe*\`, \`get*\`), proceed without confirmation — but cite the call in the report.

The user's IAM principal determines what the call CAN do. dev-workflow does NOT validate scope. If a destructive call fails with AccessDenied, that is by design — surface the error and stop.
</critical>

## Region behavior

The MCP server endpoint is regional (currently \`us-east-1\` and \`eu-central-1\`). The AWS operations the server performs default to the region encoded in the proxy \`--metadata AWS_REGION=<x>\` argument inside \`.claude/settings.json\`. Override per-query by saying "list EC2 instances in eu-west-1" — the server honors regions in the prompt.

To change the default permanently, edit the args array in \`.claude/settings.json\` (\`AWS_REGION=<x>\`) and pick the corresponding endpoint URL, or re-run \`/dw-install-aws-skills --region=<x>\`.

## When NOT to call

- Pure code review with no AWS surface. Use \`dw-review\` rules + project conventions.
- Questions about non-AWS clouds (Azure, GCP, vendor SaaS). The AWS MCP only returns AWS content; calling it on unrelated topics wastes budget.
- Trivial syntactic questions answerable from the codebase or current model knowledge — fetching docs is overkill.

## Source-grounding discipline

Every claim about AWS that comes from these tools MUST be cited per the \`dw-source-grounding\` skill format:

\`\`\`
[source: <docs.aws.amazon.com URL>, version: <as displayed>, retrieved: YYYY-MM-DD]
\`\`\`

For \`aws___call_aws\` results, cite the API name + region + a one-line summary of what was returned (do not paste full JSON blobs into the response unless the user asks).

## Companion skills

The \`.agents/skills/aws/\` directory holds skills installed by \`/dw-install-aws-skills\`. Skills under \`aws-cdk\`, \`aws-cloudformation\`, \`aws-iam\`, etc. encode best practices that often answer the question without a network round-trip. Prefer loading the matching skill BEFORE calling the MCP tools.

## Prerequisites the user maintains

- \`uv\` (Python tool runner) — used by \`uvx\` to invoke \`mcp-proxy-for-aws\`.
- \`aws cli\` ≥ 2.32.0 — proxy uses it for credential discovery.
- Valid AWS credentials — typically via \`aws login\`, IAM access keys, or SSO profile. Verify with \`aws sts get-caller-identity\`.

If credentials expire (most commonly with short-lived session tokens), the agent's tool calls will fail with \`ExpiredTokenException\`. Tell the user to refresh and re-try; do not silently swallow the error.

## Refresh / uninstall

- **Refresh:** re-run \`/dw-install-aws-skills\` (or \`npx @brunosps00/dev-workflow install-aws-skills\`). The command clears \`.agents/skills/aws/\` and pulls upstream fresh.
- **Uninstall:** delete \`.agents/skills/aws/\` and remove the \`aws-mcp\` entry from \`.claude/settings.json\` \`mcpServers\`.

## Attribution

Skills are sourced from [\`aws/agent-toolkit-for-aws\`](https://github.com/aws/agent-toolkit-for-aws) (Apache 2.0). The MCP server is documented at [docs.aws.amazon.com/aws-mcp/](https://docs.aws.amazon.com/aws-mcp/). The proxy is [\`aws/mcp-proxy-for-aws\`](https://github.com/aws/mcp-proxy-for-aws).
`;

function check(cmd) {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

function printPrereqInstructions(missing) {
  console.log('\n  Missing prerequisites — install these before re-running:\n');
  if (missing.has('git')) {
    console.log('  git:');
    console.log('    macOS:    brew install git   (or use Xcode Command Line Tools)');
    console.log('    Linux:    apt install git    (or distro equivalent)');
    console.log('    Windows:  https://git-scm.com/download/win\n');
  }
  if (missing.has('uv')) {
    console.log('  uv (Python tool runner — runs uvx):');
    console.log('    macOS/Linux: curl -LsSf https://astral.sh/uv/install.sh | sh');
    console.log('    Windows:     powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"\n');
  }
  if (missing.has('aws')) {
    console.log('  aws cli (version 2.32.0 or later):');
    console.log('    https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    console.log('    macOS:    brew install awscli');
    console.log('    Windows:  winget install Amazon.AWSCLI');
    console.log('    Linux:    See AWS docs for arch-specific .zip\n');
  }
  if (missing.has('creds')) {
    console.log('  AWS credentials:');
    console.log('    Easiest:   aws login           (rotates every 15 min, valid 12h)');
    console.log('    SSO:       aws configure sso');
    console.log('    Keys:      aws configure        (IAM access keys)');
    console.log('    Verify:    aws sts get-caller-identity\n');
  }
}

function shallowClone(targetDir) {
  ensureDir(path.dirname(targetDir));
  execSync(`git clone --depth=1 ${UPSTREAM_REPO} "${targetDir}"`, {
    stdio: 'inherit',
    timeout: 180000,
  });
}

function expandGlob(repoRoot, pattern) {
  // Supports two forms: "core-skills/*" and "specialized-skills/<x>/*".
  // Globbing kept minimal — no node-glob dependency.
  const skillsRoot = path.join(repoRoot, 'skills');
  const parts = pattern.split('/');
  if (parts[parts.length - 1] !== '*') {
    // exact path
    const fullPath = path.join(skillsRoot, pattern);
    return fs.existsSync(fullPath) ? [fullPath] : [];
  }
  const parentRel = parts.slice(0, -1).join('/');
  const parent = path.join(skillsRoot, parentRel);
  if (!fs.existsSync(parent)) return [];
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => path.join(parent, e.name));
}

function collectAllSkillDirs(repoRoot) {
  const out = [];
  for (const pattern of ['core-skills/*', 'specialized-skills/*/*']) {
    out.push(...expandGlob(repoRoot, pattern));
  }
  return out;
}

function copyTree(srcDir, destDir) {
  ensureDir(destDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyTree(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function rmRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function hasExecutable(skillDir) {
  if (!fs.existsSync(skillDir)) return false;
  for (const entry of fs.readdirSync(skillDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (/\.(sh|py|js|ts|mjs|cjs|ps1|bat)$/i.test(entry.name)) return true;
  }
  return false;
}

function parseFlag(name) {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(`--${name}=`)) {
      return arg.slice(name.length + 3);
    }
  }
  return null;
}

async function run() {
  const projectRoot = process.cwd();

  console.log('\n  dev-workflow install-aws-skills');
  console.log(`  ${'='.repeat(40)}\n`);

  // 1. Detect prerequisites
  const missing = new Set();
  if (!check('git --version')) missing.add('git');
  if (!check('uv --version')) missing.add('uv');
  if (!check('aws --version')) missing.add('aws');

  if (!missing.has('aws')) {
    // Only check creds if the CLI itself is present.
    if (!check('aws sts get-caller-identity')) missing.add('creds');
  }

  if (missing.size > 0) {
    console.log('  \x1b[31m✗ prerequisites not met\x1b[0m');
    printPrereqInstructions(missing);
    process.exit(1);
  }

  console.log('  \x1b[32m✓\x1b[0m git, uv, aws cli, and AWS credentials all detected\n');

  // 2. Region
  const regionFlag = parseFlag('region');
  const region = regionFlag || DEFAULT_REGION;
  if (!REGIONAL_ENDPOINTS[region]) {
    console.log(
      `  \x1b[33m! region "${region}" has no known endpoint; falling back to ${DEFAULT_REGION}.\x1b[0m`,
    );
    console.log('  Supported regions:', Object.keys(REGIONAL_ENDPOINTS).join(', '));
  }
  const effectiveRegion = REGIONAL_ENDPOINTS[region] ? region : DEFAULT_REGION;
  console.log(`  Region: ${effectiveRegion} (endpoint ${REGIONAL_ENDPOINTS[effectiveRegion]})\n`);

  // 3. Select categories
  const categories = listCategories();
  const lines = categories.map((c) => `${c} — ${CATEGORIES[c].description}`);
  const selected = await multiSelect('Select AWS skill categories to install:', lines);
  const selectedNames = selected.map((s) => s.split(' — ')[0]);
  console.log(`\n  Selected: ${selectedNames.join(', ')}\n`);

  // 4. Clone upstream
  const tmpDir = path.join(os.tmpdir(), `.dw-aws-skills-${Date.now()}`);
  try {
    console.log(`  Cloning ${UPSTREAM_REPO} (shallow)...`);
    shallowClone(tmpDir);
    console.log(`  \x1b[32m✓\x1b[0m cloned to ${tmpDir}\n`);

    // 5. Resolve which dirs to copy
    const resolved = resolveDirs(selectedNames);
    let skillDirs;
    if (resolved === '__ALL__') {
      skillDirs = collectAllSkillDirs(tmpDir);
    } else {
      skillDirs = [];
      for (const pattern of resolved) {
        skillDirs.push(...expandGlob(tmpDir, pattern));
      }
    }

    if (skillDirs.length === 0) {
      console.log('  \x1b[33m! No skills matched the selected categories.\x1b[0m');
      console.log('  Nothing copied. The MCP server will still be registered.\n');
    } else {
      const destRoot = path.join(projectRoot, '.agents', 'skills', 'aws');
      console.log(`  Refreshing ${destRoot} (existing content removed)...`);
      rmRecursive(destRoot);
      ensureDir(destRoot);

      let copied = 0;
      let skipped = 0;
      for (const srcDir of skillDirs) {
        const skillName = path.basename(srcDir);
        if (hasExecutable(srcDir)) {
          skipped++;
          continue;
        }
        // Flatten — destination has no core-skills/ vs specialized-skills/ split.
        const destDir = path.join(destRoot, skillName);
        copyTree(srcDir, destDir);
        copied++;
      }
      console.log(`  \x1b[32m✓\x1b[0m copied ${copied} skill(s) to .agents/skills/aws/`);
      if (skipped > 0) {
        console.log(`  \x1b[33m! skipped ${skipped} skill(s) that ship executable scripts\x1b[0m`);
      }
      console.log();
    }

    // 6. Register MCP
    const mcpConfig = buildMcpConfig(effectiveRegion);
    const mcpStatus = addMcpServer(projectRoot, MCP_NAME, mcpConfig);
    if (mcpStatus === 'added') {
      console.log(`  \x1b[32m✓\x1b[0m registered ${MCP_NAME} MCP in .claude/settings.json (region ${effectiveRegion})`);
    } else {
      console.log(`  \x1b[33m—\x1b[0m ${MCP_NAME} MCP already present, left unchanged`);
      console.log('     To change region, edit .claude/settings.json directly or remove the entry and re-run.');
    }

    // 7. Write instructions
    const instructionsPath = path.join(projectRoot, '.dw', 'references', 'aws-mcp-instructions.md');
    const status = writeFile(instructionsPath, AWS_MCP_INSTRUCTIONS, true);
    console.log(`  \x1b[32m✓\x1b[0m ${status} ${instructionsPath}`);
  } finally {
    rmRecursive(tmpDir);
  }

  console.log(`\n  ${'='.repeat(40)}`);
  console.log('  Done.');
  console.log();
  console.log('  Next steps:');
  console.log('    1. Restart Claude Code (or Codex / Copilot / OpenCode) so the MCP loads.');
  console.log('    2. Ask something AWS-specific to validate, e.g.');
  console.log('       "What\'s the limit on Lambda concurrent executions?"');
  console.log('    3. The agent can now call AWS APIs via aws___call_aws — review');
  console.log('       .dw/references/aws-mcp-instructions.md for destructive-op protocol.');
  console.log('    4. To refresh from upstream, re-run this command.');
  console.log(`    5. Region override: re-run with --region=<aws-region> (currently: ${effectiveRegion}).`);
  console.log('    6. To uninstall: rm -rf .agents/skills/aws/ and remove the');
  console.log('       "aws-mcp" entry from .claude/settings.json mcpServers.');
  console.log();
}

module.exports = { run };
