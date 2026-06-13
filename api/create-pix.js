// api/create-pix.js — Vercel Serverless Function
// Cria um pagamento PIX via Mercado Pago para compra de boost no lobby.
// O Access Token fica seguro aqui no servidor — nunca vai ao navegador.

const BOOSTS = {
  bronze: { amount: 0.10, description: "Boost BRONZE — Magnata Brasil (+R$5.000 no jogo)", bonus: 5000 },
  prata:  { amount: 0.20, description: "Boost PRATA — Magnata Brasil (+R$10.000 no jogo)", bonus: 10000 },
  ouro:   { amount: 0.30, description: "Boost OURO — Magnata Brasil (+R$20.000 no jogo)", bonus: 20000 },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { boost, playerName, playerId } = req.body || {};
  const tier = BOOSTS[boost];
  if (!tier) {
    return res.status(400).json({ error: "Boost inválido. Use: bronze, prata ou ouro." });
  }

  const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: "Configuração do servidor incompleta (token MP ausente)." });
  }

  try {
    const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `magnata-${playerId}-${boost}-${Date.now()}`,
      },
      body: JSON.stringify({
        transaction_amount: tier.amount,
        description: tier.description,
        payment_method_id: "pix",
        payer: {
          // MP exige e-mail no payer; usamos um fictício baseado no ID
          email: `jogador_${(playerId || "anonimo").replace(/[^a-z0-9]/gi, "")}@magnatabrasil.app`,
          first_name: (playerName || "Jogador").slice(0, 30),
        },
      }),
    });

    if (!mpRes.ok) {
      const err = await mpRes.json().catch(() => ({}));
      console.error("[MP] Erro ao criar pagamento:", err);
      return res.status(500).json({ error: "Erro ao criar pagamento PIX no Mercado Pago.", detail: err });
    }

    const data = await mpRes.json();
    const txData = data.point_of_interaction?.transaction_data;

    return res.status(200).json({
      id: data.id,
      status: data.status,                     // "pending"
      qr_code: txData?.qr_code,               // código copia e cola
      qr_code_base64: txData?.qr_code_base64, // imagem do QR Code
      bonus: tier.bonus,
      amount: tier.amount,
      boost,
    });
  } catch (err) {
    console.error("[MP] Exceção ao criar PIX:", err);
    return res.status(500).json({ error: "Erro interno ao criar pagamento." });
  }
}
