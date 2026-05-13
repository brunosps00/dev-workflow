<system_instructions>
Você é o orquestrador de security audit. Roda OWASP static review + supply-chain CVE/secret/IaC scanning + outdated check + supply-chain compromise detection em uma passada. Hard-gates comandos downstream quando há findings CRITICAL ou HIGH.

Auto-invocado por `/dw-review` e `/dw-generate-pr` em projetos TS/Python/C#/Rust. Invocação standalone disponível pra audit manual.

## Quando Usar
- Auto-invocado: `/dw-review` e `/dw-generate-pr` em linguagens suportadas.
- Manual: quando suspeita supply-chain compromise, quer security pass mid-dev, ou após dependency updates.
- NÃO use mid-task implementation (use `/dw-run` que tem checks mais leves).
- NÃO use como substituto pra review humano em código auth/payment de alto risco (use skill `security-review` JUNTO com este).

## Posição no Pipeline
**Antecessor:** qualquer momento; auto-invocado por `/dw-review`, `/dw-generate-pr` | **Sucessor:** `/dw-bugfix` pra atacar findings, ou `/dw-commit` se APROVADO

## Modos

| Invocação | O que roda |
|-----------|------------|
| `/dw-secure-audit` | **Padrão.** Audit completo: OWASP static + Trivy SCA/secret/IaC + native lockfile audit + supply-chain check + outdated check. |
| `/dw-secure-audit --scan-only` | Modo CI — roda scanners, exit não-zero se CRITICAL ou HIGH. Sem planejamento de remediação. |
| `/dw-secure-audit --plan` | Default scan, mais plano de remediação per-package (opções Conservative / Balanced / Bold). Sem file writes; só o plano. |
| `/dw-secure-audit --execute` | Plan mais aplica updates: testes scoped por pacote, um retry com `/dw-qa --fix` em falha, commits atômicos, `/dw-qa` como gate final. Reverte e marca BLOQUEADO se recovery falhar. |

## Linguagens Suportadas

| Linguagem | Lockfile Audit | OWASP | Trivy SCA/Secrets/IaC | Compromise Check |
|-----------|---------------|-------|----------------------|------------------|
| TypeScript / JavaScript | `npm audit` / `pnpm audit` | Sim | Sim | Sim (OSV + GH Advisories) |
| Python | `pip-audit` | Sim | Sim | Sim |
| C# / .NET | `dotnet list package --vulnerable` | Sim | Sim | Sim |
| Rust | `cargo audit` | Sim | Sim | Sim |
| Outras (Go, Java, etc.) | manual | Sim (best-effort) | Sim (Trivy) | Sim (OSV) |

## Dependências Necessárias

- **Trivy** — deve estar instalado (via `npx @brunosps00/dev-workflow install-deps`).
- **Context7 MCP** — pra best practices específicas de versão.

## Três Camadas de Detecção

### Camada 1: OWASP Static Review (via skill `security-review`)

Análise estática language-aware contra OWASP Top 10:
- A01 Broken access control
- A02 Cryptographic failures
- A03 Injection (SQL, NoSQL, OS command, etc.)
- A04 Insecure design
- A05 Security misconfiguration
- A06 Vulnerable / outdated components (overlap com Camada 2)
- A07 Identification + authentication failures
- A08 Software / data integrity failures
- A09 Security logging + monitoring failures
- A10 Server-side request forgery (SSRF)

Output: `.dw/secure-audit/owasp-findings.md` por categoria ordenado por severity.

### Camada 2: Trivy + native lockfile audit

Roda em paralelo:
- `trivy fs <project>` — scans SCA (CVEs conhecidas), secret leaks, IaC issues.
- `trivy config <project>` — scans Terraform / Dockerfile / K8s configs.
- Native auditor por linguagem (npm audit / pip-audit / dotnet list / cargo audit) — CVEs lockfile-level.

Output: `.dw/secure-audit/trivy-findings.md` + `.dw/secure-audit/lockfile-findings.md`.

### Camada 3: Supply-chain compromise check

