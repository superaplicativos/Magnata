-- ============================================
-- SCHEMA DO MAGNATA BRASIL
-- ============================================
-- Este arquivo cria todas as tabelas necessárias para o jogo funcionar
-- com multiplayer online através do Supabase.

-- ============================================
-- 1. TABELA: users
-- Usuários autenticados (Google, Discord, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  auth_provider TEXT DEFAULT 'email',
  auth_uid TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar por auth_uid
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON public.users(auth_uid);

-- ============================================
-- 2. TABELA: matches
-- Partidas do jogo
-- ============================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT UNIQUE NOT NULL,
  room_name TEXT NOT NULL,
  host_id TEXT, -- NULL para visitantes
  status TEXT DEFAULT 'waiting', -- waiting, playing, ended
  max_players INTEGER DEFAULT 4,
  num_bots INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  password_hash TEXT, -- Hash da senha para salas privadas
  boost_enabled BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner_id TEXT,
  total_turns INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar partidas públicas ativas
CREATE INDEX IF NOT EXISTS idx_matches_public_status ON public.matches(is_public, status);
CREATE INDEX IF NOT EXISTS idx_matches_room_code ON public.matches(room_code);

-- ============================================
-- 3. TABELA: match_players
-- Jogadores participando de cada partida
-- ============================================
CREATE TABLE IF NOT EXISTS public.match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  token TEXT NOT NULL,
  boost_tier INTEGER,
  final_money INTEGER DEFAULT 0,
  final_position INTEGER,
  is_bankrupt BOOLEAN DEFAULT false,
  abandoned BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar jogadores de uma partida
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON public.match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_user_id ON public.match_players(user_id);

-- ============================================
-- 4. TABELA: leaderboard
-- Ranking de jogadores (global, mensal, semanal)
-- ============================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  period TEXT NOT NULL, -- 'global', 'monthly', 'weekly'
  period_start DATE NOT NULL,
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  abandons INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_money BIGINT DEFAULT 0,
  avg_money INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- Índices para ranking
CREATE INDEX IF NOT EXISTS idx_leaderboard_period_points ON public.leaderboard(period, points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_period ON public.leaderboard(user_id, period);

-- ============================================
-- 5. TABELA: kv
-- Key-Value store para dados compartilhados em tempo real
-- (estado do jogo, chat, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.kv (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para ordenar por atualização
CREATE INDEX IF NOT EXISTS idx_kv_updated_at ON public.kv(updated_at DESC);

-- ============================================
-- PERMISSÕES (Row Level Security - RLS)
-- ============================================

-- Ativar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv ENABLE ROW LEVEL SECURITY;

-- Políticas para users (todos podem ler, só o próprio pode atualizar)
DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own record" ON public.users;
CREATE POLICY "Users can insert their own record" ON public.users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own record" ON public.users;
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth_uid = auth.uid()::text);

-- Políticas para matches (todos podem ler públicas, criar e atualizar)
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create matches" ON public.matches;
CREATE POLICY "Anyone can create matches" ON public.matches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update matches" ON public.matches;
CREATE POLICY "Anyone can update matches" ON public.matches FOR UPDATE USING (true);

-- Políticas para match_players (todos podem ler e escrever)
DROP POLICY IF EXISTS "Match players are viewable by everyone" ON public.match_players;
CREATE POLICY "Match players are viewable by everyone" ON public.match_players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert match players" ON public.match_players;
CREATE POLICY "Anyone can insert match players" ON public.match_players FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update match players" ON public.match_players;
CREATE POLICY "Anyone can update match players" ON public.match_players FOR UPDATE USING (true);

-- Políticas para leaderboard (todos podem ler, qualquer um pode inserir/atualizar)
DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.leaderboard;
CREATE POLICY "Leaderboard is viewable by everyone" ON public.leaderboard FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert leaderboard entries" ON public.leaderboard;
CREATE POLICY "Anyone can insert leaderboard entries" ON public.leaderboard FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update leaderboard entries" ON public.leaderboard;
CREATE POLICY "Anyone can update leaderboard entries" ON public.leaderboard FOR UPDATE USING (true);

-- Políticas para kv (todos podem ler e escrever - cache compartilhado)
DROP POLICY IF EXISTS "KV is viewable by everyone" ON public.kv;
CREATE POLICY "KV is viewable by everyone" ON public.kv FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert kv" ON public.kv;
CREATE POLICY "Anyone can insert kv" ON public.kv FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update kv" ON public.kv;
CREATE POLICY "Anyone can update kv" ON public.kv FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can delete kv" ON public.kv;
CREATE POLICY "Anyone can delete kv" ON public.kv FOR DELETE USING (true);

-- ============================================
-- REALTIME (Permitir atualizações em tempo real)
-- ============================================

-- Publicar todas as tabelas para Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;
ALTER PUBLICATION supabase_realtime ADD TABLE public.kv;

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON public.matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON public.leaderboard;
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_kv_updated_at ON public.kv;
CREATE TRIGGER update_kv_updated_at BEFORE UPDATE ON public.kv FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CONCLUÍDO!
-- ============================================
-- Todas as tabelas foram criadas com sucesso.
-- O jogo agora pode funcionar em modo multiplayer online!
