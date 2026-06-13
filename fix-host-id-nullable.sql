-- CORREÇÃO DA TABELA MATCHES
-- Execute este script no SQL Editor do Supabase

-- 1. Permitir que host_id seja NULL (para salas criadas por visitantes)
ALTER TABLE public.matches
ALTER COLUMN host_id DROP NOT NULL;

-- 2. Adicionar coluna room_name se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='matches' AND column_name='room_name') THEN
    ALTER TABLE public.matches ADD COLUMN room_name TEXT NOT NULL DEFAULT 'Sala sem nome';
  END IF;
END $$;

-- 3. Adicionar coluna num_bots se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='matches' AND column_name='num_bots') THEN
    ALTER TABLE public.matches ADD COLUMN num_bots INTEGER DEFAULT 0;
  END IF;
END $$;

-- 4. Adicionar coluna password_hash se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='matches' AND column_name='password_hash') THEN
    ALTER TABLE public.matches ADD COLUMN password_hash TEXT;
  END IF;
END $$;

-- 5. Adicionar coluna boost_enabled se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='matches' AND column_name='boost_enabled') THEN
    ALTER TABLE public.matches ADD COLUMN boost_enabled BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Adicionar comentários explicativos
COMMENT ON COLUMN public.matches.host_id IS 'ID do usuário host (NULL para visitantes)';
COMMENT ON COLUMN public.matches.room_name IS 'Nome da sala definido pelo criador';
COMMENT ON COLUMN public.matches.num_bots IS 'Número de bots para completar a partida';
COMMENT ON COLUMN public.matches.password_hash IS 'Hash da senha para salas privadas (NULL se pública)';
COMMENT ON COLUMN public.matches.boost_enabled IS 'Se boosts estão habilitados nesta partida';