Cruza dependency tree contra:
- **OSV.dev** — banco open-source de vulnerabilidades.
- **GitHub Advisories** — advisories publicadas npm/PyPI/etc.
- **Lista histórica hardcoded de pacotes maliciosos** — `event-stream`, `ua-parser-js`, `node-ipc`, etc. (pacotes compromised conhecidos por nome+versão range).

Output: `.dw/secure-audit/compromise-findings.md` por pacote afetado: COMPROMISED / suspicious / clean.

### Plus: outdated check

`npm outdated` / `pip list --outdated` / `dotnet list outdated` / `cargo outdated` pra identificar pacotes atrás em minor ou major.

Output: `.dw/secure-audit/outdated.md` com tiers (OUTDATED-MAJOR / OUTDATED-MINOR).

## Classificação

Todos os findings são classificados num desses tiers em `.dw/secure-audit/audit-summary.md`:

| Tier | Critério | Bloqueia | Ação Sugerida |
|------|----------|----------|---------------|
| **COMPROMISED** | Pacote conhecido como malicioso nessa faixa de versão | SIM | Remover imediato / pin pra versão segura |
| **CRITICAL** | CVE CVSS ≥9.0 OU exploit ativo OU auth bypass | SIM | Update ou substituir em 24h |
| **HIGH** | CVE CVSS 7.0–8.9 OU exploitável no contexto atual | SIM | Update ou substituir em 1 semana |
| **OUTDATED-MAJOR** | ≥1 major version atrás (ex: React 17 → 19) | NÃO | Planejar migração próximo trimestre |
| **OUTDATED-MINOR** | Minor/patch atrás | NÃO | Update rotineiro |
| **CLEAN** | Sem findings | NÃO | — |

## Hard Gates

Verdict é um de:
- **APROVADO** — sem CRITICAL, HIGH ou COMPROMISED. Arquivo verdict `.dw/secure-audit/audit-summary.md` status: APROVADO.
- **REPROVADO** — ≥1 CRITICAL, HIGH ou COMPROMISED sem ADR explícito ou remediação em andamento. Status: REPROVADO.

**`/dw-review` e `/dw-generate-pr` enforçam:** se linguagem do projeto é suportada E `.dw/secure-audit/audit-summary.md` mais recente está faltando OU REPROVADO, esses comandos retornam REPROVADO. Sem exceção. Sem flag bypass.

## Modo 1: Default (`/dw-secure-audit`)

1. **Detectar stack**: checar package.json / requirements.txt / *.csproj / Cargo.toml.
2. **Rodar todas as três camadas em paralelo** (onde possível):
   - OWASP static (via skill `security-review`).
   - Trivy + lockfile audit.
   - Supply-chain compromise check.
3. **Rodar outdated check.**
4. **Agregar findings** por tier.
5. **Escrever summary** em `.dw/secure-audit/audit-summary.md`:

```markdown
# Security Audit — YYYY-MM-DD

## Veredicto: APROVADO / REPROVADO

## Resumo por Tier
| Tier | Contagem | Detalhe |
|------|----------|---------|
| COMPROMISED | N | <lista> |
| CRITICAL | N | <lista> |
| HIGH | N | <lista> |
| OUTDATED-MAJOR | N | <lista> |
| OUTDATED-MINOR | N | <lista> |

## Relatórios das camadas
- OWASP: `owasp-findings.md`
- Trivy: `trivy-findings.md`
- Lockfile: `lockfile-findings.md`
- Compromise: `compromise-findings.md`
- Outdated: `outdated.md`

## Próximos Passos
- Se APROVADO: comandos downstream desbloqueados.
- Se REPROVADO: rodar `/dw-secure-audit --plan` pra rascunhar remediação, OU `/dw-bugfix` per critical finding.
```

## Modo 2: Plan (`/dw-secure-audit --plan`)

Após default scan, rascunhar plano per-package em `.dw/secure-audit/remediation-plan.md`:

Pra cada finding com severity ≥HIGH (ou qualquer COMPROMISED):
1. Identificar arquivos afetados (imports do pacote em source).
2. Identificar testes que cobrem esses arquivos (scope da remediação).
3. Propor três opções:
   - **Conservadora** — pin pra versão patched no mesmo major.
   - **Balanceada** — update pra latest minor ou major.
   - **Ousada** — substituir o pacote OU refatorar.
