// Importa o adaptador de storage ANTES do jogo, para window.storage existir
// quando o componente montar.
import "./storage.js";
import { STORAGE_MODE } from "./storage.js";
import MagnataBrasil from "./MagnataBrasil.jsx";

export default function App() {
  return (
    <>
      <MagnataBrasil />
      {STORAGE_MODE === "local" && (
        <div
          style={{
            position: "fixed", bottom: 8, left: 8, zIndex: 9999,
            background: "rgba(180,80,0,.92)", color: "#fff", fontSize: 11,
            padding: "4px 9px", borderRadius: 8, fontFamily: "system-ui, sans-serif",
            maxWidth: 230, lineHeight: 1.3, boxShadow: "0 2px 8px rgba(0,0,0,.3)",
          }}
        >
          ⚠️ Modo local (só este aparelho). Configure o Supabase para multiplayer online.
        </div>
      )}
    </>
  );
}
