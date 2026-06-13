import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function PublicRoomsScreen({ onBack, onJoinRoom }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Carregar salas públicas
    loadPublicRooms();

    // Subscribe para atualizações em tempo real
    const channel = supabase
      .channel("public-rooms")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: "is_public=eq.true",
        },
        (payload) => {
          console.log("Realtime update:", payload);
          loadPublicRooms(); // Recarregar lista quando houver mudanças
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadPublicRooms = async () => {
    try {
      console.log("🔍 Buscando salas públicas...");
      console.log("Supabase conectado:", !!supabase);

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          host:host_id (
            display_name,
            avatar_url
          ),
          players:match_players (
            id,
            user_id,
            player_name
          )
        `)
        .eq("is_public", true)
        .in("status", ["waiting", "playing"])
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao carregar salas:", error);
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2));
        setRooms([]);
      } else {
        console.log("✅ Salas carregadas:", data);
        console.log("Total de salas encontradas:", data?.length || 0);
        setRooms(data || []);
      }
    } catch (err) {
      console.error("❌ Erro inesperado ao carregar salas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (room) => {
    // Se tem senha, mostrar modal
    if (room.password_hash) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
      setPasswordInput("");
      setPasswordError("");
    } else {
      // Entrar diretamente
      onJoinRoom(room.room_code, null);
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput) {
      setPasswordError("Digite a senha.");
      return;
    }

    // Verificar senha (hash simples com btoa)
    const inputHash = btoa(passwordInput);
    if (inputHash === selectedRoom.password_hash) {
      setShowPasswordModal(false);
      onJoinRoom(selectedRoom.room_code, passwordInput);
    } else {
      setPasswordError("Senha incorreta.");
    }
  };

  const getStatusColor = (room) => {
    const playerCount = room.players?.length || 0;
    const maxPlayers = room.max_players || 4;

    if (room.status === "playing") return "🔴"; // Em jogo
    if (playerCount >= maxPlayers) return "🔴"; // Cheia
    if (playerCount >= maxPlayers - 1) return "🟡"; // Quase cheia
    return "🟢"; // Disponível
  };

  const getStatusText = (room) => {
    const playerCount = room.players?.length || 0;
    const maxPlayers = room.max_players || 4;

    if (room.status === "playing") return "EM JOGO";
    if (playerCount >= maxPlayers) return "CHEIA";
    return "AGUARDANDO";
  };

  const canJoin = (room) => {
    const playerCount = room.players?.length || 0;
    const maxPlayers = room.max_players || 4;
    return room.status === "waiting" && playerCount < maxPlayers;
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Agora";
    if (minutes === 1) return "1 min atrás";
    if (minutes < 60) return `${minutes} min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1h atrás";
    return `${hours}h atrás`;
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.room_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.host?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        }}
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🎲</div>
          <p className="text-green-200">Carregando salas públicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        paddingTop: "80px", // Compensar header
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
            SALAS PÚBLICAS
          </h2>
          <p className="text-green-200 text-sm opacity-90">
            Encontre partidas para jogar com outros jogadores
          </p>
        </div>

        {/* Busca */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar sala por nome, código ou host..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2"
            style={{ borderColor: "#ddd" }}
          />
        </div>

        {/* Lista de Salas */}
        {!supabase && (
          <div className="mb-4 p-4 rounded-xl bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm">
            ⚠️ Supabase não configurado. Salas públicas requerem configuração do banco de dados.
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-4xl mb-3">🎲</div>
            <p className="text-green-200 text-lg mb-2">Nenhuma sala pública no momento</p>
            <p className="text-green-300 text-sm opacity-70">
              Seja o primeiro a criar uma sala!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map((room) => {
              const playerCount = room.players?.length || 0;
              const maxPlayers = room.max_players || 4;
              const statusColor = getStatusColor(room);
              const statusText = getStatusText(room);
              const joinable = canJoin(room);

              return (
                <div
                  key={room.id}
                  className="rounded-2xl p-4 shadow-lg transition-all hover:shadow-xl"
                  style={{
                    background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info da Sala */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{statusColor}</span>
                        <h3 className="text-lg font-bold" style={{ color: "#1A4D3C" }}>
                          {room.room_name || "Sala sem nome"}
                        </h3>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            background: "#e9ecef",
                            color: "#495057",
                            fontFamily: "monospace",
                            fontWeight: "bold",
                          }}
                        >
                          {room.room_code}
                        </span>
                        {room.password_hash && <span>🔒</span>}
                      </div>

                      <div className="flex items-center gap-3 text-sm mb-2 opacity-80" style={{ color: "#1A4D3C" }}>
                        <span>
                          👥 {playerCount}/{maxPlayers}
                        </span>
                        <span>•</span>
                        <span>{room.boost_enabled ? "⚡ Boost ativado" : "Sem boost"}</span>
                        <span>•</span>
                        <span>{getTimeAgo(room.created_at)}</span>
                      </div>

                      {room.host && (
                        <div className="text-xs opacity-70" style={{ color: "#1A4D3C" }}>
                          Host: {room.host.display_name || "Anônimo"}
                        </div>
                      )}
                    </div>

                    {/* Botão Entrar */}
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          background:
                            statusText === "AGUARDANDO"
                              ? "#d1f4e0"
                              : statusText === "CHEIA" || statusText === "EM JOGO"
                              ? "#f8d7da"
                              : "#fff3cd",
                          color:
                            statusText === "AGUARDANDO"
                              ? "#155724"
                              : statusText === "CHEIA" || statusText === "EM JOGO"
                              ? "#721c24"
                              : "#856404",
                        }}
                      >
                        {statusText}
                      </span>

                      <button
                        onClick={() => handleJoinRoom(room)}
                        disabled={!joinable}
                        className="px-6 py-2 rounded-xl font-bold text-sm transition-all"
                        style={{
                          background: joinable
                            ? "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)"
                            : "#ccc",
                          color: "#fff",
                          cursor: joinable ? "pointer" : "not-allowed",
                          opacity: joinable ? 1 : 0.6,
                        }}
                      >
                        {room.password_hash ? "🔒 ENTRAR" : "ENTRAR"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Senha */}
      {showPasswordModal && selectedRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowPasswordModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4" style={{ color: "#1A4D3C" }}>
              🔒 Sala Privada
            </h3>

            <p className="text-sm mb-4 opacity-80" style={{ color: "#1A4D3C" }}>
              A sala "{selectedRoom.room_name}" requer senha.
            </p>

            {passwordError && (
              <div className="mb-3 p-2 rounded bg-red-100 border border-red-300 text-red-700 text-sm">
                {passwordError}
              </div>
            )}

            <input
              type="password"
              placeholder="Digite a senha"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePasswordSubmit();
              }}
              className="w-full px-4 py-3 rounded-xl border-2 mb-4"
              style={{ borderColor: "#ddd" }}
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-2 px-4 rounded-xl font-semibold"
                style={{
                  background: "#e9ecef",
                  color: "#495057",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 py-2 px-4 rounded-xl font-semibold"
                style={{
                  background: "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)",
                  color: "#fff",
                }}
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