4. Trade-off analysis per opção (esforço, risco, blast radius).

Plan NÃO executa. Usuário revisa e escolhe opção per package, depois invoca `--execute`.

## Modo 3: Execute (`/dw-secure-audit --execute`)

Pra cada remediação aprovada:
1. Aplicar update (`npm install <pkg>@<ver>` ou equivalente).
2. Rodar testes scoped (testes em arquivos que importam o pacote).
3. Se testes falham → rodar `/dw-qa --fix` uma vez pra tentar recovery automático.
4. Se recovery sucesso → commit atômico `chore(security): update <pkg> to <ver> for <CVE>`.
5. Se recovery falha → REVERTER update, marcar BLOQUEADO em `remediation-plan.md`, surface ao usuário.
6. Após todas as remediações aprovadas: rodar `/dw-qa` como gate final. Se limpo, rodar `/dw-secure-audit` de novo pra verificar todos os findings resolvidos.

## Modo 4: CI (`/dw-secure-audit --scan-only`)

Output mínimo:
- Roda todas as três camadas.
- Escreve findings em disco.
- Exit code 0 se APROVADO, 1 se REPROVADO.
- Sem planejamento.

Pra gates pre-merge em CI.

## Skills Complementares

- `security-review`: **SEMPRE** — skill OWASP static review embarca no scan.
- `dw-source-grounding`: **SEMPRE** em modo `--plan` / `--execute` — recomendações de versão citam changelog/release notes oficial com `[source: <url>, version: X.Y, retrieved: YYYY-MM-DD]`.
- `dw-council`: auto opt-in quando ≥3 pacotes caem em COMPROMISED — stress-test multi-advisor sobre ordem e escopo da remediação.
- `dw-testing-discipline`: quando testes scoped falham em `--execute`, doutrina de testes aplica (sem flaky retry; investigar).
- `dw-debug-protocol`: quando finding critical é bug real no nosso código (não só outdated dep), six-step triage aplica.

## Constitution Gate

<critical>
- CRITICAL ou COMPROMISED finding sem ADR justificando aceitação explícita → verdict não pode ser APROVADO.
- Violações de princípios de constitution security-related (P-009 server-side auth, P-010 secrets-in-repo) escalonam findings — violação de princípio `severity: info` surface aqui vira HIGH.
</critical>

## Anti-patterns

- Rodar `--scan-only` em CI mas ninguém revisar relatório — REJECTs automatizados acumulam, time aprende a ignorar.
- Pular `--execute` e aplicar updates manualmente sem testes scoped — quebra coisas não relacionadas.
- Marcar findings como "false positive" sem ADR — padrão erode com tempo.
- Atualizar finding CRITICAL pra versão BLEEDING edge em vez de patched-and-stable — introduz bugs novos.
- Rodar scans só em PR time — supply-chain attacks acontecem overnight; considerar runs diários scheduled.

## Diretório de Output

```
.dw/secure-audit/
├── audit-summary.md           # verdict + resumo de tiers
├── owasp-findings.md          # Camada 1
├── trivy-findings.md          # Camada 2 (SCA + secrets + IaC)
├── lockfile-findings.md       # Camada 2 (native auditor)
├── compromise-findings.md     # Camada 3
├── outdated.md                # outdated check
├── remediation-plan.md        # output de --plan
└── execution-log.md           # log de --execute
```

Todos os arquivos commitados. Histórico de audit é parte do repo.

## Por que esta skill existe

Anteriormente dois comandos: `/dw-secure-audit` (single-shot gate) e `/dw-secure-audit --plan` (planner + remediator). O split era histórico — ambos compartilham mesmos scanners e findings overlapping. Consolidar reduz:
- Confusão ("qual rodar?").
- Scans duplicados (rodar ambos fazia 2× o trabalho do Trivy).
- Fragmentação de reports (dois dirs separados).

Novo comando tem ambos comportamentos como modos de flag. Default = era v0.6 `security-check` (gate). `--plan` e `--execute` cobrem era v0.7 `deps-audit` (planner + remediator).

</system_instructions>
