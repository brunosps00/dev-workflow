const COMMANDS = {
  en: [
    { name: 'dw-adr', description: 'Records an architectural decision and the trade-offs accepted, before they get lost.' },
    { name: 'dw-analyze-project', description: 'Scans the repo to learn its stack and conventions, then writes the rules other commands rely on.' },
    { name: 'dw-autopilot', description: 'Trigger when user asks to implement, build, create, or add a feature non-trivially. Runs full PRD-to-PR pipeline with three gates.' },
    { name: 'dw-brainstorm', description: 'Refines an idea using the product\'s existing features as ground truth, before any PRD.' },
    { name: 'dw-bugfix', description: 'Trigger when user reports a bug, pastes an error, or describes broken behavior. Triages with three questions, then fixes or routes to PRD.' },
    { name: 'dw-code-review', description: 'Trigger when user asks to review code, check quality, or verify PR readiness. Level-3 review with APPROVED/REJECTED verdict.' },
    { name: 'dw-commit', description: 'Trigger when implementation is complete and pending changes need to be committed. Atomic commits with Conventional Commits messages.' },
    { name: 'dw-create-prd', description: 'Trigger when user has a feature idea and needs a written spec before implementation. Asks the questions a techspec would otherwise inherit.' },
    { name: 'dw-create-tasks', description: 'Trigger after PRD + techspec exist and the team is ready to break work into shippable units. Includes a 5-dimension consistency check.' },
    { name: 'dw-create-techspec', description: 'Trigger when a PRD is approved and architecture must be defined before tasks. Adds framework choices, test strategy, and constitution alignment.' },
    { name: 'dw-deep-research', description: 'Researches a topic across sources, tracks citations, and flags claims that don\'t check out.' },
    { name: 'dw-deps-audit', description: 'Finds outdated and supply-chain-compromised packages, drafts a per-package update plan, and runs scoped QA after each upgrade.' },
    { name: 'dw-dockerize', description: 'Reads a project, detects the stack and runtime deps, then proposes Dockerfile and docker-compose for dev and prod with explicit trade-offs.' },
    { name: 'dw-find-skills', description: 'Searches the npx skills ecosystem for a skill matching what you need, vets it, and installs it where you choose.' },
    { name: 'dw-fix-qa', description: 'Fixes bugs found in QA and retests them with screenshot evidence until they stay fixed.' },
    { name: 'dw-functional-doc', description: 'Maps screens and user flows into a functional doc, validated end-to-end with Playwright.' },
    { name: 'dw-generate-pr', description: 'Trigger when commits are ready and the branch needs a PR. Pushes branch and opens PR with summary + test plan + hard verify gate.' },
    { name: 'dw-help', description: 'Lists every command and the flows that connect them. Pass a keyword for a contextual shortcut.' },
    { name: 'dw-intel', description: 'Answers questions about the codebase by querying .dw/intel/ (built by /dw-map-codebase) with .dw/rules/ and grep as fallbacks.' },
    { name: 'dw-map-codebase', description: 'Builds a queryable index in .dw/intel/ (stack, files, apis, deps, arch) so other commands stop re-exploring the codebase.' },
    { name: 'dw-new-project', description: 'Interviews you about stack and infra, then scaffolds a working monorepo with docker-compose for dev, .env, scripts, CI, and seeded rules.' },
    { name: 'dw-redesign-ui', description: 'Audits a frontend page, proposes design directions you choose from, then ships the redesign.' },
    { name: 'dw-refactoring-analysis', description: 'Catalogs code smells in Fowler\'s vocabulary and ranks them by impact, P0 to P3.' },
    { name: 'dw-review-implementation', description: 'Maps every PRD requirement to the code that delivers it, then runs /dw-code-review for the Level 3 quality layer.' },
    { name: 'dw-revert-task', description: 'Reverts the commits of one task, but only after checking nothing downstream depends on it.' },
    { name: 'dw-run-plan', description: 'Trigger when user wants to execute all pending tasks. Goal-backward plan check, then wave-based parallel execution with atomic commits.' },
    { name: 'dw-run-qa', description: 'Drives the browser to test happy paths, edge cases, and accessibility, with screenshot proof.' },
    { name: 'dw-run-task', description: 'Trigger when user wants to execute one specific task by ID. Implements, validates with mandatory tests, commits when passing.' },
    { name: 'dw-security-check', description: 'OWASP review plus Trivy CVE/secret/IaC scan for TS, Python, C#, or Rust. CRITICAL or HIGH blocks the PR.' },
    { name: 'dw-update', description: 'Updates dev-workflow to the latest npm release in-place, with a snapshot you can roll back to.' },
  ],
  'pt-br': [
    { name: 'dw-adr', description: 'Registra uma decisao arquitetural e os trade-offs aceitos, antes que se percam.' },
    { name: 'dw-analyze-project', description: 'Escaneia o repo para aprender stack e convencoes, e escreve as regras que os outros commands usam.' },
    { name: 'dw-autopilot', description: 'Trigger quando usuario pede pra implementar, criar ou adicionar uma feature nao-trivial. Roda pipeline completo PRD-ao-PR com tres gates.' },
    { name: 'dw-brainstorm', description: 'Refina uma ideia usando as features existentes do produto como base, antes de qualquer PRD.' },
    { name: 'dw-bugfix', description: 'Trigger quando usuario reporta bug, cola erro ou descreve comportamento quebrado. Tria com tres perguntas, depois corrige ou roteia pra PRD.' },
    { name: 'dw-code-review', description: 'Trigger quando usuario pede pra revisar codigo, checar qualidade ou validar prontidao pra PR. Review Nivel 3 com veredicto APROVADO/REPROVADO.' },
    { name: 'dw-commit', description: 'Trigger quando implementacao esta completa e ha mudancas pendentes pra commit. Commits atomicos com mensagens Conventional Commits.' },
    { name: 'dw-create-prd', description: 'Trigger quando usuario tem ideia de feature e precisa de spec escrito antes de implementar. Faz as perguntas que o techspec herdaria.' },
    { name: 'dw-create-tasks', description: 'Trigger depois que PRD + techspec existem e o time vai quebrar em unidades entregaveis. Inclui consistency check em 5 dimensoes.' },
    { name: 'dw-create-techspec', description: 'Trigger quando PRD esta aprovado e arquitetura precisa ser definida antes das tasks. Adiciona escolhas de framework, testes e alinhamento de constitution.' },
    { name: 'dw-deep-research', description: 'Pesquisa um topico em varias fontes, rastreia citacoes e marca o que nao confere.' },
    { name: 'dw-deps-audit', description: 'Encontra pacotes desatualizados e comprometidos por supply-chain, monta plano de update por pacote e roda QA do que foi afetado.' },
    { name: 'dw-dockerize', description: 'Le um projeto, detecta stack e deps de runtime, e propoe Dockerfile e docker-compose para dev e prod com trade-offs explicitos.' },
    { name: 'dw-find-skills', description: 'Busca no ecossistema npx skills uma skill que resolva o que voce precisa, valida e instala onde voce escolher.' },
    { name: 'dw-fix-qa', description: 'Corrige bugs do QA e retesta com evidencia em screenshot ate ficarem estaveis.' },
    { name: 'dw-functional-doc', description: 'Mapeia telas e fluxos em um dossie funcional, validado E2E com Playwright.' },
    { name: 'dw-generate-pr', description: 'Trigger quando commits estao prontos e branch precisa de PR. Push da branch e abre PR com summary + test plan + hard verify gate.' },
    { name: 'dw-help', description: 'Lista todos os commands e os fluxos que os conectam. Passe uma keyword para atalho contextual.' },
    { name: 'dw-intel', description: 'Responde perguntas sobre o codebase consultando .dw/intel/ (do /dw-map-codebase) com .dw/rules/ e grep como fallback.' },
    { name: 'dw-map-codebase', description: 'Constroi um indice queryable em .dw/intel/ (stack, files, apis, deps, arch) para outros comandos pararem de re-explorar o codebase.' },
    { name: 'dw-new-project', description: 'Entrevista voce sobre stack e infra, depois faz scaffold de um monorepo com docker-compose para dev, .env, scripts, CI e rules seed.' },
    { name: 'dw-redesign-ui', description: 'Audita uma pagina frontend, propoe direcoes de design que voce escolhe, e entrega o redesign.' },
    { name: 'dw-refactoring-analysis', description: 'Cataloga code smells no vocabulario de Fowler e ranqueia por impacto, P0 a P3.' },
    { name: 'dw-review-implementation', description: 'Mapeia cada requisito do PRD ao codigo que o entrega, e roda /dw-code-review para a camada de qualidade Nivel 3.' },
    { name: 'dw-revert-task', description: 'Reverte os commits de uma task, mas so depois de checar que nada a frente depende dela.' },
    { name: 'dw-run-plan', description: 'Trigger quando usuario quer executar todas as tasks pendentes. Plan check goal-backward, depois execucao paralela em ondas com commits atomicos.' },
    { name: 'dw-run-qa', description: 'Pilota o browser para testar fluxo feliz, edge cases e acessibilidade, com screenshot.' },
    { name: 'dw-run-task', description: 'Trigger quando usuario quer executar uma task especifica por ID. Implementa, valida com testes obrigatorios, commita quando passa.' },
    { name: 'dw-security-check', description: 'Review OWASP + scan Trivy CVE/secret/IaC para TS, Python, C# ou Rust. CRITICAL ou HIGH bloqueia PR.' },
    { name: 'dw-update', description: 'Atualiza o dev-workflow para o release mais recente no npm, com snapshot para rollback.' },
  ],
};

const PLATFORMS = {
  claude: {
    dir: '.claude/skills',
    wrapperTemplate: (name, description) => `---
name: ${name}
description: "${description.replace(/"/g, '\\"')}"
---

Read and follow ALL instructions in \`.dw/commands/${name}.md\`.
`,
  },
  agents: {
    dir: '.agents/skills',
    wrapperTemplate: (name, description) => `---
name: ${name}
description: "${description.replace(/"/g, '\\"')}"
---
<system_instructions>
Source of truth: \`.dw/commands/${name}.md\`

Read and follow the complete instructions in the command file above.
This wrapper exists for tool discovery. All logic lives in .dw/commands/.
</system_instructions>
`,
  },
  opencode: {
    dir: '.opencode/commands',
    flat: true,
    wrapperTemplate: (name, description) => `---
description: ${description}
---
Follow ALL instructions in @.dw/commands/${name}.md

$ARGUMENTS
`,
  },
};

const MCP_SERVERS = {
  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
  },
  playwright: {
    command: 'npx',
    args: ['-y', '@playwright/mcp@latest'],
  },
};

module.exports = { COMMANDS, PLATFORMS, MCP_SERVERS };
