import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function LeaderboardScreen({ userId, onBack }) {
  const [period, setPeriod] = useState("global"); // 'global', 'monthly', 'weekly'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  const loadLeaderboard = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Calcular period_start baseado no período selecionado
      let periodStart;
      const now = new Date();

      if (period === "global") {
        periodStart = "1970-01-01";
      } else if (period === "monthly") {
        periodStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      } else if (period === "weekly") {
        // Pegar a segunda-feira da semana atual
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        periodStart = monday.toISOString().split("T")[0];
      }

      const { data, error } = await supabase
        .from("leaderboard")
        .select(`
          *,
          user:user_id (
            display_name,
            avatar_url
          )
        `)
        .eq("period", period)
        .eq("period_start", periodStart)
        .order("points", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Erro ao carregar ranking:", error);
        setLeaderboard([]);
      } else {
        setLeaderboard(data || []);

        // Encontrar posição do usuário atual
        if (userId) {
          const userIndex = data?.findIndex((entry) => entry.user_id === userId);
          if (userIndex !== undefined && userIndex >= 0) {
            setUserRank({
              position: userIndex + 1,
              data: data[userIndex],
            });
          } else {
            setUserRank(null);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao carregar ranking:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const getRankEmoji = (position) => {
    if (position === 1) return "👑";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return "";
  };

  const getPeriodLabel = () => {
    if (period === "global") return "Todos os Tempos";
    if (period === "monthly") return "Este Mês";
    if (period === "weekly") return "Esta Semana";
    return "";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🏆</div>
          <p className="text-green-200">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        paddingTop: "80px",
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button onClick={onBack} className="text-green-200 text-sm hover:text-green-100 mb-4">
            ← Voltar
          </button>

          <h2
            className="text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🏆 RANKING
          </h2>
          <p className="text-green-200 text-sm opacity-90">
            Os melhores jogadores de Magnata Brasil
          </p>
        </div>

        {/* Tabs de Período */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {["global", "monthly", "weekly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all"
              style={{
                background:
                  period === p
                    ? "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)"
                    : "rgba(255,255,255,0.1)",
                color: period === p ? "#1A4D3C" : "#fff",
                border: period === p ? "2px solid #E8B43E" : "2px solid transparent",
              }}
            >
              {p === "global" ? "🌍 Global" : p === "monthly" ? "📅 Mensal" : "⏰ Semanal"}
            </button>
          ))}
        </div>

        {/* User Rank (se estiver no ranking) */}
        {userRank && (
          <div
            className="mb-4 p-4 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)",
              color: "#fff",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-90 mb-1">Sua Posição</div>
                <div className="text-2xl font-bold">#{userRank.position}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Pontos</div>
                <div className="text-2xl font-bold">{userRank.data.points}</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90 mb-1">Vitórias</div>
                <div className="text-2xl font-bold">{userRank.data.wins}</div>
              </div>
            </div>
          </div>
        )}

        {/* Aviso se não configurado */}
        {!supabase && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm">
            ⚠️ Supabase não configurado. O ranking requer configuração do banco de dados.
          </div>
        )}

        {/* Tabela de Ranking */}
        {leaderboard.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-green-200 text-lg mb-2">Ranking vazio</p>
            <p className="text-green-300 text-sm opacity-70">
              Seja o primeiro a jogar uma partida completa!
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
          >
            {/* Header da Tabela */}
            <div
              className="grid grid-cols-12 gap-2 p-4 font-bold text-sm"
              style={{
                background: "linear-gradient(135deg, #0E2A21 0%, #1A4D3C 100%)",
                color: "#F2C12E",
              }}
            >
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-4">Jogador</div>
              <div className="col-span-2 text-center">V/D</div>
              <div className="col-span-2 text-center">WR%</div>
              <div className="col-span-2 text-center">Média</div>
              <div className="col-span-1 text-right">Pts</div>
            </div>

            {/* Linhas da Tabela */}
            <div className="divide-y divide-gray-200">
              {leaderboard.map((entry, index) => {
                const isCurrentUser = entry.user_id === userId;
                const position = index + 1;

                return (
                  <div
                    key={entry.id}
                    className="grid grid-cols-12 gap-2 p-4 items-center transition-all hover:bg-gray-50"
                    style={{
                      background: isCurrentUser ? "#e8f5e9" : "transparent",
                      fontWeight: isCurrentUser ? "bold" : "normal",
                    }}
                  >
                    {/* Posição */}
                    <div className="col-span-1 text-center text-lg font-bold" style={{ color: "#1A4D3C" }}>
                      {getRankEmoji(position)}
                      {position}
                    </div>

                    {/* Jogador */}
                    <div className="col-span-4 flex items-center gap-2">
                      {entry.user?.avatar_url ? (
                        <img
                          src={entry.user.avatar_url}
                          alt={entry.user.display_name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{
                            background: "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
                            color: "#1A4D3C",
                          }}
                        >
                          {entry.user?.display_name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                      <span style={{ color: "#1A4D3C" }}>
                        {entry.user?.display_name || "Jogador"}
                      </span>
                    </div>

                    {/* V/D */}
                    <div className="col-span-2 text-center text-sm" style={{ color: "#1A4D3C" }}>
                      {entry.wins}/{entry.losses}
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-2 text-center text-sm font-semibold" style={{ color: "#1E7A46" }}>
                      {entry.win_rate?.toFixed(1) || "0.0"}%
                    </div>

                    {/* Média de Dinheiro */}
                    <div className="col-span-2 text-center text-sm" style={{ color: "#1A4D3C" }}>
                      R$ {formatMoney(entry.avg_money || 0)}
                    </div>

                    {/* Pontos */}
                    <div className="col-span-1 text-right text-lg font-bold" style={{ color: "#E8B43E" }}>
                      {entry.points}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Legenda de Pontos */}
        <div
          className="mt-6 p-4 rounded-xl text-sm"
          style={{
            background: "rgba(255,255,255,0.05)",
            color: "#F2C12E",
          }}
        >
          <div className="font-bold mb-2">Sistema de Pontos:</div>
          <div className="grid grid-cols-2 gap-2 text-xs opacity-90">
            <div>✅ Vitória (1º lugar): +10 pontos</div>
            <div>🥉 Top 3 (2º ou 3º): +3 pontos</div>
            <div>🎮 Participação: +1 ponto</div>
            <div>❌ Abandono: -2 pontos</div>
          </div>
        </div>
      </div>
    </div>
  );
}
