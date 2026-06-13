-- Magnata Brasil - Platform Database Schema
-- Migration 001: Autenticação, Salas Públicas, Ranking
-- Execute este script no Supabase SQL Editor

-- =====================================================
-- 1. TABELA DE USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  auth_provider TEXT, -- 'google', 'email', 'anonymous'
  auth_uid TEXT, -- ID do Supabase Auth (null se anônimo)
  created_at TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE PARTIDAS (Histórico)
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  room_name TEXT, -- Nome customizado da sala
  host_id UUID REFERENCES users(id),
  status TEXT NOT NULL, -- 'waiting', 'playing', 'ended'
  boost_enabled BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  password_hash TEXT, -- bcrypt hash se sala privada com senha
  max_players INTEGER DEFAULT 4,
  num_bots INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  winner_id UUID REFERENCES users(id),
  total_turns INTEGER DEFAULT 0
);

-- =====================================================
-- 3. TABELA DE PARTICIPAÇÕES (Quem jogou em qual partida)
-- =====================================================
CREATE TABLE IF NOT EXISTS match_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  player_name TEXT NOT NULL,
  token TEXT NOT NULL, -- 'hat', 'car', 'dog', 'ship', 'iron', 'boot'
  boost_tier TEXT, -- 'bronze', 'silver', 'gold', null
  final_money INTEGER DEFAULT 0,
  final_position INTEGER, -- 1 = vencedor, 2 = segundo, etc
  abandoned BOOLEAN DEFAULT FALSE,
  bankrupt BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  UNIQUE(match_id, user_id)
);

-- =====================================================
-- 4. TABELA DE RANKING (Agregado, atualizado após cada partida)
-- =====================================================
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- 'global', 'monthly', 'weekly'
  period_start DATE NOT NULL, -- Para filtrar por mês/semana
  total_matches INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  abandons INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.0, -- Calculado: wins / (wins + losses)
  total_money BIGINT DEFAULT 0, -- Soma do dinheiro final de todas partidas
  avg_money INTEGER DEFAULT 0, -- Média
  points INTEGER DEFAULT 0, -- Sistema de pontos: +10 vitória, +3 top3, -2 abandono
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period, period_start)
);

-- =====================================================
-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_public ON matches(is_public, status);
CREATE INDEX IF NOT EXISTS idx_matches_code ON matches(room_code);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard(period, period_start, points DESC);
CREATE INDEX IF NOT EXISTS idx_match_players_user ON match_players(user_id, match_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(auth_uid);

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- ========== POLICIES: USERS ==========

-- Todos podem ler users (para ver nomes/avatares)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Apenas o próprio usuário pode atualizar seus dados
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = auth_uid);

-- Qualquer um pode inserir (registro de novos usuários)
CREATE POLICY "Anyone can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- ========== POLICIES: MATCHES ==========

-- Partidas públicas são visíveis por todos
-- Partidas privadas só são visíveis pelo host e participantes
CREATE POLICY "Matches are viewable"
  ON matches FOR SELECT
  USING (
    is_public = true
    OR host_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::text)
  );

-- Host pode atualizar sua partida
CREATE POLICY "Host can update match"
  ON matches FOR UPDATE
  USING (host_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::text));

-- Todos podem inserir em matches (criar sala)
CREATE POLICY "Anyone can create match"
  ON matches FOR INSERT
  WITH CHECK (true);

-- Host pode deletar sala (se ainda em waiting)
CREATE POLICY "Host can delete match"
  ON matches FOR DELETE
  USING (
    host_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::text)
    AND status = 'waiting'
  );

-- ========== POLICIES: MATCH_PLAYERS ==========

-- Participações são visíveis por todos (histórico público)
CREATE POLICY "Match players viewable"
  ON match_players FOR SELECT
  USING (true);

-- Qualquer um pode inserir participação (entrar em sala)
CREATE POLICY "Anyone can insert match_players"
  ON match_players FOR INSERT
  WITH CHECK (true);

-- Jogador pode atualizar sua própria participação
CREATE POLICY "Players can update own participation"
  ON match_players FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_uid = auth.uid()::text));

-- ========== POLICIES: LEADERBOARD ==========

-- Leaderboard é visível por todos
CREATE POLICY "Leaderboard viewable"
  ON leaderboard FOR SELECT
  USING (true);

-- Sistema pode inserir/atualizar (via Edge Function)
CREATE POLICY "System can manage leaderboard"
  ON leaderboard FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para calcular win rate
CREATE OR REPLACE FUNCTION calculate_win_rate(wins_count INTEGER, losses_count INTEGER, abandons_count INTEGER)
RETURNS DECIMAL(5,2) AS $$
BEGIN
  IF (wins_count + losses_count) = 0 THEN
    RETURN 0.0;
  END IF;
  RETURN ROUND((wins_count::DECIMAL / (wins_count + losses_count)) * 100, 2);
END;
$$ LANGUAGE plpgsql;

-- Função para calcular pontos
CREATE OR REPLACE FUNCTION calculate_points(
  wins_count INTEGER,
  top3_count INTEGER,
  participation_count INTEGER,
  abandons_count INTEGER,
  fast_bankruptcies INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  RETURN
    (wins_count * 10) +           -- +10 por vitória
    (top3_count * 3) +             -- +3 por top 3 (2º ou 3º lugar)
    (participation_count * 1) -    -- +1 por participação
    (abandons_count * 2) -         -- -2 por abandono
    (fast_bankruptcies * 1);       -- -1 por falência rápida (<10 turnos)
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. HABILITAR REALTIME (para sincronização)
-- =====================================================

-- Já temos o kv com Realtime habilitado (supabase-setup.sql)
-- Adicionar Realtime nas novas tabelas para sincronização de salas públicas

ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE match_players;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Para verificar se tudo foi criado:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
