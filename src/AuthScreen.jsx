import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("home"); // 'home', 'email-login', 'email-signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login como visitante (anônimo)
  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // Gera ID único para visitante
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const guestName = `Visitante_${Math.floor(Math.random() * 9999)}`;

      // Salva no localStorage
      localStorage.setItem("magnata_user_id", guestId);
      localStorage.setItem("magnata_user_name", guestName);
      localStorage.setItem("magnata_user_type", "guest");

      onAuthSuccess({
        id: guestId,
        name: guestName,
        type: "guest",
        avatar: null,
      });
    } catch (err) {
      setError("Erro ao entrar como visitante. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Login com Google OAuth
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;

      // O redirect acontece automaticamente
    } catch (err) {
      setError("Erro ao fazer login com Google. Verifique se o OAuth está configurado.");
      console.error(err);
      setLoading(false);
    }
  };

  // Signup com Email
  const handleEmailSignup = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email || !password || !displayName) {
        setError("Preencha todos os campos.");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (authError) throw authError;

      if (data.user) {
        // Criar registro na tabela users
        const { error: dbError } = await supabase.from("users").insert({
          email: data.user.email,
          display_name: displayName,
          auth_provider: "email",
          auth_uid: data.user.id,
          avatar_url: null,
        });

        if (dbError) console.error("Erro ao criar user no DB:", dbError);

        // Salvar no localStorage
        localStorage.setItem("magnata_user_id", data.user.id);
        localStorage.setItem("magnata_user_name", displayName);
        localStorage.setItem("magnata_user_type", "email");

        onAuthSuccess({
          id: data.user.id,
          name: displayName,
          type: "email",
          avatar: null,
        });
      }
    } catch (err) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Login com Email
  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email || !password) {
        setError("Preencha email e senha.");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        // Buscar dados do user na tabela users
        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("*")
          .eq("auth_uid", data.user.id)
          .single();

        if (dbError) {
          console.error("Erro ao buscar user:", dbError);
        }

        const userName = userData?.display_name || data.user.email?.split("@")[0] || "Jogador";

        // Salvar no localStorage
        localStorage.setItem("magnata_user_id", data.user.id);
        localStorage.setItem("magnata_user_name", userName);
        localStorage.setItem("magnata_user_type", "email");

        onAuthSuccess({
          id: data.user.id,
          name: userName,
          type: "email",
          avatar: userData?.avatar_url || null,
        });
      }
    } catch (err) {
      setError("Email ou senha incorretos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Tela Home (escolha de método de login)
  if (mode === "home") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        }}
      >
        <div className="w-full max-w-md">
          {/* Logo/Título */}
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
              O jogo de tabuleiro brasileiro que vai te fazer milionário!
            </p>
          </div>

          {/* Card de Login */}
          <div
            className="rounded-2xl p-6 shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
          >
            <h2 className="text-center text-xl font-bold mb-6" style={{ color: "#1A4D3C" }}>
              Entrar no Jogo
            </h2>

            {/* Botão Google */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mb-3 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              style={{
                background: "#fff",
                color: "#333",
                border: "2px solid #ddd",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                />
              </svg>
              Continuar com Google
            </button>

            {/* Botão Email */}
            <button
              onClick={() => setMode("email-login")}
              disabled={loading}
              className="w-full mb-3 py-3 px-4 rounded-xl font-bold transition-all"
              style={{
                background: "linear-gradient(135deg, #2E6BB8 0%, #16407E 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(46,107,184,0.3)",
              }}
            >
              Entrar com Email
            </button>

            {/* Botão Visitante */}
            <button
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold transition-all"
              style={{
                background: "transparent",
                color: "#1A4D3C",
                border: "2px solid #1A4D3C",
              }}
            >
              Jogar como Visitante
            </button>

            <p className="text-xs text-center mt-4 opacity-70" style={{ color: "#1A4D3C" }}>
              Visitantes não salvam progresso no ranking.
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-green-200 text-xs mt-6 opacity-75">
            Ao entrar, você concorda com nossos Termos de Uso
          </p>
        </div>
      </div>
    );
  }

  // Tela de Login com Email
  if (mode === "email-login") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        }}
      >
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-6 shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
          >
            <button
              onClick={() => setMode("home")}
              className="text-sm mb-4 opacity-70 hover:opacity-100"
              style={{ color: "#1A4D3C" }}
            >
              ← Voltar
            </button>

            <h2 className="text-center text-xl font-bold mb-6" style={{ color: "#1A4D3C" }}>
              Entrar com Email
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />

            <input
              type="password"
              placeholder="Sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />

            <button
              onClick={handleEmailLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold transition-all mb-3"
              style={{
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #2E6BB8 0%, #16407E 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(46,107,184,0.3)",
              }}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <button
              onClick={() => setMode("email-signup")}
              disabled={loading}
              className="w-full py-2 text-sm underline"
              style={{ color: "#1A4D3C" }}
            >
              Não tem conta? Criar nova conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de Signup com Email
  if (mode === "email-signup") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{
          background: "linear-gradient(180deg, #0E2A21 0%, #1A4D3C 100%)",
        }}
      >
        <div className="w-full max-w-md">
          <div
            className="rounded-2xl p-6 shadow-2xl"
            style={{
              background: "linear-gradient(160deg, #FFFDF6 0%, #F1E8D4 100%)",
            }}
          >
            <button
              onClick={() => setMode("email-login")}
              className="text-sm mb-4 opacity-70 hover:opacity-100"
              style={{ color: "#1A4D3C" }}
            >
              ← Voltar
            </button>

            <h2 className="text-center text-xl font-bold mb-6" style={{ color: "#1A4D3C" }}>
              Criar Conta
            </h2>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-700 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Seu nome no jogo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />

            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />

            <input
              type="password"
              placeholder="Crie uma senha (mín. 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#ddd" }}
            />

            <button
              onClick={handleEmailSignup}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold transition-all"
              style={{
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #46BC74 0%, #1E7A46 100%)",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(70,188,116,0.3)",
              }}
            >
              {loading ? "Criando conta..." : "Criar Conta"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
