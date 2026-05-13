<system_instructions>
Você é um assistente de ajuda do workspace. Quando invocado, apresente ao usuário um guia completo dos comandos disponíveis, seus fluxos de integração e quando usar cada um.

## Quando Usar
- Use quando precisar de uma visão geral dos comandos disponíveis, seus fluxos de integração ou orientação sobre qual comando usar em seguida
- NÃO use quando já souber qual comando específico executar

## Posição no Pipeline
**Antecessor:** (qualquer comando ou pergunta do usuário) | **Sucessor:** (qualquer comando)

## Comportamento

- Se invocado sem argumentos (`/dw-help`): mostre o guia completo abaixo
- Se invocado com argumento correspondente a um comando (`/dw-help dw-create-prd`): mostre apenas a seção detalhada daquele comando
- Se invocado com **keyword que não é nome de comando** (`/dw-help bug`, `/dw-help review`, `/dw-help design`): faça lookup contextual — identifique o(s) comando(s) mais relevante(s) pela keyword e apresente cada um com 1-2 linhas de justificativa ("para bug, use `/dw-bugfix` porque..."). Use a tabela de mapeamento abaixo.

### Mapeamento contextual (keyword → comando sugerido)

| Keyword(s) | Comando sugerido | Justificativa |
|------------|------------------|---------------|
| bug, erro, falha, problema | `/dw-bugfix` | Triagem automática bug vs feature + correção |
| review, revisão, qualidade | `/dw-code-review` | Review formal Nível 3 com relatório |
| qa, teste visual, playwright | `/dw-run-qa` | QA E2E com browser automation |
| refactor, smell, fowler | `/dw-refactoring-analysis` | Auditoria de code smells priorizada |
| design, ui, redesign | `/dw-redesign-ui` | Auditoria + propostas + implementação visual |
| debate, council, stress-test, opiniões | `/dw-brainstorm --council` ou `/dw-create-techspec --council` | Invoca `dw-council` para debate multi-advisor |
| security, segurança, vulnerabilidade, owasp, trivy, cve | `/dw-security-check` | Check multi-camada rígido (OWASP estático + Trivy SCA/IaC + audit nativo) para TS/Python/C#/Rust |
| supply chain, outdated, comprometido, pacote malicioso, atualizar deps, npm audit, pip-audit | `/dw-deps-audit` | Detecta + classifica + plano de update por pacote com QA escopada. Vai além do `/dw-security-check` adicionando remediação. |
| skill, achar skill, instalar skill, ecossistema, capacidade, estender agente | `/dw-find-skills` | Descobre skills no skills.sh / `npx skills` e instala global ou local |
| projeto novo, scaffold, bootstrap, comecar, iniciar projeto, fullstack, monorepo | `/dw-new-project` | Entrevista de stack + tools create-* + docker-compose para dev. Roda apos `npx dev-workflow init`. |
| dockerize, docker, dockerfile, compose, container, imagem prod, multi-stage | `/dw-dockerize` | Le projeto existente, brainstorm de base, gera Dockerfile + docker-compose para dev/prod/ambos, ou audita artefatos existentes. |
| refinamento, refine, idea, one-pager, ideia | `/dw-brainstorm --onepager` | Refinamento de ideia com Product Inventory + classification (IMPROVES/CONSOLIDATES/NEW) + one-pager durável |
| reverter, rollback de task | `/dw-revert-task` | Revert seguro com check de dependências |
| pesquisa, research | `/dw-deep-research` | Pesquisa multi-fonte com citações |
| ideia, brainstorm | `/dw-brainstorm` | Ideação estruturada com trade-offs |
| atualizar dev-workflow | `/dw-update` | Atualiza para versão npm mais recente |

---

# Guia de Comandos - Dev Workflow AI

## Visão Geral

