import { useState, useEffect } from "react";
import MagnataBrasil from "./MagnataBrasil.jsx";
import CreateRoomScreen from "./CreateRoomScreen.jsx";
import PublicRoomsScreen from "./PublicRoomsScreen.jsx";
import LeaderboardScreen from "./LeaderboardScreen.jsx";

export default function GameRouter({ userId, userName }) {
  const [currentScreen, setCurrentScreen] = useState("main-menu");
  const [gameCode, setGameCode] = useState(null);

  // Navegação para criar sala
  const handleCreateRoom = () => {
    setCurrentScreen("create-room");
  };

  // Navegação para salas públicas
  const handlePublicRooms = () => {
    setCurrentScreen("public-rooms");
  };

  // Navegação para ranking
  const handleLeaderboard = () => {
    setCurrentScreen("leaderboard");
  };

  // Callback após criar sala - vai para o lobby do jogo
  const handleRoomCreated = (roomCode, roomData) => {
    console.log("🎲 Sala criada, navegando para jogo. Código:", roomCode);
    setGameCode(roomCode);
    setCurrentScreen("game");
  };

  // Callback para entrar em sala pública
  const handleJoinRoom = (roomCode, password) => {
    setGameCode(roomCode);
    setCurrentScreen("game");
  };

  // Voltar ao menu principal
  const handleBackToMenu = () => {
    setGameCode(null);
    setCurrentScreen("main-menu");
  };

  // Menu Principal
  if (currentScreen === "main-menu") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
          paddingTop: "80px", // Compensar UserHeader
        }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1
              className="text-5xl font-bold mb-2"
              style={{
                background: "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "0 4px 12px rgba(242,193,46,0.3)",
              }}
            >
              MAGNATA BRASIL
            </h1>
            <p className="text-green-200 text-sm opacity-90">
              O jogo de tabuleiro que te faz milionário!
            </p>
          </div>

          {/* Menu de Opções */}
          <div
            className="rounded-2xl p-6 shadow-2xl space-y-3"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
          >
            <button
              onClick={handleCreateRoom}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(70,188,116,0.3)",
              }}
            >
              🎲 Criar Nova Sala
            </button>

            <button
              onClick={handlePublicRooms}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #2E6BB8 0%, #16407E 100%)",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(46,107,184,0.3)",
              }}
            >
              🌐 Salas Públicas
            </button>

            <button
              onClick={() => setCurrentScreen("game")}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
                color: "#1A4D3C",
                boxShadow: "0 4px 16px rgba(242,193,46,0.3)",
              }}
            >
              🔑 Entrar com Código
            </button>

            <button
              onClick={handleLeaderboard}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #E8B43E 0%, #C99A2E 100%)",
                color: "#1A4D3C",
                boxShadow: "0 4px 16px rgba(232,180,62,0.3)",
              }}
            >
              🏆 Ranking
            </button>
          </div>

          {/* Informação do Usuário */}
          <div className="mt-6 text-center">
            <p className="text-green-200 text-sm opacity-75">
              Logado como: <span className="font-semibold">{userName}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Criar Sala
  if (currentScreen === "create-room") {
    return (
      <CreateRoomScreen
        userId={userId}
        userName={userName}
        onBack={handleBackToMenu}
        onRoomCreated={handleRoomCreated}
      />
    );
  }

  // Tela de Salas Públicas
  if (currentScreen === "public-rooms") {
    return (
      <PublicRoomsScreen userId={userId} userName={userName} onBack={handleBackToMenu} onJoinRoom={handleJoinRoom} />
    );
  }

  // Tela de Ranking
  if (currentScreen === "leaderboard") {
    return (
      <LeaderboardScreen userId={userId} onBack={handleBackToMenu} />
    );
  }

  // Tela do Jogo (MagnataBrasil original)
  if (currentScreen === "game") {
    return (
      <MagnataBrasil
        userId={userId}
        userName={userName}
        initialGameCode={gameCode}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  return null;
}
