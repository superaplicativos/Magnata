# Magnata Brasil — Web (multiplayer online próprio)

Versão do jogo pronta para você hospedar onde quiser, com **multiplayer online em tempo
real** (Supabase Realtime) entre celulares e computadores diferentes. Sai da dependência
do Claude.

São duas peças, ambas com plano gratuito:
1. **Supabase** — guarda o estado das partidas e sincroniza em tempo real (Realtime).
2. **Vercel** — hospeda o site e te dá a URL pública.

## ➡️ Vai fazer o deploy pelo Google Antigravity?
**Use o `DEPLOY.md`** — ele tem o passo a passo e os prompts prontos para colar no agente.
O arquivo `AGENTS.md` é lido automaticamente pelo Antigravity e já explica o projeto.
O `supabase-setup.sql` tem o SQL pronto (cria a tabela E liga o Realtime).

O passo a passo manual abaixo continua válido se você preferir fazer sem o agente.

Tempo total: ~15 minutos. Não precisa saber programar — é seguir o passo a passo.

---

## PASSO 1 — Criar o banco no Supabase (multiplayer online)

1. Acesse **https://supabase.com** e crie uma conta grátis (pode entrar com GitHub).
2. Clique em **New project**. Dê um nome (ex.: `magnata`), defina uma senha de banco
   (guarde-a, embora você não vá precisar dela aqui) e escolha a região mais próxima
   (ex.: South America / São Paulo). Crie.
3. Espere ~2 minutos até o projeto ficar pronto.
4. No menu lateral, abra **SQL Editor** → **New query**, abra o arquivo
   `supabase-setup.sql` deste projeto, cole TODO o conteúdo e clique em **Run**.
   (Esse SQL cria a tabela `kv`, define as políticas e **liga o Realtime**.)

5. Agora pegue suas duas chaves: menu **Settings** (engrenagem) → **API**. Anote:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public** key (uma chave longa começando com `eyJ...`)

Guarde essas duas — você vai colá-las no Passo 3.

> Por que "público" é ok aqui: a chave `anon` é feita para uso no navegador e só dá
> acesso ao que as políticas permitem. Como é um jogo casual sem dados sensíveis,
> liberar leitura/escrita na tabela `kv` é seguro. (Se um dia virar produto sério com
> dinheiro, aí entra o servidor autoritativo — outro projeto.)

---

## PASSO 2 — Subir o código no GitHub

1. Crie uma conta em **https://github.com** se não tiver.
2. Crie um repositório novo (botão **New**), nome ex.: `magnata-brasil`, deixe **Private**
   se quiser, e crie.
3. Suba esta pasta. Pelo terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Magnata Brasil"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/magnata-brasil.git
git push -u origin main
```

(Se preferir sem terminal: no GitHub use **uploading an existing file** e arraste todos
os arquivos da pasta — menos `node_modules`, que nem existe ainda.)

---

## PASSO 3 — Publicar na Vercel

1. Acesse **https://vercel.com** e entre com sua conta do GitHub.
2. **Add New… → Project** → selecione o repositório `magnata-brasil` → **Import**.
3. A Vercel detecta Vite sozinha. Antes de clicar em Deploy, abra **Environment Variables**
   e adicione as duas chaves do Passo 1:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | sua Project URL (https://....supabase.co) |
   | `VITE_SUPABASE_ANON_KEY` | sua chave anon (eyJ...) |

4. Clique em **Deploy**. Em ~1 minuto você recebe a URL pública (ex.:
   `https://magnata-brasil.vercel.app`).

Pronto. Abra a URL no seu celular e no de um amigo: um cria a partida, compartilha o
código de 4 letras, o outro entra. É multiplayer online de verdade.

---

## Domínio próprio (opcional)

Comprou um domínio (Registro.br, GoDaddy, etc.)? Na Vercel: **Settings → Domains →
Add**, digite seu domínio e siga as instruções de DNS que ela mostra. Em minutos o jogo
fica no seu endereço, com HTTPS automático.

---

## Rodar no seu computador (testar antes de subir)

```bash
npm install
cp .env.example .env      # edite .env e cole suas duas chaves do Supabase
npm run dev               # abre em http://localhost:5173
```

Sem as chaves no `.env`, o jogo roda em **modo local** (só no mesmo aparelho) — útil pra
testar a interface, mas sem multiplayer entre dispositivos.

---

## Como funciona (resumo técnico)

- O jogo é o mesmo componente React do artifact. A única troca foi a camada de
  armazenamento: o `window.storage` do Claude virou `src/storage.js`, que fala com o
  Supabase (nuvem) ou com o `localStorage` (local).
- O estado de cada partida é um registro na tabela `kv` (chave `magnata3:game:CÓDIGO`),
  e o chat em `magnata3:chat:CÓDIGO`. Os clientes leem a cada ~2,5s (polling) e gravam
  as jogadas. O controle de versão do próprio jogo evita conflitos (última escrita vence).
- Tudo client-side: a Vercel serve arquivos estáticos, o Supabase guarda os dados.
  Sem servidor pra manter, custo zero nos planos free para uso casual.

## Atualizar o jogo depois

Mudou algo? `git add . && git commit -m "ajuste" && git push` — a Vercel republica
sozinha a cada push na branch `main`.

## Limites dos planos free

- **Supabase free:** 500 MB de banco e pausa o projeto após ~1 semana sem nenhum acesso
  (reativa sozinho ao abrir). Sobra demais para jogo casual.
- **Vercel free:** banda e builds generosos para projeto pessoal.

Para volume grande de jogadores simultâneos, o polling no Supabase pode ficar pesado —
aí vale migrar para Supabase Realtime (websockets) ou para o servidor autoritativo do
pacote `magnata-cash`. Para jogar com amigos, o que está aqui basta.