Este workspace utiliza um sistema de comandos AI que automatiza o ciclo completo de desenvolvimento: do planejamento (PRD) até o merge (PR). Os comandos estão em `.dw/commands/` e são acessíveis nos CLIs suportados (ex: Claude Code, Codex, OpenCode e GitHub Copilot), usando o prefixo do CLI (`/comando`).

## Fluxo Principal de Desenvolvimento

```
┌─────────────┐     ┌────────────────┐     ┌──────────────┐
│ /dw-create-prd  │────>│/dw-create-techspec │────>│ /dw-create-tasks │
│ (O QUÊ)     │     │ (COMO)         │     │ (QUANDO)     │
└─────────────┘     └────────────────┘     └──────┬───────┘
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                            ┌────────────────┐         ┌─────────────────┐
                            │ /dw-run-task  │         │ /dw-run-plan │
                            │ (uma por vez)   │         │ (todas auto)    │
                            └───────┬────────┘         └────────┬────────┘
                                    │                           │
                            ┌───────┴───────┐                   │
                            ▼               │                   │
                  ┌──────────────────┐      │                   │
                  │/dw-functional-doc│      │                   │
                  │ (mapeia telas & │      │                   │
                  │  fluxos)        │      │                   │
                  └───────┬──────────┘      │                   │
                          └───────┬─────────┘                   │
                                    │                           │
                                    └─────────┬─────────────────┘
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Validação Nível 1│ (automática, embutida)
                                    │ critérios+testes │
                                    └────────┬────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              ▼              ▼              ▼
                    ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐
                    │/dw-run-qa  │ │/dw-review-impl.│ │ /dw-code-review        │
                    │(QA visual)   │ │(PRD compliance│ │ (code review formal)│
                    └──────────────┘ │ Nível 2)     │ │ (Nível 3)           │
                                     └──────────────┘ └─────────────────────┘
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                    ┌──────────────┐                 ┌────────────────┐
                    │ /dw-commit      │                 │ /dw-generate-pr      │
                    │ (um projeto) │                 │ (push + PR)    │
                    └──────────────┘                 └────────────────┘
```

## Tabela de Comandos

### Planejamento

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-brainstorm` | Facilita ideação estruturada antes do PRD ou da implementação | Problema, ideia ou contexto | Opções + trade-offs + recomendação |
| `/dw-create-prd` | Cria PRD com min. 7 perguntas de clarificação | Descrição da feature | `.dw/spec/prd-[nome]/prd.md` |
| `/dw-create-techspec` | Cria especificação técnica a partir do PRD | Path do PRD | `.dw/spec/prd-[nome]/techspec.md` |
| `/dw-create-tasks` | Quebra PRD+TechSpec em tasks (max 2 FRs/task) | Path do PRD | `.dw/spec/prd-[nome]/tasks.md` + `*_task.md` |

### Execução

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-run-task` | Implementa UMA task + validação Nível 1 + commit | Path do PRD | Código + commit |
| `/dw-run-plan` | Executa TODAS tasks + revisão final Nível 2 | Path do PRD | Código + commits + relatório |
| `/dw-bugfix` | Analisa e corrige bugs (triagem bug vs feature) | Target + descrição | Fix + commit OU PRD (se feature) |
| `/dw-fix-qa` | Corrige bugs documentados no QA e retesta com evidências | Path do PRD | Código + `QA/bugs.md` + `QA/qa-report.md` atualizados |
| `/dw-redesign-ui` | Audita, propõe e implementa redesign visual de páginas/componentes | Página/componente alvo | Brief de redesign + código |
| `/dw-autopilot` | Orquestrador completo: de um desejo até o PR com mínima intervenção | Descrição do desejo | PRD + código + commits + PR |

