// api/check-pix.js — Vercel Serverless Function
// Consulta o status de um pagamento PIX no Mercado Pago.

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { id } = req.query || {};
  if (!id) {
    return res.status(400).json({ error: "ID do pagamento ausente." });
  }

  const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    return res.status(500).json({ error: "Configuração do servidor incompleta (token MP ausente)." });
  }

  try {
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    if (!mpRes.ok) {
      const err = await mpRes.json().catch(() => ({}));
      console.error("[MP] Erro ao consultar pagamento:", err);
      return res.status(500).json({ error: "Erro ao consultar pagamento no Mercado Pago.", detail: err });
    }

    const data = await mpRes.json();
    return res.status(200).json({
      id: data.id,
      status: data.status, // "approved", "pending", "rejected", etc.
      status_detail: data.status_detail,
    });
  } catch (err) {
    console.error("[MP] Exceção ao consultar PIX:", err);
    return res.status(500).json({ error: "Erro interno ao consultar pagamento." });
  }
}
