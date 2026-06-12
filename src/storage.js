// Adaptador de armazenamento — substitui o window.storage do artifact do Claude.
// Interface usada pelo jogo: get(key, shared?) -> {value}|null ; set(key, value, shared?)
//
// MODO NUVEM (padrão): Supabase com REALTIME.
//   - As escritas vão para a tabela `kv` (REST).
//   - As leituras de OUTROS jogadores chegam INSTANTANEAMENTE por WebSocket (Realtime),
//     com um cache local atualizado em tempo real. O get() lê desse cache (rápido),
//     e cai no REST se ainda não tiver o valor.
//   Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (instruções no DEPLOY.md).
// MODO LOCAL (sem as chaves): localStorage, só no mesmo aparelho.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const CLOUD = !!(SUPABASE_URL && SUPABASE_KEY);

/* ---------------- MODO LOCAL ---------------- */
const localAdapter = {
  async get(key) {
    try {
      const v = localStorage.getItem(key);
      return v == null ? null : { value: v };
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
    return { value };
  },
};

/* ---------------- MODO NUVEM (Supabase + Realtime) ---------------- */
function makeCloudAdapter() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: { params: { eventsPerSecond: 20 } },
  });

  // cache local alimentado pelo Realtime: key -> value (sempre o mais recente)
  const cache = new Map();

  // ouve TODAS as mudanças na tabela kv e mantém o cache atualizado na hora
  supabase
    .channel("kv-stream")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "kv" },
      (payload) => {
        const row = payload.new || payload.old;
        if (row && row.key != null) {
          if (payload.eventType === "DELETE") cache.delete(row.key);
          else cache.set(row.key, row.value);
        }
      }
    )
    .subscribe();

  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  return {
    async get(key) {
      // 1) cache do Realtime (instantâneo)
      if (cache.has(key)) return { value: cache.get(key) };
      // 2) primeira leitura: busca via REST e popula o cache
      try {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/kv?key=eq.${encodeURIComponent(key)}&select=value`,
          { headers, cache: "no-store" }
        );
        if (!r.ok) return null;
        const rows = await r.json();
        if (rows.length) {
          cache.set(key, rows[0].value);
          return { value: rows[0].value };
        }
        return null;
      } catch {
        return null;
      }
    },
    async set(key, value) {
      cache.set(key, value); // reflete localmente na hora
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/kv`, {
          method: "POST",
          headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
        });
      } catch {}
      return { value };
    },
  };
}

const adapter = CLOUD ? makeCloudAdapter() : localAdapter;

if (typeof window !== "undefined") {
  window.storage = adapter;
  window.__MAGNATA_MODE__ = CLOUD ? "cloud-realtime" : "local";
  if (!CLOUD) {
    console.warn(
      "[Magnata] MODO LOCAL (so este aparelho). Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para multiplayer online. Veja DEPLOY.md."
    );
  }
}

export default adapter;
export const STORAGE_MODE = CLOUD ? "cloud-realtime" : "local";