### Análise e Pesquisa

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-analyze-project` | Escaneia o repo e gera rules do projeto automaticamente | (nenhum) | `.dw/rules/index.md` + `.dw/rules/[projeto].md` |
| `/dw-deep-research` | Pesquisa profunda com citações e verificação multi-fonte | Tópico ou pergunta | Relatório com citações em Markdown/HTML |
| `/dw-functional-doc` | Mapeia telas, fluxos e módulos em dossiê funcional com cobertura E2E | URL/rota alvo + projeto | `.dw/flows/<projeto>/<slug>/` com docs, scripts, evidências |

### Qualidade (3 Níveis)

| Nível | Comando | Quando | Gera Relatório? |
|-------|---------|--------|-----------------|
| **1** | *(embutido no /dw-run-task)* | Após cada task | Não (output no terminal) |
| **2** | `/dw-review-implementation` | Após todas tasks / manual | Sim (output formatado) |
| **3** | `/dw-code-review` | Antes do PR / manual | Sim (`code-review.md`) |

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-run-qa` | QA visual com Playwright MCP + acessibilidade | Path do PRD | `QA/qa-report.md` + `QA/screenshots/` |
| `/dw-review-implementation` | Compara PRD vs código (FRs, endpoints, tasks) | Path do PRD | Relatório de gaps |
| `/dw-code-review` | Code review formal (qualidade, rules, testes) | Path do PRD | `code-review.md` |
| `/dw-refactoring-analysis` | Auditoria de code smells e oportunidades de refatoração (catálogo Fowler) | Path do PRD | `refactoring-analysis.md` |
| `/dw-security-check` | Check de segurança rígido (OWASP estático + Trivy SCA/IaC + audit nativo) para TS/Python/C#/Rust | Path do PRD ou código | `security-check.md` |

