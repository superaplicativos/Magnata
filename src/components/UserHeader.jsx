import { useState } from "react";

export default function UserHeader({ user, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  // Função para pegar iniciais do nome para avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Header fixo no topo */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(135deg, #0E2A21 0%, #1A4D3C 100%)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ fontSize: "24px" }}>🎲</div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            MAGNATA BRASIL
          </h1>
        </div>

        {/* User info + Menu */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "24px",
              padding: "6px 12px 6px 6px",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: user.avatar
                  ? `url(${user.avatar})`
                  : "linear-gradient(135deg, #F2C12E 0%, #E8B43E 100%)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#1A4D3C",
              }}
            >
              {!user.avatar && getInitials(user.name)}
            </div>

            {/* Nome do usuário */}
            <span
              style={{
                fontSize: "14px",
                fontWeight: "600",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.name}
            </span>

            {/* Badge de tipo */}
            {user.type === "guest" && (
              <span
                style={{
                  fontSize: "10px",
                  background: "rgba(255,165,0,0.3)",
                  color: "#FFB84D",
                  padding: "2px 6px",
                  borderRadius: "8px",
                  fontWeight: "600",
                }}
              >
                VISITANTE
              </span>
            )}

            {/* Ícone dropdown */}
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transition: "transform 0.2s",
                transform: showMenu ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Menu Dropdown */}
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                minWidth: "200px",
                background: "#FFFDF6",
                border: "1px solid #ddd",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                overflow: "hidden",
                zIndex: 10001,
              }}
            >
              {/* Info do usuário */}
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                  background: "linear-gradient(135deg, #F2F8F5 0%, #E8F3ED 100%)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                  Logado como
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A4D3C" }}>
                  {user.name}
                </div>
                {user.type !== "guest" && (
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>
                    {user.type === "google" ? "Google" : "Email"}
                  </div>
                )}
              </div>

              {/* Opções do menu */}
              <div style={{ padding: "8px 0" }}>
                {user.type === "guest" && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "#FFF3CD",
                      borderTop: "1px solid #FFE69C",
                      borderBottom: "1px solid #FFE69C",
                      fontSize: "11px",
                      color: "#856404",
                      lineHeight: 1.4,
                    }}
                  >
                    ⚠️ Visitantes não salvam progresso. Crie uma conta para aparecer no ranking!
                  </div>
                )}

                {/* BOTÕES DESABILITADOS TEMPORARIAMENTE - Evitar confusão do usuário
                <button
                  onClick={() => {
                    setShowMenu(false);
                    alert("Em desenvolvimento");
                  }}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "not-allowed",
                    fontSize: "14px",
                    color: "#999",
                    opacity: 0.5,
                  }}
                >
                  👤 Meu Perfil (em breve)
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    alert("Em desenvolvimento");
                  }}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "not-allowed",
                    fontSize: "14px",
                    color: "#999",
                    opacity: 0.5,
                  }}
                >
                  🏆 Ranking (em breve)
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    alert("Em desenvolvimento");
                  }}
                  disabled
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "not-allowed",
                    fontSize: "14px",
                    color: "#999",
                    opacity: 0.5,
                  }}
                >
                  📊 Meu Histórico (em breve)
                </button>
                */}

                <div
                  style={{
                    height: "1px",
                    background: "#eee",
                    margin: "8px 0",
                  }}
                />

                <button
                  onClick={async () => {
                    setShowMenu(false);
                    try {
                      await onLogout();
                    } catch (error) {
                      console.error("Erro ao sair:", error);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "14px",
                    color: "#dc3545",
                    fontWeight: "600",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "#fff5f5";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "none";
                  }}
                >
                  🚪 Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Espaçador para compensar o header fixo */}
      <div style={{ height: "60px" }} />

      {/* Overlay para fechar menu ao clicar fora */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
          }}
        />
      )}
    </>
  );
}
