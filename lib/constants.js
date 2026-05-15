const COMMANDS = {
  en: [
    { name: 'dw-adr', description: 'Records an architectural decision and the trade-offs accepted, before they get lost.' },
    { name: 'dw-analyze-project', description: 'Scans the repo to learn its stack and conventions, then writes the rules other commands rely on.' },
    { name: 'dw-autopilot', description: 'Trigger when user asks to implement, build, create, or add a feature non-trivially. Runs full PRD-to-PR pipeline with three gates. Use --from-prd <slug> to resume from an existing PRD (e.g., after a /dw-bugfix safety-valve escalation), skipping Steps 1-4 and starting at GATE 1.' },
    { name: 'dw-brainstorm', description: 'Refine an idea against the product\'s existing features. Modes: default ideation, --research (multi-source cited research), --refactor (Fowler code-smell catalog), --onepager, --council.' },
    { name: 'dw-bugfix', description: 'Trigger when user reports a bug, pastes an error, or describes broken behavior. Triages with three questions, then fixes or routes to PRD.' },
    { name: 'dw-commit', description: 'Trigger when implementation is complete and pending changes need to be committed. Atomic commits with Conventional Commits messages.' },
    { name: 'dw-dockerize', description: 'Reads a project, detects the stack and runtime deps, then proposes Dockerfile and docker-compose for dev and prod with explicit trade-offs.' },
    { name: 'dw-find-skills', description: 'Searches the npx skills ecosystem for a skill matching what you need, vets it, and installs it where you choose.' },
    { name: 'dw-functional-doc', description: 'Maps screens and user flows into a functional doc, validated end-to-end with Playwright.' },
    { name: 'dw-generate-pr', description: 'Trigger when commits are ready and the branch needs a PR. Pushes branch and opens PR with summary + test plan + hard verify gate.' },
    { name: 'dw-help', description: 'Lists primary commands and the flows that connect them. Pass --advanced to see internal/hidden commands.' },
    { name: 'dw-install-azure-skills', description: 'Trigger when user asks to install Azure expertise, setup Microsoft docs MCP, or add Azure agent skills. Opt-in: clones curated skills from MicrosoftDocs/Agent-Skills into .agents/skills/azure/ and registers the Microsoft Learn MCP server.' },
    { name: 'dw-intel', description: 'Codebase intelligence: query mode (default) answers questions citing .dw/intel/ + .dw/rules/; --build mode (re)builds the index.' },
    { name: 'dw-new-project', description: 'Interviews you about stack and infra, then scaffolds a working monorepo with docker-compose for dev, .env, scripts, CI, and seeded rules.' },
    { name: 'dw-pause', description: 'Trigger when user says "pause work", "end session", or "save where we are". Consolidates open loops, decisions, blockers, and todos into .dw/STATE.md so the next session can resume.' },
    { name: 'dw-plan', description: 'Trigger when user has a feature idea and needs spec + architecture + tasks. Runs PRD → TechSpec → Tasks sequentially. Stages: prd / techspec / tasks; --from techspec; --council.' },
    { name: 'dw-qa', description: 'Trigger when user wants to validate behavior beyond unit tests. Mode-aware (UI / API / --ai / --uat). --fix enters the iterative QA + fix-retest loop. --bugfix <slug> targets a .dw/bugfixes/ entry.' },
    { name: 'dw-redesign-ui', description: 'Audits a frontend page, proposes design directions you choose from, then ships the redesign.' },
    { name: 'dw-resume', description: 'Trigger when user says "resume work", "where did we stop?", or starts a session in a project with an existing .dw/STATE.md. Reads STATE.md, presents a TLDR, and suggests the next dw-* command.' },
    { name: 'dw-review', description: 'Trigger when user asks to review code, check quality, or verify PR readiness. Default runs L2 (PRD coverage) + L3 (code quality). Flags --coverage-only / --code-only / --bugfix <slug>.' },
    { name: 'dw-run', description: 'Trigger when user wants to execute tasks. Default runs all pending in dependency order; \'run <task-id>\' runs one; \'run --resume\' continues an interrupted plan.' },
    { name: 'dw-secure-audit', description: 'Unified security audit: OWASP + Trivy SCA/secret/IaC + lockfile + supply-chain compromise check. Hidden; auto-invoked by /dw-review and /dw-generate-pr.' },
    { name: 'dw-update', description: 'Updates dev-workflow to the latest npm release in-place, with a snapshot you can roll back to.' },
  ],
  'pt-br': [
    { name: 'dw-adr', description: 'Registra uma decisao arquitetural e os trade-offs aceitos, antes que se percam.' },
    { name: 'dw-analyze-project', description: 'Escaneia o repo para aprender stack e convencoes, e escreve as regras que os outros commands usam.' },
    { name: 'dw-autopilot', description: 'Trigger quando usuario pede pra implementar, criar ou adicionar uma feature nao-trivial. Roda pipeline completo PRD-ao-PR com tres gates. Use --from-prd <slug> para retomar de um PRD existente (ex: apos escalacao do safety valve do /dw-bugfix), pulando Etapas 1-4 e comecando no GATE 1.' },
    { name: 'dw-brainstorm', description: 'Refina uma ideia contra features existentes do produto. Modos: ideacao default, --research (research multi-fonte citada), --refactor (catalogo de code smells Fowler), --onepager, --council.' },
    { name: 'dw-bugfix', description: 'Trigger quando usuario reporta bug, cola erro ou descreve comportamento quebrado. Tria com tres perguntas, depois corrige ou roteia pra PRD.' },
    { name: 'dw-commit', description: 'Trigger quando implementacao esta completa e ha mudancas pendentes pra commit. Commits atomicos com mensagens Conventional Commits.' },
    { name: 'dw-dockerize', description: 'Le um projeto, detecta stack e deps de runtime, e propoe Dockerfile e docker-compose para dev e prod com trade-offs explicitos.' },
    { name: 'dw-find-skills', description: 'Busca no ecossistema npx skills uma skill que resolva o que voce precisa, valida e instala onde voce escolher.' },
    { name: 'dw-functional-doc', description: 'Mapeia telas e fluxos em um dossie funcional, validado E2E com Playwright.' },
    { name: 'dw-generate-pr', description: 'Trigger quando commits estao prontos e branch precisa de PR. Push da branch e abre PR com summary + test plan + hard verify gate.' },
    { name: 'dw-help', description: 'Lista comandos primarios e fluxos que os conectam. Passe --advanced para ver comandos internos/escondidos.' },
    { name: 'dw-install-azure-skills', description: 'Trigger quando usuario pede pra instalar expertise Azure, configurar MCP do Microsoft docs, ou adicionar agent skills Azure. Opt-in: clona skills curadas de MicrosoftDocs/Agent-Skills para .agents/skills/azure/ e registra o Microsoft Learn MCP server.' },
    { name: 'dw-intel', description: 'Inteligencia do codebase: modo query (default) responde citando .dw/intel/ + .dw/rules/; modo --build (re)constroi indice.' },
    { name: 'dw-new-project', description: 'Entrevista voce sobre stack e infra, depois faz scaffold de um monorepo com docker-compose para dev, .env, scripts, CI e rules seed.' },
    { name: 'dw-pause', description: 'Trigger quando usuario diz "pausa o trabalho", "encerra a sessao" ou "salva onde paramos". Consolida pontas soltas, decisoes, bloqueios e todos em .dw/STATE.md para a proxima sessao retomar.' },
    { name: 'dw-plan', description: 'Trigger quando usuario tem ideia de feature e precisa spec + arquitetura + tasks. Roda PRD → TechSpec → Tasks sequencial. Stages: prd / techspec / tasks; --from techspec; --council.' },
    { name: 'dw-qa', description: 'Trigger quando usuario quer validar comportamento alem de unit tests. Mode-aware (UI / API / --ai / --uat). --fix entra no loop iterativo QA + fix-retest. --bugfix <slug> aponta para uma entrada em .dw/bugfixes/.' },
    { name: 'dw-redesign-ui', description: 'Audita uma pagina frontend, propoe direcoes de design que voce escolhe, e entrega o redesign.' },
    { name: 'dw-resume', description: 'Trigger quando usuario diz "retoma", "onde paramos?" ou comeca sessao num projeto com .dw/STATE.md existente. Le STATE.md, apresenta TLDR e sugere proximo comando dw-*.' },
    { name: 'dw-review', description: 'Trigger quando usuario pede pra revisar codigo, checar qualidade ou validar prontidao pra PR. Default roda L2 (cobertura PRD) + L3 (qualidade). Flags --coverage-only / --code-only / --bugfix <slug>.' },
    { name: 'dw-run', description: 'Trigger quando usuario quer executar tasks. Default roda todas pendentes em ordem de dependencia; \'run <task-id>\' roda uma; \'run --resume\' continua plan interrompido.' },
    { name: 'dw-secure-audit', description: 'Audit unificado de seguranca: OWASP + Trivy SCA/secret/IaC + lockfile + supply-chain compromise. Hidden; auto-invocado por /dw-review e /dw-generate-pr.' },
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