### Versionamento

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-commit` | Commit semântico (Conventional Commits) | - | Commit |
| `/dw-generate-pr` | Push + cria PR + copia body + abre URL | Branch alvo | PR no GitHub |
| `/dw-revert-task` | Reverte com segurança os commits de uma task específica (check de dependências + confirmação) | Path do PRD + número da task | Commits revertidos + `tasks.md` atualizado |

### Comandos internos (usados por outros dw-* commands; raramente invocados direto)

| Comando | O que faz | Tipicamente invocado por |
|---------|-----------|--------------------------|
| `/dw-adr` | Registra Architecture Decision Record durante execução do PRD | `/dw-create-techspec`, `/dw-run-task` quando surge decisão não-trivial |
| `/dw-intel` | Consulta o índice do codebase em `.dw/intel/` | `/dw-create-prd`, `/dw-create-techspec`, `/dw-code-review` etc. |
| `/dw-map-codebase` | Constroi/refresca o índice queryable em `.dw/intel/` | `/dw-analyze-project` (auto-roda após geração de rules) |

Esses ficam expostos como slash commands para uso manual ocasional (ex.: registrar ADR rapidamente mid-sessão, consultas ad-hoc no codebase) mas a maioria dos usuários nunca invoca direto — eles são chamados pelos comandos high-level acima.

### Utilitários

| Comando | O que faz | Input | Output |
|---------|-----------|-------|--------|
| `/dw-help` | Este guia de comandos (suporta lookup por keyword: `/dw-help bug`) | (opcional) comando ou keyword | Este documento ou seção filtrada |
| `/dw-update` | Atualiza o dev-workflow para a versão mais recente no npm sem sair do agente (suporta `--rollback`) | (nenhum) ou `--rollback` | Arquivos gerenciados atualizados ou restaurados |

### Bundled Skills (invocadas internamente — não são commands)

Skills em `.agents/skills/` que os commands acima invocam transparentemente. Você não as chama diretamente.

| Skill | Invocada por | Papel |
|-------|--------------|-------|
| `dw-verify` | run-task, run-plan, fix-qa, bugfix, code-review, generate-pr, quick | core rule: nenhuma claim de sucesso sem VERIFICATION REPORT PASS |
| `dw-memory` | run-task, run-plan, autopilot, resume, revert-task | Memory de workflow em dois níveis (shared + task-local) com promotion test |
| `dw-review-rigor` | code-review, review-implementation, refactoring-analysis | De-duplication, severity ordering, verify-intent-before-flag, signal-over-volume |
| `dw-council` | brainstorm `--council`, create-techspec `--council` | Debate multi-advisor (3-5 archetypes) com steel-manning, concession tracking e synthesis que preserva dissent. Opt-in. |

Inspiradas em skills do projeto [Compozy](https://github.com/compozy/compozy) (`cy-final-verify`, `cy-workflow-memory`, `cy-review-round`).

## Fluxos Comuns

### Nova Feature (Completo)
```bash
/dw-brainstorm "ideia inicial"                    # 0. Explora opções e trade-offs
/dw-create-prd                                    # 1. Descreve a funcionalidade
/dw-create-techspec .dw/spec/prd-nome             # 2. Gera spec técnica
/dw-create-tasks .dw/spec/prd-nome                # 3. Quebra em tasks
/dw-run-plan .dw/spec/prd-nome             # 4. Executa todas (inclui Nível 1+2)
/dw-refactoring-analysis .dw/spec/prd-nome        # 5. Auditoria de code smells (opcional)
/dw-code-review .dw/spec/prd-nome               # 6. Code review formal (Nível 3)
/dw-generate-pr main                                # 7. Cria PR
```

### Nova Feature (Incremental)
```bash
/dw-create-prd                                    # 1. PRD
/dw-create-techspec .dw/spec/prd-nome             # 2. TechSpec
/dw-create-tasks .dw/spec/prd-nome                # 3. Tasks
/dw-run-task .dw/spec/prd-nome              # 4. Task 1 (com Nível 1)
/dw-run-task .dw/spec/prd-nome              # 5. Task 2 (com Nível 1)
# ... repete para cada task
/dw-review-implementation .dw/spec/prd-nome      # 6. Revisão PRD (Nível 2)
/dw-code-review .dw/spec/prd-nome               # 7. Code review (Nível 3)
/dw-generate-pr main                                # 8. PR
```

### Bug Simples
```bash
/dw-bugfix meu-projeto "descrição do bug"        # Analisa e corrige
/dw-commit                                       # Commit da correção
/dw-generate-pr main                                # PR
```

### Bug Complexo
```bash
/dw-bugfix meu-projeto "descrição" --análise     # Gera documento de análise
/dw-create-techspec .dw/spec/dw-bugfix-nome          # TechSpec do fix
/dw-create-tasks .dw/spec/dw-bugfix-nome             # Tasks do fix
/dw-run-plan .dw/spec/dw-bugfix-nome          # Executa tudo
/dw-generate-pr main                                # PR
```

### QA Visual (Frontend)
```bash
/dw-run-qa .dw/spec/prd-nome                # QA com Playwright MCP
# Se encontrar bugs:
/dw-fix-qa .dw/spec/prd-nome               # Corrige + retesta ciclo completo
```

### Redesign de Frontend
```bash
/dw-analyze-project                                # 0. Entender padrões do projeto
/dw-redesign-ui "página ou componente alvo"        # 1. Auditar + propor + implementar
/dw-run-qa .dw/spec/prd-nome                       # 2. QA visual (opcional)
/dw-code-review .dw/spec/prd-nome                  # 3. Code review
/dw-commit                                         # 4. Commit
/dw-generate-pr main                               # 5. PR
```

### Autopilot (Pipeline Completo)
```bash
/dw-autopilot "descrição do que quer construir"    # Pesquisa → PRD → Tasks → Código → QA → PR
```

### Consultar Codebase
```bash
/dw-intel "como funciona X neste projeto?"         # Resposta com fontes
```

### Onboarding em Projeto Novo
```bash
/dw-analyze-project                             # Escaneia e gera rules automaticamente
/dw-help                                        # Mostra comandos disponíveis
```

## Estrutura de Arquivos

```
workspace/
├── .dw/
│   ├── commands/              # Fonte de verdade dos comandos
│   │   ├── dw-help.md
│   │   ├── dw-analyze-project.md
│   │   ├── dw-autopilot.md
│   │   ├── dw-brainstorm.md
│   │   ├── dw-create-prd.md
│   │   ├── dw-create-techspec.md
│   │   ├── dw-create-tasks.md
│   │   ├── dw-run-task.md
│   │   ├── dw-run-plan.md
│   │   ├── dw-run-qa.md
│   │   ├── dw-code-review.md
│   │   ├── dw-refactoring-analysis.md
│   │   ├── dw-review-implementation.md
│   │   ├── dw-deep-research.md
│   │   ├── dw-intel.md
│   │   ├── dw-redesign-ui.md
│   │   ├── dw-bugfix.md
│   │   ├── dw-fix-qa.md
│   │   ├── dw-commit.md
│   │   ├── dw-functional-doc.md
│   │   └── dw-generate-pr.md
│   ├── templates/             # Templates de documentos
│   │   ├── prd-template.md
│   │   ├── techspec-template.md
│   │   ├── tasks-template.md
│   │   ├── task-template.md
│   │   ├── bugfix-template.md
│   │   └── functional-doc/    # Templates do dossiê funcional
│   ├── scripts/               # Scripts utilitários
│   │   └── functional-doc/    # Geração de dossiê & runner Playwright
│   ├── references/            # Materiais de referência e documentos externos
│   ├── rules/                 # Regras por projeto (gerado por /dw-analyze-project)
│   │   ├── index.md
│   │   └── [projeto].md
│   └── tasks/                 # PRDs e tasks em andamento
│       └── prd-[nome]/
│           ├── prd.md
│           ├── techspec.md
│           ├── tasks.md
│           └── *_task.md
```

## Dúvidas Frequentes

**Q: Qual a diferença entre `/dw-run-task` e `/dw-run-plan`?**
- `/dw-run-task` executa UMA task com controle manual entre cada uma
- `/dw-run-plan` executa TODAS automaticamente com revisão final

**Q: Preciso rodar `/dw-review-implementation` manualmente?**
- Não se usar `/dw-run-plan` (já inclui). Sim se usar `/dw-run-task` incremental.

**Q: Quando usar `/dw-code-review` vs `/dw-review-implementation`?**
- `/dw-review-implementation` (Nível 2): Verifica se os FRs do PRD foram implementados
- `/dw-code-review` (Nível 3): Além disso, analisa qualidade de código e gera relatório formal

**Q: O `/dw-bugfix` sempre corrige direto?**
- Não. Ele faz triagem. Se for feature (não bug), redireciona para `/dw-create-prd`. Se for bug complexo, pode gerar documento de análise com `--análise`.

**Q: Preciso rodar `/dw-analyze-project` antes de tudo?**
- Sim, é recomendado para projetos novos. Ele gera as rules em `.dw/rules/` que todos os outros comandos utilizam.

**Q: O `/dw-redesign-ui` funciona com Angular?**
- Sim. O comando é framework-agnostic. Para React usa react-doctor e `vercel-react-best-practices`; para Angular usa `ng lint` e Angular DevTools. Disciplina de UI (`dw-ui-discipline`) funciona com qualquer framework — enforça o hard-gate, anti-slop catalog e WCAG floor independente do stack.

**Q: Como obtenho inteligência do codebase e execução paralela?**
- Os dois são nativos do dev-workflow. Rode `/dw-map-codebase` para construir o índice queryable em `.dw/intel/`, depois `/dw-intel "<pergunta>"` para consultá-lo. Para execução paralela, `/dw-run-plan` invoca os agentes bundled de execução de fase (executor + plan-checker) diretamente para dispatcha tasks em waves com commits atômicos por task. Sem dependência externa.

**Q: O `/dw-autopilot` substitui todos os outros comandos?**
- Não. Ele orquestra os comandos existentes em sequência. Você ainda pode usar cada comando individualmente para controle manual. O autopilot é para quando quer ir do desejo ao PR com mínima intervenção.

</system_instructions>
