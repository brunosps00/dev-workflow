<!-- dev-workflow:start -->
# dev-workflow — Instruções para Agente de IA

Este projeto usa [`@brunosps00/dev-workflow`](https://www.npmjs.com/package/@brunosps00/dev-workflow) (comandos `dw-*`) para desenvolvimento estruturado guiado por IA. Os comandos compõem um pipeline PRD → TechSpec → Tasks → Implementar → Review → Commit → PR com hard gates de segurança, conformidade com constitution e verificação.

**Objetivo deste arquivo:** quando o usuário expressar uma intenção que casa com a Trigger Map abaixo, rode o comando `dw-*` correspondente **sem pedir permissão** — exceto se a mudança for genuinamente trivial (veja Escape Hatches).

## Matriz de Auto-Sizing

Antes de escolher um comando da Trigger Map, dimensione o escopo real da mudança. A mesma intenção ("conserta isso", "adiciona isso") pode significar quantidades muito diferentes de trabalho; a matriz nomeia quatro tamanhos e roteia cada um para uma entrada diferente. **Escolha o menor que cabe — sub-rotear desperdiça cerimônia, super-rotear esconde o escopo.**

| Tamanho | Como se parece | Rotear para |
|---------|----------------|-------------|
| **Pequeno** | ≤3 arquivos, sem migration, sem novo endpoint, descritível em uma frase. Exemplos: typo, log message, config de uma linha, bump de dependência, version pin. | Faça inline. Nenhum comando `dw-*`. |
| **Médio** | Feature ou bug claro, <10 tasks numeradas esperadas, único componente ou serviço, sem decisões arquiteturais. Exemplos: adicionar campo de form com validação, corrigir regressão em módulo conhecido, ligar novo endpoint num handler existente. | `/dw-bugfix` (bugs) ou `/dw-plan` (features) — direto, não via `/dw-autopilot`. |
| **Grande** | Feature multi-componente, ≥10 tasks esperadas, toca múltiplos módulos, tem superfície UX user-visible E backend. Exemplos: adicionar nova entidade end-to-end (model + migration + API + UI), introduzir integração de terceiro, redesenhar fluxo. | `/dw-autopilot "<wish>"` — pipeline completo PRD → TechSpec → Tasks → Run → QA → Review → Commit → PR com três gates. |
| **Complexo** | Domínio novo, requisitos ambíguos, decisão arquitetural exigida, superfície regulatória ou de compliance, ou escopo que cruza múltiplos PRDs. Exemplos: introduzir event sourcing, reconstruir auth, multi-tenancy, nova linha de produto. | `/dw-brainstorm "<ideia>"` primeiro (auto-dispatch de modos research/council), depois `/dw-plan --council` para a etapa de techspec rodar o debate multi-advisor. |

**Safety valve:** se você começou em Pequeno ou Médio mas o trabalho revela que é Grande de fato (a listagem inline passa de 5 passos, ou `/dw-bugfix` dispara seu `Step 5.0`), PARE e escale. Não existe flag para bypass. Escalar é o desfecho correto.

**Adaptado de** [`tech-leads-club/agent-skills/tlc-spec-driven`](https://github.com/tech-leads-club/agent-skills/tree/main/packages/skills-catalog/skills/(development)/tlc-spec-driven) (CC-BY-4.0). A matriz de quatro tamanhos é de lá; o mapeamento para comandos `dw-*` é específico do dev-workflow.

## Trigger Map

| Intenção do usuário (literal ou parafraseada) | Auto-trigger |
|------------------------------------------------|--------------|
| "Implementa X" / "Cria Y" / "Adiciona feature Z" / "Preciso de..." | `/dw-autopilot "X"` |
| "Autopilota esse PRD" / "Leva esse PRD pra PR" / continua escalação de bugfix autonomamente | `/dw-autopilot --from-prd <slug>` (PRD existente em `.dw/spec/<slug>/`) |
| Erro colado / "X está quebrado" / "Bug em Y" / screenshot de teste falhando | `/dw-bugfix "X"` |
| "Planeja essa feature" / "Escreve PRD + techspec + tasks" | `/dw-plan "X"` |
| "Escreve PRD pra X" / "Especifica Y" | `/dw-plan prd "X"` |
| "Desenha a arquitetura" / "Faz o techspec" | `/dw-plan techspec` |
| "Quebra em tasks" | `/dw-plan tasks` |
| "Roda essa task" (com ID da task) | `/dw-run <ID>` |
| "Roda todas as tasks pendentes" / "Executa o plano" | `/dw-run` |
| "Continue de onde parei" | `/dw-run --resume` |
| "Pausa o trabalho" / "Encerra a sessão" / "Salva onde paramos" | `/dw-pause` |
| "Retoma" / "Onde paramos?" / "Volta de onde parei" | `/dw-resume` |
| "QA dessa feature" / "Roda o test plan" | `/dw-qa` |
| "Corrige os bugs do QA" | `/dw-qa --fix` |
| "Avalia a feature AI" / "Testa o RAG / classifier" | `/dw-qa --ai` |
| "Caminha comigo pela feature" / "UAT comigo" / "Vamos fazer um run-through manual" | `/dw-qa --uat` |
| "Revisa esse bugfix" / "Code-review do fix `<slug>`" | `/dw-review --bugfix <slug>` |
| "QA desse bugfix" / "Valida o fix `<slug>`" | `/dw-qa --bugfix <slug>` |
| "Revisa meu PR" / "Checa qualidade" / "Tá pronto pra subir?" | `/dw-review` |
| "Só checagem de cobertura PRD" | `/dw-review --coverage-only` |
| "Só code review qualidade" | `/dw-review --code-only` |
| "Hora de commitar" / mudanças validadas e prontas | `/dw-commit` |
| "Abre um PR" / "Sobe isso" | `/dw-generate-pr` |
| "Brainstorm X" / "Explora ideias" / "Research X" / "Auditoria de saúde do código" / "Tech debt" | `/dw-brainstorm "X"` (auto-dispatch dos modos grill / prototype / council / research / refactor-audit / onepager conforme os sinais) |
| "Onde está X?" / "O que usa Y?" / "Como Z é estruturado?" | `/dw-intel "<pergunta>"` |
| "Reconstrói o índice" / "Refresh do intel" | `/dw-intel --build` |
| "Redesign dessa UI" / "Audita e entrega novo design" | `/dw-redesign-ui "<target>"` |
| "Audita dependências" / "Estamos atrasados em pacotes?" | `/dw-secure-audit --plan` |
| "Scan de vulnerabilidades" / "Check de segurança" | `/dw-secure-audit` |
| "Analisa esse projeto" / "Gera rules" | `/dw-analyze-project` |
| "Abre um novo projeto" / "Bootstrap de stack" | `/dw-new-project` |
| "Dockeriza isso" / "Adiciona docker-compose" | `/dw-dockerize` |
| "Functional doc" / "Mapeia screens e flows" | `/dw-functional-doc` |
| "Instala skills Azure" / "Configura MCP do Microsoft docs" / "Adiciona expertise Azure" / "Vou trabalhar com Azure" | `/dw-install-azure-skills` |
| "Instala skills AWS" / "Configura MCP da AWS" / "Adiciona expertise AWS" / "Vou trabalhar com AWS" | `/dw-install-aws-skills` |

**Prioridade:** na dúvida entre dois comandos, `/dw-autopilot` é o default mais seguro pra qualquer pedido de feature não-trivial — ele compõe os demais.

## Hard Gates (os comandos enforçam — não burle)

- **`.dw/constitution.md`**: princípios com `severity: high` ou `critical` bloqueiam PRs / techspecs sem um ADR justificando o desvio. Constitution ausente? Os comandos auto-instalam defaults em `severity: info` (não-bloqueante) e seguem — ausência nunca bloqueia.
- **`.dw/spec/<prd>/tasks-validation.md`**: auto-gerado no fim do `/dw-plan tasks`. Qualquer dimensão FAIL bloqueia approval do usuário até resolver ou override explícito.
- **Verification**: `/dw-generate-pr` exige `dw-verify` PASS fresco (testes + lint + build) depois do último edit.
- **Segurança**: projetos TS / Python / C# / Rust precisam passar `/dw-secure-audit` (Trivy + OWASP + lockfile audit) antes do PR abrir.

## Escape Hatches — NÃO auto-trigger

Quando qualquer destes se aplica, responda direto e **não** invoque comando `dw-*`:

- Correção de uma linha: typo, rename, sort de imports, ajuste de comentário.
- Exploração pura: "como isso funciona?", "me mostra X", "explica Y".
- Preferência estética: "prefiro esse estilo" — aplica, não roda pipeline.
- Usuário diz explicitamente "faz direto" / "pula autopilot" / "não precisa de PRD" — honre.
- A conversa já está dentro de um fluxo `dw-*` (você já está executando tasks; não inicie pipeline novo).

## Padrão zoom-out (para áreas desconhecidas do código)

Quando você cai numa área do codebase que não conhece e a orientação custa mais que a tarefa em si, **não mergulhe nos arquivos primeiro** — peça a um agente de exploração que produza um mapa. Passe o glossário de domínio do projeto (`.dw/rules/index.md`) e diga: "zoom out de um nível — me mostra os módulos relevantes, suas superfícies públicas, quem chama, e o fluxo de dados entre eles, usando o vocabulário do glossário de domínio." Pegue a visão geral, e só então mergulhe. Isso evita a armadilha de ler o arquivo mais profundo primeiro e reconstruir a arquitetura das folhas pra cima.

Adaptado de [`mattpocock/skills/zoom-out`](https://github.com/mattpocock/skills/tree/main/zoom-out) (MIT).

## Referência de Workflow

```
/dw-autopilot "wish"  ────►  Roda pipeline completo automaticamente
                              (3 gates: PRD approval, Tasks approval, PR confirmação)

  --- OU passo a passo ---

/dw-brainstorm ─► /dw-plan ─► /dw-run ─► /dw-qa ─► /dw-review ─► /dw-commit ─► /dw-generate-pr
```

Lista completa e ajuda contextual: `/dw-help`.

## Editando esta seção

Este bloco vive entre os marcadores `<!-- dev-workflow:start -->` e `<!-- dev-workflow:end -->`. Qualquer coisa que você escrever **fora** dos marcadores em `CLAUDE.md` / `AGENTS.md` é preservada a cada `dev-workflow update`. Tudo **dentro** é regenerado do pacote — seus edits dentro do bloco serão sobrescritos.

Para customizar a trigger map permanentemente, copie o conteúdo pra fora dos marcadores (ou pra arquivo separado tipo `.dw/agent-instructions-custom.md`) e edite lá.
<!-- dev-workflow:end -->
