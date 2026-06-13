// Importa o adaptador de storage ANTES do jogo, para window.storage existir
// quando o componente montar.
import { useState, useEffect } from "react";
import "./storage.js";
import { STORAGE_MODE } from "./storage.js";
import GameRouter from "./GameRouter.jsx";
import AuthScreen from "./AuthScreen.jsx";
import UserHeader from "./components/UserHeader.jsx";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifica autenticação ao montar
  useEffect(() => {
    checkAuth();

    // Listener para mudanças de auth (OAuth callback)
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          await handleOAuthCallback(session.user);
        } else if (event === "SIGNED_OUT") {
          handleLogout();
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const checkAuth = async () => {
    try {
      // Tentar ler do localStorage primeiro
      const savedUserId = localStorage.getItem("magnata_user_id");
      const savedUserName = localStorage.getItem("magnata_user_name");
      const savedUserType = localStorage.getItem("magnata_user_type");

      if (savedUserId && savedUserName) {
        setUser({
          id: savedUserId,
          name: savedUserName,
          type: savedUserType || "guest",
          avatar: null,
        });
        setLoading(false);
        return;
      }

      // Se não tiver no localStorage, verificar sessão do Supabase
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await handleOAuthCallback(session.user);
        }
      }
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (authUser) => {
    try {
      // Buscar dados do user na tabela users
      let { data: userData, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_uid", authUser.id)
        .single();

      // Se não existir, criar
      if (fetchError || !userData) {
        const displayName =
          authUser.user_metadata?.display_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "Jogador";

        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            email: authUser.email,
            display_name: displayName,
            auth_provider: authUser.app_metadata?.provider || "email",
            auth_uid: authUser.id,
            avatar_url: authUser.user_metadata?.avatar_url || null,
          })
          .select()
          .single();

        if (!insertError && newUser) {
          userData = newUser;
        }
      }

      const userName = userData?.display_name || authUser.email?.split("@")[0] || "Jogador";
      const userAvatar = userData?.avatar_url || authUser.user_metadata?.avatar_url || null;

      // Salvar no localStorage
      localStorage.setItem("magnata_user_id", authUser.id);
      localStorage.setItem("magnata_user_name", userName);
      localStorage.setItem("magnata_user_type", userData?.auth_provider || "email");

      setUser({
        id: authUser.id,
        name: userName,
        type: userData?.auth_provider || "email",
        avatar: userAvatar,
      });
    } catch (error) {
      console.error("Erro ao processar OAuth callback:", error);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      // Encerrar salas onde o usuário é host ou criador antes de sair
      if (supabase && user?.id) {
        console.log("🔴 Encerrando salas abertas pelo usuário...");

        // 1. Para usuários registrados: encerrar salas onde é host
        if (!user.id.startsWith("guest_")) {
          const { error: updateError } = await supabase
            .from("matches")
            .update({
              status: "ended",
              ended_at: new Date().toISOString()
            })
            .eq("host_id", user.id)
            .in("status", ["waiting", "playing"]);

          if (updateError) {
            console.error("Erro ao encerrar salas:", updateError);
          } else {
            console.log("✅ Salas de usuário registrado encerradas");
          }
        }

        // 2. Para visitantes: buscar salas criadas por ele (como único jogador)
        // e marcar como ended
        const { data: playerMatches } = await supabase
          .from("match_players")
          .select("match_id")
          .eq("user_id", user.id);

        if (playerMatches && playerMatches.length > 0) {
          const matchIds = playerMatches.map(pm => pm.match_id);

          const { error: visitorUpdateError } = await supabase
            .from("matches")
            .update({
              status: "ended",
              ended_at: new Date().toISOString()
            })
            .in("id", matchIds)
            .in("status", ["waiting", "playing"])
            .is("host_id", null); // Só salas de visitante

          if (!visitorUpdateError) {
            console.log("✅ Salas de visitante encerradas");
          }
        }
      }

      // Limpar sessão do Supabase se existir
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Limpar localStorage
      localStorage.removeItem("magnata_user_id");
      localStorage.removeItem("magnata_user_name");
      localStorage.removeItem("magnata_user_type");

      // Resetar estado do usuário
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      // Mesmo com erro, deslogar o usuário localmente
      localStorage.clear();
      setUser(null);
    }
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
          <div className="text-4xl mb-4">🎲</div>
          <p className="text-green-200">Carregando Magnata Brasil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <>
      <UserHeader user={user} onLogout={handleLogout} />
      <GameRouter userId={user.id} userName={user.name} />
      {STORAGE_MODE === "local" && (
        <div
          style={{
            position: "fixed",
            bottom: 8,
            left: 8,
            zIndex: 9999,
            background: "rgba(180,80,0,.92)",
            color: "#fff",
            fontSize: 11,
            padding: "4px 9px",
            borderRadius: 8,
            fontFamily: "system-ui, sans-serif",
            maxWidth: 230,
            lineHeight: 1.3,
            boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          }}
        >
          ⚠️ Modo local (só este aparelho). Configure o Supabase para multiplayer online.
        </div>
      )}
    </>
  );
}
