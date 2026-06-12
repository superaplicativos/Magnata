# AGENTS.md — Contexto do projeto para agentes (Antigravity)

Este arquivo orienta agentes de IA (Google Antigravity, etc.) sobre como trabalhar
neste projeto. Leia antes de agir.

## O que é
**Magnata Brasil** — jogo de tabuleiro multiplayer online (estilo Banco Imobiliário,
tema turismo brasileiro). Frontend React + Vite. O multiplayer usa **Supabase Realtime**.
Não há backend próprio: a Vercel serve os arquivos estáticos e o Supabase guarda o estado.

## Stack
- React 18 + Vite 5
- TailwindCSS 3 (utilitários; classes customizadas `mb-*` ficam num `<style>` inline
  dentro do componente — NÃO mexa nelas)
- `@supabase/supabase-js` (Realtime + REST) em `src/storage.js`

## Estrutura
- `src/MagnataBrasil.jsx` — o jogo inteiro (componente único, ~2200 linhas). **Não
  refatore nem reescreva.** Só mexa aqui se o usuário pedir mudança de regra/visual.
- `src/storage.js` — camada de dados. Expõe `window.storage.{get,set}` que o jogo usa.
  Cloud (Supabase Realtime) se houver env vars; senão localStorage.
- `src/App.jsx`, `src/main.jsx`, `src/index.css` — entrada e wrapper.
- `index.html`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js` — config.

## Variáveis de ambiente (obrigatórias para multiplayer online)
- `VITE_SUPABASE_URL` — URL do projeto Supabase
- `VITE_SUPABASE_ANON_KEY` — chave anon (public) do Supabase
Sem elas, o jogo roda em modo local (um aparelho só). Em produção (Vercel), defina-as
nas Environment Variables do projeto.

## Banco de dados (Supabase)
Tabela única `kv (key text primary key, value text, updated_at timestamptz)`, com RLS e
políticas públicas de select/insert/update. O SQL completo está em `supabase-setup.sql`.
Realtime deve estar habilitado para a tabela `kv`.

## Regras para o agente
- NÃO altere a lógica do jogo em `MagnataBrasil.jsx` a menos que explicitamente pedido.
- NÃO commite segredos. As chaves do Supabase vão nas env vars da Vercel, nunca no código.
- Antes de deploy, rode `npm install` e `npm run build` e garanta build verde.
- O `.env` está no `.gitignore` — mantenha assim.
- Comandos de deploy/rede exigem aprovação do usuário — peça antes de executar.

## Como validar localmente
```
npm install
npm run build      # deve terminar sem erro
npm run preview    # serve o build para conferência
```
