// dbHelpers.js - Funções auxiliares para operações do banco de dados

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ============================================
// MATCHES (Partidas)
// ============================================

export const createMatch = async (matchData) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("matches")
      .insert(matchData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao criar match:", error);
    return null;
  }
};

export const updateMatchStatus = async (matchId, status) => {
  if (!supabase) return null;

  try {
    const updates = { status };
    if (status === "playing") {
      updates.started_at = new Date().toISOString();
    } else if (status === "ended") {
      updates.ended_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("matches")
      .update(updates)
      .eq("id", matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao atualizar status do match:", error);
    return null;
  }
};

export const endMatch = async (matchId, winnerId, totalTurns) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("matches")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
        winner_id: winnerId,
        total_turns: totalTurns,
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao finalizar match:", error);
    return null;
  }
};

// ============================================
// MATCH_PLAYERS (Participações)
// ============================================

export const addMatchPlayer = async (matchId, userId, playerData) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("match_players")
      .insert({
        match_id: matchId,
        user_id: userId,
        player_name: playerData.name,
        token: playerData.token,
        boost_tier: playerData.boostTier || null,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao adicionar player ao match:", error);
    return null;
  }
};

export const updateMatchPlayer = async (matchPlayerId, updates) => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("match_players")
      .update(updates)
      .eq("id", matchPlayerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erro ao atualizar player do match:", error);
    return null;
  }
};

// ============================================
// LEADERBOARD (Ranking)
// ============================================

export const updateLeaderboard = async (userId, periodType, periodStart, stats) => {
  if (!supabase) return null;

  try {
    // Buscar entrada existente
    const { data: existing, error: fetchError } = await supabase
      .from("leaderboard")
      .select("*")
      .eq("user_id", userId)
      .eq("period", periodType)
      .eq("period_start", periodStart)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existing) {
      // Atualizar entrada existente
      const newTotalMatches = existing.total_matches + 1;
      const newWins = existing.wins + (stats.won ? 1 : 0);
      const newLosses = existing.losses + (stats.lost ? 1 : 0);
      const newAbandons = existing.abandons + (stats.abandoned ? 1 : 0);
      const newTotalMoney = existing.total_money + (stats.finalMoney || 0);
      const newAvgMoney = Math.floor(newTotalMoney / newTotalMatches);

      const newPoints =
        existing.points +
        (stats.won ? 10 : 0) +
        (stats.top3 ? 3 : 0) +
        1 - // Participação
        (stats.abandoned ? 2 : 0) -
        (stats.fastBankruptcy ? 1 : 0);

      const newWinRate =
        newWins + newLosses > 0 ? ((newWins / (newWins + newLosses)) * 100).toFixed(2) : 0;

      const { data, error } = await supabase
        .from("leaderboard")
        .update({
          total_matches: newTotalMatches,
          wins: newWins,
          losses: newLosses,
          abandons: newAbandons,
          win_rate: newWinRate,
          total_money: newTotalMoney,
          avg_money: newAvgMoney,
          points: newPoints,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Criar nova entrada
      const winRate = stats.won ? 100 : 0;
      const points =
        (stats.won ? 10 : 0) +
        (stats.top3 ? 3 : 0) +
        1 - // Participação
        (stats.abandoned ? 2 : 0) -
        (stats.fastBankruptcy ? 1 : 0);

      const { data, error } = await supabase
        .from("leaderboard")
        .insert({
          user_id: userId,
          period: periodType,
          period_start: periodStart,
          total_matches: 1,
          wins: stats.won ? 1 : 0,
          losses: stats.lost ? 1 : 0,
          abandons: stats.abandoned ? 1 : 0,
          win_rate: winRate,
          total_money: stats.finalMoney || 0,
          avg_money: stats.finalMoney || 0,
          points,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error("Erro ao atualizar leaderboard:", error);
    return null;
  }
};

// Atualizar todas as entradas de leaderboard (global, monthly, weekly) para um jogador
export const updateAllLeaderboards = async (userId, stats) => {
  if (!supabase || !userId || userId.startsWith("guest_")) {
    // Não atualizar ranking para visitantes
    return;
  }

  const now = new Date();

  // Global
  await updateLeaderboard(userId, "global", "1970-01-01", stats);

  // Monthly
  const monthlyStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  await updateLeaderboard(userId, "monthly", monthlyStart, stats);

  // Weekly (segunda-feira da semana)
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const weeklyStart = monday.toISOString().split("T")[0];
  await updateLeaderboard(userId, "weekly", weeklyStart, stats);
};
