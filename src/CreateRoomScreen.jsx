import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function CreateRoomScreen({ userId, userName, onBack, onRoomCreated }) {
  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState("");
  const [boostEnabled, setBoostEnabled] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [numBots, setNumBots] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Gera código único de 4 letras
  const generateRoomCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sem I, O, 0, 1 para evitar confusão
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Hash simples para senha (na produção usar bcrypt)
  const hashPassword = async (pwd) => {
    if (!pwd) return null;
    // Por simplicidade, vamos usar btoa (base64)
    // IMPORTANTE: Em produção, usar bcrypt no backend
    return btoa(pwd);
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      setError("");

      // Validações
      if (!roomName.trim()) {
        setError("Digite um nome para a sala.");
        setLoading(false);
        return;
      }

      if (!isPublic && !password) {
        setError("Salas privadas precisam de senha.");
        setLoading(false);
        return;
      }

      const roomCode = generateRoomCode();
      const passwordHash = await hashPassword(password);

      // Criar registro na tabela matches (se Supabase configurado)
      if (supabase) {
        console.log("🎲 Criando sala no Supabase...");
        console.log("Dados da sala:", {
          room_code: roomCode,
          room_name: roomName.trim(),
          host_id: userId,
          is_public: isPublic,
          max_players: maxPlayers,
        });

        const { data: matchData, error: matchError } = await supabase
          .from("matches")
          .insert({
            room_code: roomCode,
            room_name: roomName.trim(),
            host_id: userId.startsWith("guest_") ? null : userId, // Null se visitante
            status: "waiting",
            boost_enabled: boostEnabled,
            is_public: isPublic,
            password_hash: passwordHash,
            max_players: maxPlayers,
            num_bots: numBots,
          })
          .select()
          .single();

        if (matchError) {
          console.error("❌ Erro ao criar match:", matchError);
          console.error("Detalhes:", JSON.stringify(matchError, null, 2));
          setError("Erro ao criar sala no banco. Verifique se as tabelas existem.");
          setLoading(false);
          return;
        }

        console.log("✅ Sala criada no DB:", matchData);
        setSuccessMessage(`✅ Sala "${roomName.trim()}" criada com sucesso! Código: ${roomCode}`);

        // Adicionar o host como primeiro jogador na tabela match_players
        console.log("👤 Adicionando host como jogador...");
        const { error: playerError } = await supabase
          .from("match_players")
          .insert({
            match_id: matchData.id,
            user_id: userId,
            player_name: userName,
            token: "hat", // Token padrão inicial
          });

        if (playerError) {
          console.error("❌ Erro ao adicionar host como jogador:", playerError);
          console.error("Detalhes:", JSON.stringify(playerError, null, 2));
          setSuccessMessage(`⚠️ Sala criada mas houve erro ao adicionar jogador. Código: ${roomCode}`);
        } else {
          console.log("✅ Host adicionado como jogador na sala");
        }
      } else {
        console.warn("⚠️ Supabase não configurado - sala criada apenas localmente");
      }

      // Criar objeto do jogo no formato esperado pelo MagnataBrasil.jsx
      const gameData = {
        code: roomCode,
        name: roomName.trim(),
        host: userId,
        players: [],
        status: "waiting",
        boostEnabled,
        isPublic,
        maxPlayers,
        numBots,
        createdAt: Date.now(),
      };

      // Salvar no storage (kv table via window.storage)
      try {
        await window.storage.set(`magnata3:game:${roomCode}`, JSON.stringify(gameData), true);
      } catch (storageError) {
        console.error("Erro ao salvar no storage:", storageError);
      }

      // Callback para navegar para o lobby
      onRoomCreated(roomCode, gameData);
    } catch (err) {
      console.error("Erro ao criar sala:", err);
      setError("Erro inesperado ao criar sala. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="mb-4 text-green-200 text-sm hover:text-green-100"
        >
          ← Voltar
        </button>

        {/* Card do Formulário */}
        <div
          className="rounded-2xl p-6 shadow-2xl"
          style={{
            background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
          }}
        >
          <h2 className="text-center text-2xl font-bold mb-6" style={{ color: "#1A4D3C" }}>
            Criar Nova Sala
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 border border-green-300 text-green-700 text-sm font-bold">
              {successMessage}
            </div>
          )}

          {/* Nome da Sala */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
              Nome da Sala
            </label>
            <input
              type="text"
              placeholder="Ex: Partida Rápida"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />
          </div>

          {/* Visibilidade */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
              Visibilidade
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setIsPublic(true)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: isPublic
                    ? "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)"
                    : "#e9ecef",
                  color: isPublic ? "#fff" : "#6c757d",
                  border: isPublic ? "2px solid #1E7A46" : "2px solid #ddd",
                }}
              >
                🌐 Pública
              </button>
              <button
                onClick={() => setIsPublic(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: !isPublic
                    ? "linear-gradient(135deg, #2E6BB8 0%, #16407E 100%)"
                    : "#e9ecef",
                  color: !isPublic ? "#fff" : "#6c757d",
                  border: !isPublic ? "2px solid #16407E" : "2px solid #ddd",
                }}
              >
                🔒 Privada
              </button>
            </div>
            <p className="text-xs mt-2 opacity-70" style={{ color: "#1A4D3C" }}>
              {isPublic
                ? "Aparece na lista de salas públicas"
                : "Só pode entrar com código"}
            </p>
          </div>

          {/* Senha (só para salas privadas) */}
          {!isPublic && (
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
                Senha da Sala
              </label>
              <input
                type="password"
                placeholder="Digite uma senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: "#ddd" }}
              />
              <p className="text-xs mt-1 opacity-70" style={{ color: "#1A4D3C" }}>
                Obrigatório para salas privadas
              </p>
            </div>
          )}

          {/* Permitir Boosts */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
              Permitir Boosts
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setBoostEnabled(true)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: boostEnabled
                    ? "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)"
                    : "#e9ecef",
                  color: boostEnabled ? "#1A4D3C" : "#6c757d",
                  border: boostEnabled ? "2px solid #E8B43E" : "2px solid #ddd",
                }}
              >
                ⚡ SIM
              </button>
              <button
                onClick={() => setBoostEnabled(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all"
                style={{
                  background: !boostEnabled
                    ? "linear-gradient(135deg, #6c757d 0%, #495057 100%)"
                    : "#e9ecef",
                  color: !boostEnabled ? "#fff" : "#6c757d",
                  border: !boostEnabled ? "2px solid #495057" : "2px solid #ddd",
                }}
              >
                NÃO
              </button>
            </div>
            <p className="text-xs mt-2 opacity-70" style={{ color: "#1A4D3C" }}>
              Jogadores poderão comprar boost (Bronze, Prata, Ouro)
            </p>
          </div>

          {/* Número de Jogadores */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
              Número de Jogadores: {maxPlayers}
            </label>
            <input
              type="range"
              min="2"
              max="6"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs opacity-70" style={{ color: "#1A4D3C" }}>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
            </div>
          </div>

          {/* Número de Bots */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1A4D3C" }}>
              Bots para completar: {numBots}
            </label>
            <input
              type="range"
              min="0"
              max={Math.max(0, maxPlayers - 1)}
              value={numBots}
              onChange={(e) => setNumBots(parseInt(e.target.value))}
              className="w-full"
            />
            <p className="text-xs mt-1 opacity-70" style={{ color: "#1A4D3C" }}>
              Bots serão adicionados se não houver jogadores suficientes
            </p>
          </div>

          {/* Botão Criar */}
          <button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all"
            style={{
              background: loading
                ? "#ccc"
                : "linear-gradient(135deg, #0E2A21 0%, #1A4D3C 100%)",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(14,42,33,0.4)",
            }}
          >
            {loading ? "Criando Sala..." : "🎲 Criar Sala"}
          </button>
        </div>
      </div>
    </div>
  );
}
