# DEPLOY.md — Publicar o Magnata Brasil usando o Google Antigravity

Guia para você abrir este projeto no Antigravity e pedir ao agente para colocá-lo no ar,
com multiplayer online (Supabase Realtime) e URL pública (Vercel). Tudo com plano grátis.

Há partes que **só você** pode fazer (criar contas, gerar chaves) — o agente não tem suas
senhas. O agente cuida do código, do build e do deploy. Abaixo está o que fazer e o que
pedir, em ordem.

---

## VOCÊ FAZ — Parte 1: criar o projeto no Supabase (multiplayer)

1. Entre em **https://supabase.com** → crie conta grátis (pode usar Google/GitHub).
2. **New project** → nome `magnata`, escolha região São Paulo, defina uma senha de banco
   (guarde), e crie. Aguarde ~2 min.
3. Abra **SQL Editor → New query**, abra o arquivo `supabase-setup.sql` deste projeto,
   cole TODO o conteúdo e clique em **Run**. Isso cria a tabela e liga o Realtime.
4. Vá em **Settings (engrenagem) → API** e copie:
   - **Project URL** → ex.: `https://abcdefgh.supabase.co`
   - **anon public** key → começa com `eyJ...`

Deixe essas duas à mão. Você vai colá-las na Vercel (Parte 3).

> Opcional mas recomendado: em **Database → Replication / Publications**, confirme que a
> tabela `kv` está na publicação `supabase_realtime`. O SQL já faz isso, mas vale conferir.

---

## VOCÊ FAZ — Parte 2: abrir no Antigravity

1. Abra o **Google Antigravity** (app desktop).
2. Abra esta pasta do projeto (`magnata-web`) como workspace.
3. O Antigravity vai ler automaticamente o `AGENTS.md` e entender o projeto.

---

## PEÇA AO AGENTE — Parte 3: build + deploy na Vercel

Cole este prompt no Antigravity:

```
Leia o AGENTS.md. Quero publicar este projeto na Vercel com deploy contínuo.
Faça:
1. Rode `npm install` e depois `npm run build`. Confirme que o build passou sem erros.
2. Inicialize o git (se preciso) e prepare um commit com todos os arquivos,
   respeitando o .gitignore (NÃO inclua .env nem node_modules).
3. Crie um repositório no GitHub e suba o código.
4. Faça deploy na Vercel a partir desse repositório.
5. Configure na Vercel estas Environment Variables (vou te passar os valores):
   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
6. Refaça o deploy para as variáveis valerem e me devolva a URL pública.
Me avise a cada comando que precisar de aprovação e onde eu preciso colar as chaves.
```

Quando o agente pedir, informe os valores:
- `VITE_SUPABASE_URL` = sua Project URL do Supabase (Parte 1)
- `VITE_SUPABASE_ANON_KEY` = sua chave anon (Parte 1)

> O Antigravity pede aprovação para comandos que acessam rede/disco (git push, deploy).
> Você verá o comando e libera. Se ele não tiver login no GitHub/Vercel, ele vai te
> orientar a autenticar — siga as instruções na tela dele.

### Se preferir você mesmo conectar a Vercel (sem o agente fazer o deploy)
1. O agente sobe o código no GitHub (passos 1–3 acima).
2. Você entra em **https://vercel.com** com o GitHub → **Add New → Project** → importa o
   repositório.
3. Em **Environment Variables**, adiciona `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. **Deploy**. Em ~1 min sai a URL.

---

## TESTAR

Abra a URL pública no seu celular e no de um amigo. Um cria a partida (botão **Criar
partida**), compartilha o **código de 4 letras**; o outro digita o código e entra. As
jogadas aparecem na hora nos dois (Realtime). Se aparecer um aviso laranja "modo local"
no canto, as env vars não foram aplicadas — confira a Parte 3 passo 5.

---

## DEPOIS: mudar algo e republicar

Peça ao agente: "faça a alteração X em src/MagnataBrasil.jsx, rode o build, e dê push".
A Vercel republica sozinha a cada push na branch `main`.

## Domínio próprio (opcional)

Tem um domínio? Peça: "configure o domínio meudominio.com.br na Vercel" — ou faça em
**Vercel → Settings → Domains → Add** e siga as instruções de DNS. HTTPS é automático.

---

## Resumo de custos (tudo grátis para começar)

- **Supabase Free:** Realtime incluso — até 200 conexões simultâneas (≈ 30–50 partidas ao
  mesmo tempo) e 2 milhões de mensagens/mês. Projeto pausa após 1 semana sem acesso
  (reativa ao abrir). Suficiente para jogar com amigos e divulgar.
- **Vercel Free:** hospedagem e builds para projeto pessoal, com HTTPS e domínio próprio.

Só pensaria em pagar (Supabase Pro, US$ 25/mês) com centenas de pessoas jogando no mesmo
segundo — problema de sucesso, não de largada.
