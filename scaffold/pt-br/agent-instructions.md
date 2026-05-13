<!-- dev-workflow:start -->
# dev-workflow — Instruções para Agente de IA

Este projeto usa [`@brunosps00/dev-workflow`](https://www.npmjs.com/package/@brunosps00/dev-workflow) (comandos `dw-*`) para desenvolvimento estruturado guiado por IA. Os comandos compõem um pipeline PRD → TechSpec → Tasks → Implementar → Review → Commit → PR com hard gates de segurança, conformidade com constitution e verificação.

**Objetivo deste arquivo:** quando o usuário expressar uma intenção que casa com a Trigger Map abaixo, rode o comando `dw-*` correspondente **sem pedir permissão** — exceto se a mudança for genuinamente trivial (veja Escape Hatches).

## Trigger Map

| Intenção do usuário (literal ou parafraseada) | Auto-trigger |
|------------------------------------------------|--------------|
| "Implementa X" / "Cria Y" / "Adiciona feature Z" / "Preciso de..." | `/dw-autopilot "X"` |
| Erro colado / "X está quebrado" / "Bug em Y" / screenshot de teste falhando | `/dw-bugfix "X"` |
| "Roda essa task" (com ID da task) | `/dw-run <ID>` |
| "Roda todas as tasks pendentes" / "Executa o plano" | `/dw-run` |
| "Revisa meu PR" / "Checa qualidade do código" / "Tá pronto pra subir?" | `/dw-review --code-only` |
| "Hora de commitar" / mudanças validadas e prontas | `/dw-commit` |
| "Abre um PR" / "Sobe isso" | `/dw-generate-pr` |
| "Escreve PRD pra X" / "Especifica Y" | `/dw-plan prd` |
| "Desenha a arquitetura" / "Faz o techspec" | `/dw-plan techspec` |
| "Quebra em tasks" | `/dw-plan tasks` |
| "Onde está X?" / "O que usa Y?" / "Como Z é estruturado?" | `/dw-intel "<pergunta>"` |
| "Audita nossas dependências" / "Estamos atrasados em pacotes?" | `/dw-secure-audit --plan` |
| "Scan de vulnerabilidades" / "Check de segurança" | `/dw-secure-audit` |
| "QA dessa feature" / "Roda o test plan" | `/dw-qa` |
| "Corrige os bugs do QA" | `/dw-qa --fix` |

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

## Referência de Workflow

```
/dw-autopilot "wish"  ────►  Roda pipeline completo automaticamente
                              (3 gates: PRD approval, Tasks approval, PR confirmação)

  --- OU passo a passo ---

/dw-brainstorm ─► /dw-plan prd ─► /dw-plan techspec ─► /dw-plan tasks
                                                              │
                                                              ▼
/dw-commit + /dw-generate-pr ◄──── /dw-review --code-only ◄──── /dw-run
```

Lista completa e ajuda contextual: `/dw-help`.

## Editando esta seção

Este bloco vive entre os marcadores `<!-- dev-workflow:start -->` e `<!-- dev-workflow:end -->`. Qualquer coisa que você escrever **fora** dos marcadores em `CLAUDE.md` / `AGENTS.md` é preservada a cada `dev-workflow update`. Tudo **dentro** é regenerado do pacote — seus edits dentro do bloco serão sobrescritos.

Para customizar a trigger map permanentemente, copie o conteúdo pra fora dos marcadores (ou pra arquivo separado tipo `.dw/agent-instructions-custom.md`) e edite lá.
<!-- dev-workflow:end -->
