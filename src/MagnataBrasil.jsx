import React, { useState, useEffect, useRef } from "react";

/* ============================================================
   MAGNATA BRASIL — PREMIUM
   Tabuleiro ilustrado · trocas com contraproposta · construção
   em 8 níveis · cartas animadas · banco e agiota · hipoteca ·
   chat com emojis e mensagens privadas · multiplayer + IA
   ============================================================ */

/* ---------- DADOS DO TABULEIRO ---------- */
const GROUPS = {
  marrom:   { c: "#9C6644", label: "Bahia Histórica" },
  ciano:    { c: "#38B6D9", label: "Litoral Nordeste" },
  rosa:     { c: "#E85D9C", label: "Centro-Oeste Natural" },
  laranja:  { c: "#F58A1F", label: "Minas Gerais" },
  vermelho: { c: "#E03A3A", label: "Região Sul" },
  amarelo:  { c: "#F2C12E", label: "Paraísos Tropicais" },
  verde:    { c: "#2E9E5B", label: "Rio de Janeiro" },
  azul:     { c: "#2456C4", label: "Cartões-Postais" },
};

const BOARD = [
  { t: "go", name: "Partida", short: "PARTIDA" },
  { t: "p", name: "Pelourinho", short: "Pelourinho", g: "marrom", price: 60, rent: 4 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Elevador Lacerda", short: "Elev. Lacerda", g: "marrom", price: 60, rent: 4 },
  { t: "tax", name: "Imposto de Renda", short: "Imposto", amt: 200 },
  { t: "air", name: "Aeroporto de Guarulhos", short: "✈ GRU", price: 200 },
  { t: "p", name: "Jericoacoara", short: "Jericoacoara", g: "ciano", price: 100, rent: 6 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Lençóis Maranhenses", short: "Lençóis", g: "ciano", price: 100, rent: 6 },
  { t: "p", name: "Praia de Pipa", short: "Pipa", g: "ciano", price: 120, rent: 8 },
  { t: "jail", name: "Delegacia (visita)", short: "DELEGACIA" },
  { t: "p", name: "Bonito", short: "Bonito", g: "rosa", price: 140, rent: 10 },
  { t: "util", name: "Usina de Itaipu", short: "⚡ Itaipu", price: 150 },
  { t: "p", name: "Pantanal", short: "Pantanal", g: "rosa", price: 140, rent: 10 },
  { t: "p", name: "Chapada dos Guimarães", short: "Chapada", g: "rosa", price: 160, rent: 12 },
  { t: "air", name: "Aeroporto do Galeão", short: "✈ GIG", price: 200 },
  { t: "p", name: "Ouro Preto", short: "Ouro Preto", g: "laranja", price: 180, rent: 14 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Tiradentes", short: "Tiradentes", g: "laranja", price: 180, rent: 14 },
  { t: "p", name: "Inhotim", short: "Inhotim", g: "laranja", price: 200, rent: 16 },
  { t: "free", name: "Feriado Nacional", short: "FERIADO" },
  { t: "p", name: "Cataratas do Iguaçu", short: "Iguaçu", g: "vermelho", price: 220, rent: 18 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Jardim Botânico de Curitiba", short: "Jd. Botânico", g: "vermelho", price: 220, rent: 18 },
  { t: "p", name: "Gramado", short: "Gramado", g: "vermelho", price: 240, rent: 20 },
  { t: "air", name: "Aeroporto de Confins", short: "✈ CNF", price: 200 },
  { t: "p", name: "Porto de Galinhas", short: "P. Galinhas", g: "amarelo", price: 260, rent: 22 },
  { t: "p", name: "Maragogi", short: "Maragogi", g: "amarelo", price: 260, rent: 22 },
  { t: "util", name: "Aquífero Guarani", short: "💧 Aquífero", price: 150 },
  { t: "p", name: "Fernando de Noronha", short: "Noronha", g: "amarelo", price: 280, rent: 24 },
  { t: "gojail", name: "Vá para a Delegacia", short: "VÁ P/ DELEGACIA" },
  { t: "p", name: "Escadaria Selarón", short: "Selarón", g: "verde", price: 300, rent: 26 },
  { t: "p", name: "Maracanã", short: "Maracanã", g: "verde", price: 300, rent: 26 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Pão de Açúcar", short: "Pão de Açúcar", g: "verde", price: 320, rent: 28 },
  { t: "air", name: "Aeroporto de Brasília", short: "✈ BSB", price: 200 },
  { t: "sorte", name: "Sorte ou Azar", short: "SORTE/AZAR" },
  { t: "p", name: "Avenida Paulista", short: "Av. Paulista", g: "azul", price: 350, rent: 35 },
  { t: "tax", name: "Imposto de Luxo", short: "Imp. Luxo", amt: 100 },
  { t: "p", name: "Cristo Redentor", short: "Cristo", g: "azul", price: 400, rent: 50 },
];

/* vinheta ilustrada de cada propriedade: emoji-símbolo + céu + chão */
const ART = {
  1:  { e: "🥁", sky: ["#FFD9A0", "#FF9A56"], gr: "#B5651D" },
  3:  { e: "🛗", sky: ["#AEE3F5", "#5BB7DD"], gr: "#3E6E8E" },
  5:  { e: "🛫", sky: ["#DCEBF7", "#9FBFDD"], gr: "#7E97AC" },
  6:  { e: "🏄", sky: ["#FFE3B3", "#FF9E5E"], gr: "#E8C07A" },
  8:  { e: "🏜️", sky: ["#CFEFFF", "#8FD4F0"], gr: "#F5E6C8" },
  9:  { e: "🐬", sky: ["#BFE8F7", "#6FC4E8"], gr: "#F0D9A8" },
  11: { e: "🐠", sky: ["#CFF5EC", "#7FD8C8"], gr: "#2E8B74" },
  12: { e: "⚡", sky: ["#D5E8F2", "#90B8D0"], gr: "#5E7F95" },
  13: { e: "🐊", sky: ["#FFE9B8", "#F2B95E"], gr: "#6E8F4E" },
  14: { e: "🦅", sky: ["#FFD7C2", "#F09868"], gr: "#A8643C" },
  15: { e: "🛬", sky: ["#E3ECF5", "#A8C2DC"], gr: "#7E97AC" },
  16: { e: "⛪", sky: ["#F5E1C8", "#D9A86C"], gr: "#8A5A33" },
  18: { e: "🚂", sky: ["#EFE3D0", "#C9AE8A"], gr: "#7C6248" },
  19: { e: "🎨", sky: ["#DFF2D8", "#A8D898"], gr: "#5E8F52" },
  21: { e: "💦", sky: ["#D8F0E8", "#8FCDB8"], gr: "#3E7F68" },
  23: { e: "🌷", sky: ["#E2F0DC", "#AFD8A0"], gr: "#558548" },
  24: { e: "🍫", sky: ["#E8E2F2", "#B8A8D8"], gr: "#6E5E8F" },
  25: { e: "🛫", sky: ["#DDE8F2", "#A2BEDA"], gr: "#7E97AC" },
  26: { e: "🦀", sky: ["#CFEFF5", "#7FD0DD"], gr: "#F2DFA8" },
  27: { e: "🤿", sky: ["#C2EAF2", "#6FC8DD"], gr: "#2E97A8" },
  28: { e: "💧", sky: ["#D8EEF5", "#9CC8DD"], gr: "#4E7F95" },
  29: { e: "🐢", sky: ["#C8ECF5", "#70C8E0"], gr: "#1E8FA8" },
  31: { e: "🖌️", sky: ["#FFE0E8", "#F0A8C0"], gr: "#C04868" },
  32: { e: "⚽", sky: ["#D5F0DC", "#92D8A8"], gr: "#2E8B57" },
  34: { e: "🚠", sky: ["#FFE6C8", "#F2A868"], gr: "#5E7F68" },
  35: { e: "🛬", sky: ["#E8EEF5", "#AEC4DC"], gr: "#7E97AC" },
  37: { e: "🏙️", sky: ["#E0D8F0", "#9888C8"], gr: "#4E4868" },
  39: { e: "🙏", sky: ["#FFE9C2", "#F2B05E"], gr: "#7A8FA8" },
};

/* baralho ÚNICO "Sorte ou Azar": good=true sorte, good=false azar.
   Só se descobre ao virar a carta. */
const CARDS = [
  { ti: "Restituição!", e: "🧾", txt: "Restituição do Imposto de Renda. Receba R$ 200.", money: 200, good: true },
  { ti: "Alta temporada", e: "🏨", txt: "Sua pousada bombou na alta temporada. Receba R$ 150.", money: 150, good: true },
  { ti: "Cashback", e: "💳", txt: "Cashback do cartão de viagem. Receba R$ 100.", money: 100, good: true },
  { ti: "Feirinha de domingo", e: "🧺", txt: "Você vendeu artesanato na feira. Receba R$ 50.", money: 50, good: true },
  { ti: "Dia perfeito", e: "☀️", txt: "Sol rachando, passeios lotados. Receba R$ 120.", money: 120, good: true },
  { ti: "Prêmio de foto", e: "📸", txt: "Prêmio de concurso de fotografia de viagem. Receba R$ 250.", money: 250, good: true },
  { ti: "Rumo à Partida", e: "🧭", txt: "Avance até a Partida e receba o salário.", goto: 0, good: true },
  { ti: "Voo promocional", e: "🛫", txt: "Passagem em promoção! Avance para o Aeroporto de Guarulhos.", goto: 5, good: true },
  { ti: "Convite VIP", e: "🎟️", txt: "Convite exclusivo: avance até o Cristo Redentor.", goto: 39, good: true },
  { ti: "Turismo verde", e: "🌱", txt: "Bônus de turismo sustentável. Receba R$ 180.", money: 180, good: true },
  { ti: "Chuva braba", e: "🌧️", txt: "Temporal cancelou os passeios. Pague R$ 100.", money: -100, good: false },
  { ti: "Excesso de bagagem", e: "🧳", txt: "Multa por excesso de bagagem. Pague R$ 50.", money: -50, good: false },
  { ti: "Conta de luz", e: "🔌", txt: "Conta de energia atrasada. Pague R$ 80.", money: -80, good: false },
  { ti: "Taxa surpresa", e: "🪙", txt: "Taxa de turismo surpresa. Pague R$ 60.", money: -60, good: false },
  { ti: "Voo atrasado", e: "🛬", txt: "Voo atrasou, noite extra de hotel. Pague R$ 90.", money: -90, good: false },
  { ti: "Reforma urgente", e: "🧱", txt: "Reforma de emergência nas propriedades. Pague R$ 150.", money: -150, good: false },
  { ti: "Golpe do PIX", e: "📱", txt: "Caiu no golpe do PIX. Pague R$ 120.", money: -120, good: false },
  { ti: "Manutenção geral", e: "🔧", txt: "Pague R$ 40 por casa e R$ 100 por hotel.", repair: true, good: false },
  { ti: "Documento vencido", e: "🚔", txt: "Documento irregular: vá para a Delegacia, sem passar pela Partida.", jail: true, good: false },
  { ti: "Ônibus errado", e: "🚌", txt: "Pegou o ônibus errado. Volte 3 casas.", back: 3, good: false },
];

const TOKENS = ["🦜", "🐆", "⚽", "🎸", "🌴", "☕"];
const COLORS = ["#E03A3A", "#F2C12E", "#2E9E5B", "#2456C4", "#E85D9C", "#F58A1F"];
const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const START_MONEY = 1500;
const JAIL_FINE = 50;
const BOT_NAMES = ["Saci", "Iara", "Curupira", "Boitatá", "Caipora"];
const LVLM = [1, 5, 15, 30, 45, 60, 75, 90, 110]; // multiplicador de aluguel por nível
const EMOJIS_CHAT = ["😂", "🔥", "💰", "😡", "🤝", "🎲", "👀", "🦈"];
const CONFETTI = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  delay: (i % 8) * 0.35,
  dur: 2.8 + (i % 5) * 0.65,
  color: COLORS[i % COLORS.length],
}));

/* ---------- HELPERS ---------- */
const clone = (o) => JSON.parse(JSON.stringify(o));
const fmt = (n) => "R$ " + Number(n).toLocaleString("pt-BR");
const rand6 = () => 1 + Math.floor(Math.random() * 6);
const newCode = () => {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
};

function posToCell(i) {
  if (i <= 10) return { r: 10, c: 10 - i };
  if (i <= 20) return { r: 10 - (i - 10), c: 0 };
  if (i <= 30) return { r: 0, c: i - 20 };
  return { r: i - 30, c: 10 };
}

const priceOf = (sq) => sq.price || 0;
const houseCost = (idx) => [50, 100, 150, 200][Math.floor(idx / 10)];
/* custo do PRÓXIMO nível: níveis 1-4 = casas; 5-8 = hotéis (2x) */
const nextBuildCost = (idx, curLvl) => houseCost(idx) * (curLvl >= 4 ? 2 : 1);
const lvlLabel = (lvl) => (lvl <= 4 ? `${lvl} casa${lvl > 1 ? "s" : ""}` : `${lvl - 4} hot${lvl - 4 > 1 ? "éis" : "el"}`);

function ownsGroup(g, owner, group) {
  return BOARD.every((s, i) => s.g !== group || (g.props[i] && g.props[i].owner === owner));
}
function groupClear(g, group) {
  return BOARD.every((s, i) => s.g !== group || !(g.props[i] && g.props[i].mort));
}
function countOwned(g, owner, type) {
  return BOARD.filter((s, i) => s.t === type && g.props[i] && g.props[i].owner === owner).length;
}
function rentOf(g, idx, diceSum) {
  const sq = BOARD[idx];
  const own = g.props[idx];
  if (!own || own.mort) return 0;
  if (sq.t === "p") {
    const h = own.houses || 0;
    if (h > 0) return sq.rent * LVLM[h];
    return ownsGroup(g, own.owner, sq.g) ? sq.rent * 2 : sq.rent;
  }
  if (sq.t === "air") {
    const n = countOwned(g, own.owner, "air");
    return 25 * Math.pow(2, n - 1);
  }
  if (sq.t === "util") {
    const n = countOwned(g, own.owner, "util");
    return (diceSum || 7) * (n === 2 ? 10 : 4);
  }
  return 0;
}

function addLog(g, msg) {
  g.log = [msg, ...(g.log || [])].slice(0, 14);
}

function doBankrupt(g, pi) {
  const p = g.players[pi];
  p.bankrupt = true;
  p.debtBank = 0;
  p.debtShark = 0;
  p.sharkBase = 0;
  let mantidas = 0;
  Object.keys(g.props).forEach((k) => {
    if (g.props[k].owner === pi) {
      const h = g.props[k].houses || 0;
      if (h > 0) {
        g.props[k] = { owner: -1, houses: h };
        mantidas++;
      } else {
        delete g.props[k];
      }
    }
  });
  if (g.debt && g.debt.who === pi) g.debt = null;
  if (g.trade && (g.trade.from === pi || g.trade.to === pi)) g.trade = null;
  addLog(g, `💥 ${p.name} faliu! Seus bens voltaram ao jogo${mantidas > 0 ? " (construções mantidas — quem cair pode comprar pelo valor investido)" : ""}.`);
  const act = g.players.filter((x) => !x.bankrupt);
  if (act.length === 1) {
    g.status = "ended";
    g.winner = g.players.findIndex((x) => !x.bankrupt);
    addLog(g, `🏆 ${act[0].name} venceu a partida!`);
  }
  if (g.status !== "ended" && g.currentTurn === pi) {
    g.turn = { phase: "roll", doubles: 0, canBuy: null };
    let n = g.currentTurn;
    do {
      n = (n + 1) % g.players.length;
    } while (g.players[n].bankrupt);
    g.currentTurn = n;
    addLog(g, `➡️ Vez de ${g.players[n].name}.`);
  }
}

/* valor total investido numa propriedade (preço + construções) */
function investedOf(idx, houses) {
  let v = priceOf(BOARD[idx]);
  for (let l = 1; l <= (houses || 0); l++) v += houseCost(idx) * (l - 1 >= 4 ? 2 : 1);
  return v;
}
/* preço efetivo de compra: bens de falido voltam pelo valor investido */
function buyPriceOf(g, idx) {
  const own = g.props[idx];
  if (own && own.owner === -1) return investedOf(idx, own.houses);
  return priceOf(BOARD[idx]);
}

function charge(g, pi, amt, toIdx) {
  const p = g.players[pi];
  if (p.money >= amt) {
    p.money -= amt;
    if (toIdx != null) g.players[toIdx].money += amt;
    return true;
  }
  /* sem saldo: entra em modo dívida — nada de saldo negativo */
  g.debt = { who: pi, amount: amt, to: toIdx == null ? null : toIdx };
  g.turn.phase = "debt";
  g.turn.canBuy = null;
  g.turn.canBuild = null;
  addLog(g, `🚨 ${p.name} deve ${fmt(amt)} e não tem saldo! Precisa vender, hipotecar, pegar empréstimo ou declarar falência.`);
  return false;
}

/* quita a dívida pendente automaticamente assim que o saldo cobrir */
function settleDebt(g) {
  const d = g.debt;
  if (!d) return;
  const p = g.players[d.who];
  if (!p || p.bankrupt) {
    g.debt = null;
    return;
  }
  if (p.money >= d.amount) {
    p.money -= d.amount;
    if (d.to != null) g.players[d.to].money += d.amount;
    addLog(g, `✅ ${p.name} quitou a dívida de ${fmt(d.amount)}.`);
    g.debt = null;
    if (g.turn.phase === "debt") g.turn.phase = "manage";
  }
}

function sendToJail(g, pi) {
  const p = g.players[pi];
  p.pos = 10;
  p.inJail = true;
  p.jailTurns = 0;
  g.turn = { phase: "manage", doubles: 0, canBuy: null };
  addLog(g, `🚔 ${p.name} foi parar na Delegacia.`);
}

function passGo(g, pi) {
  const p = g.players[pi];
  p.money += 200;
  addLog(g, `${p.name} passou pela Partida e recebeu ${fmt(200)}.`);
  if ((p.debtBank || 0) > 0) {
    const auto = Math.min(100, p.debtBank, p.money);
    if (auto > 0) {
      p.money -= auto;
      p.debtBank -= auto;
      addLog(g, `🏦 Débito automático: ${p.name} abateu ${fmt(auto)} da dívida com o banco.`);
    }
    if (p.debtBank > 0) {
      p.debtBank = Math.round(p.debtBank * 1.1);
      addLog(g, `🏦 Juros do banco: a dívida de ${p.name} agora é ${fmt(p.debtBank)}.`);
    } else {
      addLog(g, `🏦 ${p.name} quitou a dívida com o banco!`);
    }
  }
  if ((p.debtShark || 0) > 0) {
    p.debtShark = Math.round(p.debtShark * 1.25);
    addLog(g, `🦈 Juros do agiota: a dívida de ${p.name} agora é ${fmt(p.debtShark)}.`);
    if (p.debtShark > (p.sharkBase || 0) * 3) {
      let cheapest = -1;
      Object.entries(g.props).forEach(([k, v]) => {
        const i = Number(k);
        if (v.owner === pi && (cheapest === -1 || priceOf(BOARD[i]) < priceOf(BOARD[cheapest]))) cheapest = i;
      });
      if (cheapest >= 0) {
        const h = g.props[cheapest].houses || 0;
        if (h > 0) g.props[cheapest] = { owner: -1, houses: h };
        else delete g.props[cheapest];
        p.debtShark = 0;
        p.sharkBase = 0;
        addLog(g, `🦈 O agiota perdeu a paciência e tomou ${BOARD[cheapest].name} de ${p.name}. Dívida quitada à força.`);
      }
    }
  }
}

function settleTrade(g) {
  const t = g.trade;
  if (!t) return;
  const A = g.players[t.from];
  const B = g.players[t.to];
  const okProps =
    (t.offerProps || []).every((i) => g.props[i] && g.props[i].owner === t.from) &&
    (t.askProps || []).every((i) => g.props[i] && g.props[i].owner === t.to);
  if (!okProps || A.bankrupt || B.bankrupt || A.money < (t.offerMoney || 0) || B.money < (t.askMoney || 0)) {
    g.trade = null;
    addLog(g, "🔁 A troca caducou: os itens mudaram de situação.");
    return;
  }
  (t.offerProps || []).forEach((i) => (g.props[i].owner = t.to));
  (t.askProps || []).forEach((i) => (g.props[i].owner = t.from));
  A.money += (t.askMoney || 0) - (t.offerMoney || 0);
  B.money += (t.offerMoney || 0) - (t.askMoney || 0);
  g.trade = null;
  addLog(g, `🤝 Troca fechada: ${A.name} ⇄ ${B.name}!`);
  settleDebt(g);
}

function resolveLanding(g, pi, diceSum) {
  const p = g.players[pi];
  if (p.bankrupt || g.status === "ended") return;
  const sq = BOARD[p.pos];
  if (sq.t === "p" || sq.t === "air" || sq.t === "util") {
    const own = g.props[p.pos];
    if (!own || own.owner === -1) {
      const price = buyPriceOf(g, p.pos);
      addLog(g, `${p.name} chegou em ${sq.name} (à venda por ${fmt(price)}${own && (own.houses || 0) > 0 ? ", construções incluídas" : ""}).`);
      if (p.money >= price) g.turn.canBuy = p.pos;
    } else if (own.owner !== pi) {
      if (own.mort) {
        addLog(g, `${p.name} parou em ${sq.name}, que está hipotecada. Sem aluguel.`);
      } else {
        const r = rentOf(g, p.pos, diceSum);
        const dono = g.players[own.owner].name;
        if (charge(g, pi, r, own.owner)) {
          addLog(g, `${p.name} pagou ${fmt(r)} de aluguel a ${dono} em ${sq.name}.`);
        }
      }
    } else {
      addLog(g, `${p.name} visitou sua propriedade: ${sq.name}.`);
      if (sq.t === "p" && pi === g.currentTurn && !own.mort && ownsGroup(g, pi, sq.g) && groupClear(g, sq.g) && (own.houses || 0) < 8) {
        g.turn.canBuild = p.pos;
        addLog(g, `🏗️ ${p.name} pode construir em ${sq.name} nesta jogada.`);
      }
    }
  } else if (sq.t === "tax") {
    if (charge(g, pi, sq.amt, null)) {
      addLog(g, `${p.name} pagou ${fmt(sq.amt)} de ${sq.name}.`);
    }
  } else if (sq.t === "sorte") {
    drawCard(g, pi, diceSum);
  } else if (sq.t === "gojail") {
    sendToJail(g, pi);
  } else {
    addLog(g, `${p.name} parou em ${sq.name}.`);
  }
}

function movePlayer(g, pi, steps, diceSum) {
  const p = g.players[pi];
  let np = p.pos + steps;
  if (np >= 40) {
    np -= 40;
    passGo(g, pi);
  }
  if (np < 0) np += 40;
  p.pos = np;
  resolveLanding(g, pi, diceSum);
}

function gotoPos(g, pi, pos, diceSum) {
  const p = g.players[pi];
  if (pos < p.pos) passGo(g, pi);
  p.pos = pos;
  resolveLanding(g, pi, diceSum);
}

function drawCard(g, pi, diceSum) {
  const c = CARDS[Math.floor(Math.random() * CARDS.length)];
  const p = g.players[pi];
  g.lastCard = { good: c.good, ti: c.ti, e: c.e, txt: c.txt, player: p.name, ts: Date.now() };
  addLog(g, `${c.good ? "🍀 Sorte" : "💢 Azar"} (${p.name}): ${c.txt}`);
  if (c.money > 0) p.money += c.money;
  if (c.money < 0) charge(g, pi, -c.money, null);
  if (c.repair) {
    let total = 0;
    Object.entries(g.props).forEach(([k, v]) => {
      if (v.owner === pi) {
        const h = v.houses || 0;
        total += h > 4 ? (h - 4) * 100 + 4 * 40 : h * 40;
      }
    });
    if (total > 0) charge(g, pi, total, null);
  }
  if (c.goto != null) gotoPos(g, pi, c.goto, diceSum);
  if (c.back) movePlayer(g, pi, -c.back, diceSum);
  if (c.jail) sendToJail(g, pi);
}

/* ---------- STORAGE ---------- */
const KEY = (code) => `magnata3:game:${code}`;
const CHATKEY = (code) => `magnata3:chat:${code}`;

/* ---------- TIMER DE INATIVIDADE ---------- */
const TIMER_ROLL = 6000;    // jogar os dados
const TIMER_DECIDE = 10000; // comprar / encerrar a vez
const TIMER_TRADE = 30000;  // responder proposta de troca
function turnDeadline(g) {
  if (!g || g.status !== "playing" || g.trade) return null;
  const p = g.players[g.currentTurn];
  if (!p || p.bot || p.bankrupt) return null;
  // base de tempo: para decisões (comprar/encerrar) usa o instante em que a decisão
  // surgiu (decisionAt), não o updatedAt geral — assim o auto-roll nunca "come" o tempo de compra.
  const base = g.decisionAt || g.updatedAt || 0;
  if (g.turn.phase === "roll") return { at: (g.updatedAt || 0) + TIMER_ROLL, action: "roll" };
  if (g.turn.canBuy != null) return { at: base + TIMER_DECIDE, action: "buy" };
  if (g.turn.phase === "manage") return { at: base + TIMER_DECIDE, action: "end" };
  return null;
}

async function loadGame(code) {
  try {
    const r = await window.storage.get(KEY(code), true);
    return r ? JSON.parse(r.value) : null;
  } catch (e) {
    return null;
  }
}
async function saveGame(g) {
  g.v = (g.v || 0) + 1;
  g.updatedAt = Date.now();
  try {
    await window.storage.set(KEY(g.code), JSON.stringify(g), true);
  } catch (e) {
    console.error("Erro ao salvar partida", e);
  }
  return g;
}

/* ---------- SOM (Web Audio, sintetizado) ---------- */
let _actx = null;
let _muted = false;
function _ac() {
  try {
    if (!_actx) _actx = new (window.AudioContext || window.webkitAudioContext)();
    if (_actx && _actx.state === "suspended") _actx.resume();
  } catch (e) {}
  return _actx;
}
function _tone(freq, dur, type, vol, when, slideTo) {
  const c = _ac();
  if (!c || _muted) return;
  try {
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
    g.gain.setValueAtTime(vol || 0.15, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.03);
  } catch (e) {}
}
function _noise(dur, vol, when) {
  const c = _ac();
  if (!c || _muted) return;
  try {
    const t0 = c.currentTime + (when || 0);
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = c.createBufferSource();
    const g = c.createGain();
    s.buffer = buf;
    g.gain.setValueAtTime(vol || 0.15, t0);
    s.connect(g);
    g.connect(c.destination);
    s.start(t0);
  } catch (e) {}
}
const SFX = {
  tick: () => _tone(640, 0.05, "square", 0.05),
  dice: () => { for (let i = 0; i < 6; i++) _noise(0.045, 0.13, i * 0.075); _tone(420, 0.06, "triangle", 0.07, 0.45); },
  coin: () => { _tone(880, 0.09, "triangle", 0.18); _tone(1318, 0.2, "triangle", 0.16, 0.09); },
  pay: () => { _tone(330, 0.12, "sawtooth", 0.1); _tone(208, 0.22, "sawtooth", 0.1, 0.11); },
  buy: () => { _tone(523, 0.08, "triangle", 0.16); _tone(659, 0.08, "triangle", 0.16, 0.08); _tone(1047, 0.22, "triangle", 0.16, 0.16); },
  card: () => { _tone(740, 0.1, "sine", 0.16); _tone(988, 0.18, "sine", 0.16, 0.1); },
  jail: () => { _tone(170, 0.4, "sawtooth", 0.16, 0, 95); _noise(0.12, 0.1, 0.05); },
  build: () => { _noise(0.05, 0.22); _tone(190, 0.05, "square", 0.1); _noise(0.05, 0.22, 0.14); _tone(165, 0.05, "square", 0.1, 0.14); },
  win: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => _tone(f, 0.22, "triangle", 0.2, i * 0.13)); },
  turn: () => { _tone(987, 0.1, "sine", 0.18); _tone(1318, 0.22, "sine", 0.16, 0.1); },
  whoosh: () => _tone(280, 0.28, "sine", 0.12, 0, 900),
  boom: () => { _tone(120, 0.5, "sawtooth", 0.2, 0, 40); _noise(0.3, 0.18); },
  ping: () => { _tone(1175, 0.07, "sine", 0.16); _tone(1568, 0.14, "sine", 0.13, 0.07); },
  shark: () => { _tone(98, 0.5, "sawtooth", 0.18, 0, 55); _tone(82, 0.5, "sawtooth", 0.14, 0.18, 45); },
};

/* ---------- LOGO (SVG, versões clara e escura) ---------- */
function Logo({ w = 240, dark = true }) {
  const h = w * 0.66;
  const text1 = dark ? "#F7D154" : "#0B3D2E";
  const text2 = dark ? "#FBF5E9" : "#E03A3A";
  return (
    <svg width={w} height={h} viewBox="0 0 240 158" className="mb-logo" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="lgGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A0" />
          <stop offset="0.5" stopColor="#F2C12E" />
          <stop offset="1" stopColor="#C8920A" />
        </linearGradient>
        <linearGradient id="lgGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1A6A50" />
          <stop offset="1" stopColor="#072A20" />
        </linearGradient>
        <linearGradient id="lgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2BA56F" />
          <stop offset="1" stopColor="#0B3D2E" />
        </linearGradient>
        <filter id="lgShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
        </filter>
      </defs>
      {/* brasão */}
      <g filter="url(#lgShadow)">
        <path d="M120 6 L168 22 V58 C168 86 148 102 120 112 C92 102 72 86 72 58 V22 Z" fill="url(#lgGreen)" stroke="url(#lgGold)" strokeWidth="4" />
        <path d="M120 14 L160 27 V57 C160 80 144 94 120 103 C96 94 80 80 80 57 V27 Z" fill="url(#lgSky)" />
        {/* sol */}
        <circle cx="120" cy="42" r="11" fill="url(#lgGold)" />
        {/* skyline / construções */}
        <rect x="92" y="58" width="10" height="30" rx="1.5" fill="#0A2E22" />
        <rect x="105" y="48" width="12" height="40" rx="1.5" fill="#08251B" />
        <rect x="120" y="55" width="9" height="33" rx="1.5" fill="#0A2E22" />
        <rect x="132" y="62" width="12" height="26" rx="1.5" fill="#08251B" />
        {/* janelas acesas */}
        {[0, 1, 2].map((k) => (
          <rect key={k} x={107 + 0} y={52 + k * 9} width="3" height="3" fill="#F7D154" />
        ))}
        {[0, 1].map((k) => (
          <rect key={"b" + k} x={95} y={62 + k * 9} width="3" height="3" fill="#F7D154" opacity="0.9" />
        ))}
        {/* palmeira */}
        <path d="M86 88 C85 76 84 70 82 64" stroke="#0A2E22" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M82 64 C76 60 72 60 68 62 M82 64 C80 58 81 54 84 50 M82 64 C87 59 91 58 96 60" stroke="#15543E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        {/* seta de progresso */}
        <path d="M96 96 L112 84 L122 90 L142 72" stroke="url(#lgGold)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M142 72 L134 72 M142 72 L142 80" stroke="url(#lgGold)" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      {/* wordmark */}
      <text x="120" y="137" textAnchor="middle" fontFamily="'Archivo Black','Arial Black',sans-serif" fontSize="26" fill={text1} style={{ letterSpacing: 1 }}>
        MAGNATA
      </text>
      <text x="120" y="155" textAnchor="middle" fontFamily="'Archivo Black','Arial Black',sans-serif" fontSize="14" fill={text2} style={{ letterSpacing: 9 }}>
        BRASIL
      </text>
    </svg>
  );
}

/* ---------- VINHETA ILUSTRADA DE PROPRIEDADE ---------- */
function Scene({ i, big }) {
  const a = ART[i];
  if (!a) return null;
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: big ? 110 : "100%", background: `linear-gradient(180deg, ${a.sky[0]}, ${a.sky[1]} 72%, ${a.gr} 72%)`, borderRadius: big ? 10 : 0 }}
    >
      {big && <div className="absolute rounded-full" style={{ width: 26, height: 26, right: 14, top: 10, background: "radial-gradient(circle at 35% 35%, #FFF6CF, #F2C12E)", boxShadow: "0 0 14px rgba(242,193,46,.8)" }} />}
      <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: big ? 52 : "min(4.6vw,22px)", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.3))", transform: big ? "translateY(4px)" : "none" }}>
        {a.e}
      </div>
      {big && <div className="absolute left-0 right-0 bottom-0" style={{ height: 8, background: "rgba(0,0,0,.18)" }} />}
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
export default function MagnataBrasilPremium() {
  const [screen, setScreen] = useState("home");
  const [pid, setPid] = useState(null);
  const [name, setName] = useState("");
  const [tokenIdx, setTokenIdx] = useState(0);
  const [joinCode, setJoinCode] = useState("");
  const [game, setGame] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [cellInfo, setCellInfo] = useState(null);
  const [showMoney, setShowMoney] = useState(false);
  const [showTrade, setShowTrade] = useState(false);
  const [trPartner, setTrPartner] = useState(-1);
  const [trMine, setTrMine] = useState([]);
  const [trTheirs, setTrTheirs] = useState([]);
  const [trGive, setTrGive] = useState("");
  const [trAsk, setTrAsk] = useState("");
  const [muted, setMuted] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [dispPos, setDispPos] = useState({});
  const [cardShow, setCardShow] = useState(false);
  const [floats, setFloats] = useState({});
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatTo, setChatTo] = useState("all");
  const [nowTs, setNowTs] = useState(Date.now());
  const [autoPlay, setAutoPlay] = useState(false);
  const [pixModal, setPixModal] = useState({ show: false, boost: null, amount: 0, bonus: 0, qrCode: null, qrCodeBase64: null, id: null, status: 'pending', simulation: false });
  const [clickedBoost, setClickedBoost] = useState(null);

  const handleSelectBoost = async (boostId) => {
    const prices = { bronze: 0.10, prata: 0.20, ouro: 0.30 };
    const bonuses = { bronze: 5000, prata: 10000, ouro: 20000 };

    console.log("🚀 Botão de boost clicado:", boostId);

    // Feedback visual imediato
    setClickedBoost(boostId);
    setTimeout(() => setClickedBoost(null), 800);

    // ABRE O MODAL IMEDIATAMENTE com loading
    setPixModal({
      show: true,
      boost: boostId,
      amount: prices[boostId],
      bonus: bonuses[boostId],
      qrCode: null,
      qrCodeBase64: null,
      id: null,
      status: "loading",
      simulation: false
    });

    // Tenta buscar QR Code real da API
    try {
      const myName = name || "Jogador";
      console.log("📡 Chamando API do Mercado Pago...");

      const response = await fetch("/api/create-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boost: boostId, playerName: myName, playerId: pid }),
      });

      if (!response.ok) {
        throw new Error("Erro na API Mercado Pago");
      }

      const data = await response.json();
      console.log("✅ QR Code real gerado:", data);

      // Atualiza modal com dados reais
      setPixModal({
        show: true,
        boost: boostId,
        amount: prices[boostId],
        bonus: bonuses[boostId],
        qrCode: data.qr_code,
        qrCodeBase64: data.qr_code_base64,
        id: data.id,
        status: "pending",
        simulation: false
      });
    } catch (e) {
      console.warn("⚠️ Falha ao gerar PIX real. Ativando modo simulação.", e);

      // Atualiza modal para modo simulação
      setPixModal({
        show: true,
        boost: boostId,
        amount: prices[boostId],
        bonus: bonuses[boostId],
        qrCode: "00020101021243650016com.mercadopago01363360225f-30b6-4558-b840-2443d00014cf5204000053039865802BR5908MUSEUPIX6009SAOPAULO620705030106304CA7F",
        qrCodeBase64: null,
        id: "sim-" + Math.random().toString(36).slice(2, 10),
        status: "pending",
        simulation: true
      });
    }
  };

  const simulatePixPayment = () => {
    confirmBoostPayment(pixModal.boost);
  };

  const confirmBoostPayment = (boostId) => {
    act((g) => {
      const idx = g.players.findIndex((p) => p.id === pid);
      if (idx !== -1) {
        g.players[idx].boost = boostId;
        addLog(g, `🚀 ${g.players[idx].name} adquiriu o Boost ${boostId.toUpperCase()}!`);
      }
    });
    setPixModal(prev => ({ ...prev, show: false }));
    if (typeof SFX !== "undefined" && SFX.coin) SFX.coin();
  };

  // Efeito de polling para verificar pagamentos reais aprovados
  useEffect(() => {
    if (!pixModal.show || !pixModal.id || pixModal.simulation) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-pix?id=${pixModal.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "approved") {
            clearInterval(interval);
            confirmBoostPayment(pixModal.boost);
            alert(`Pagamento aprovado! Seu Boost ${pixModal.boost.toUpperCase()} foi ativado com sucesso. 🚀`);
          }
        }
      } catch (err) {
        console.error("Erro no polling do PIX:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixModal.show, pixModal.id, pixModal.simulation]);

  const hopTimers = useRef({});
  const prevGameRef = useRef(null);
  const prevChatLen = useRef(0);
  const seenRef = useRef(0);
  const chatBoxRef = useRef(null);
  const cardTimer = useRef(null);
  const gameRef = useRef(null);
  gameRef.current = game;

  const toggleMute = () => {
    _muted = !_muted;
    setMuted(_muted);
    if (!_muted) SFX.tick();
  };

  /* desbloqueia o áudio no primeiro toque */
  useEffect(() => {
    const unlock = () => _ac();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  /* identidade persistente + reconexão + leitura de código na URL */
  useEffect(() => {
    (async () => {
      // Lê parâmetro "sala" da URL se houver
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get("sala") || urlParams.get("room");
      if (roomParam) {
        setJoinCode(roomParam.toUpperCase().slice(0, 4));
      }

      let id = null;
      try {
        const r = await window.storage.get("magnata:pid");
        id = r ? r.value : null;
      } catch (e) {}
      if (!id) {
        id = "p" + Math.random().toString(36).slice(2, 10);
        try {
          await window.storage.set("magnata:pid", id);
        } catch (e) {}
      }
      setPid(id);

      // Só tenta reconectar se não houver um parâmetro de sala na URL (para evitar prender em salas velhas)
      if (!roomParam) {
        try {
          const last = await window.storage.get("magnata3:last");
          if (last && last.value) {
            const g = await loadGame(last.value);
            if (g && g.players.some((p) => p.id === id) && g.status !== "ended") {
              setGame(g);
              setScreen(g.status === "lobby" ? "lobby" : "game");
            }
          }
        } catch (e) {}
      }
    })();
  }, []);

  /* polling do jogo */
  useEffect(() => {
    if (!game || !game.code) return;
    // Polling mais frequente no lobby (1s) para sincronização rápida de jogadores
    const interval = screen === "lobby" ? 1000 : 2500;
    const t = setInterval(async () => {
      const g = await loadGame(game.code);
      const cur = gameRef.current;
      if (g && cur && g.v > cur.v) {
        setGame(g);
        if (g.status === "playing" && screen === "lobby") setScreen("game");
      }
    }, interval);
    return () => clearInterval(t);
  }, [game && game.code, screen]);

  useEffect(() => {
    if (game && game.status === "playing" && screen === "lobby") setScreen("game");
  }, [game, screen]);

  /* polling do chat (chave separada — não conflita com o jogo) */
  useEffect(() => {
    if (!game || !game.code || screen === "home") return;
    let stop = false;
    const load = async () => {
      try {
        const r = await window.storage.get(CHATKEY(game.code), true);
        const arr = r ? JSON.parse(r.value) : [];
        if (!stop) setChatMsgs(arr);
      } catch (e) {}
    };
    load();
    const t = setInterval(load, 2500);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [game && game.code, screen]);

  /* notificação de chat */
  useEffect(() => {
    const mine = chatMsgs.filter((m) => !m.to || m.to === pid || m.pid === pid);
    if (mine.length > prevChatLen.current && prevChatLen.current > 0) {
      const last = mine[mine.length - 1];
      if (last && last.pid !== pid) SFX.ping();
    }
    prevChatLen.current = mine.length;
    if (chatOpen) {
      seenRef.current = mine.length;
      if (chatBoxRef.current) setTimeout(() => { if (chatBoxRef.current) chatBoxRef.current.scrollTop = 1e6; }, 50);
    }
  }, [chatMsgs, chatOpen, pid]);

  /* animação dos pinos: casa a casa */
  useEffect(() => {
    if (!game) return;
    game.players.forEach((p) => {
      const cur = dispPos[p.id];
      if (cur == null) {
        setDispPos((d) => ({ ...d, [p.id]: p.pos }));
        return;
      }
      if (cur === p.pos) return;
      if (hopTimers.current[p.id]) return;
      const dist = (p.pos - cur + 40) % 40;
      if (dist === 0 || dist > 14) {
        SFX.whoosh();
        setDispPos((d) => ({ ...d, [p.id]: p.pos }));
        return;
      }
      let step = 0;
      const walk = () => {
        step += 1;
        const np = (cur + step) % 40;
        SFX.tick();
        setDispPos((d) => ({ ...d, [p.id]: np }));
        if (step < dist) {
          hopTimers.current[p.id] = setTimeout(walk, 175);
        } else {
          delete hopTimers.current[p.id];
          const live = gameRef.current && gameRef.current.players.find((x) => x.id === p.id);
          if (live && live.pos !== np) setDispPos((d) => ({ ...d, [p.id]: live.pos }));
        }
      };
      hopTimers.current[p.id] = setTimeout(walk, 60);
    });
  }, [game && game.v, game && game.players.map((p) => p.pos).join(",")]);

  useEffect(() => () => Object.values(hopTimers.current).forEach(clearTimeout), []);

  const myIdx = game ? game.players.findIndex((p) => p.id === pid) : -1;
  const isMyTurn = game && game.status === "playing" && game.currentTurn === myIdx;
  const me = myIdx >= 0 && game ? game.players[myIdx] : null;
  const curPlayer = game && game.status === "playing" ? game.players[game.currentTurn] : null;

  /* sons + feedbacks visuais disparados por mudanças de estado */
  useEffect(() => {
    const prev = prevGameRef.current;
    prevGameRef.current = game;
    if (!prev || !game || prev.code !== game.code) return;
    if (game.dice && JSON.stringify(game.dice) !== JSON.stringify(prev.dice)) {
      SFX.dice();
      setRolling(true);
      setTimeout(() => setRolling(false), 580);
    }
    if (game.lastCard && (!prev.lastCard || prev.lastCard.ts !== game.lastCard.ts)) {
      SFX.card();
      setCardShow(true);
      if (cardTimer.current) clearTimeout(cardTimer.current);
      cardTimer.current = setTimeout(() => setCardShow(false), 5000);
    }
    if (Object.keys(game.props).length > Object.keys(prev.props).length) SFX.buy();
    const housesOf = (g) => Object.values(g.props).reduce((a, v) => a + (v.houses || 0), 0);
    if (housesOf(game) > housesOf(prev)) SFX.build();
    const newFloats = {};
    game.players.forEach((p, i) => {
      const q = prev.players[i];
      if (q && q.id === p.id) {
        if (!q.inJail && p.inJail) SFX.jail();
        if (!q.bankrupt && p.bankrupt) SFX.boom();
        const d = p.money - q.money;
        if (d !== 0) newFloats[i] = { d, k: Date.now() + "-" + i };
      }
    });
    if (Object.keys(newFloats).length) setFloats((f) => ({ ...f, ...newFloats }));
    if (myIdx >= 0 && prev.players[myIdx] && prev.players[myIdx].id === pid) {
      const delta = game.players[myIdx].money - prev.players[myIdx].money;
      if (delta > 0) SFX.coin();
      else if (delta < 0) SFX.pay();
    }
    if (game.trade && (!prev.trade || JSON.stringify(prev.trade) !== JSON.stringify(game.trade))) SFX.ping();
    const sharkDebt = (g) => g.players.reduce((a, p) => a + (p.debtShark || 0), 0);
    if (sharkDebt(game) > sharkDebt(prev)) SFX.shark();
    if (game.status === "ended" && prev.status !== "ended") SFX.win();
    else if (game.status === "playing" && game.currentTurn !== prev.currentTurn && game.players[game.currentTurn] && game.players[game.currentTurn].id === pid) {
      SFX.turn();
    }
  }, [game && game.v]);

  const persist = async (g) => {
    await saveGame(g);
    setGame(clone(g));
  };

  const act = async (fn) => {
    if (busy) return;
    setBusy(true);
    try {
      const g = clone(gameRef.current);
      const beforeBuy = g.turn ? g.turn.canBuy : null;
      const beforePhase = g.turn ? g.turn.phase : null;
      const beforeTurn = g.currentTurn;
      fn(g);
      // marca o instante em que uma decisão (comprar/encerrar) passou a estar disponível,
      // para o timer de 10s sempre começar do zero — corrige o bug de não dar tempo de comprar
      if (g.status === "playing" && g.turn) {
        const buyAppeared = g.turn.canBuy != null && g.turn.canBuy !== beforeBuy;
        const manageAppeared = g.turn.phase === "manage" && (beforePhase !== "manage" || g.currentTurn !== beforeTurn);
        if (buyAppeared || manageAppeared) g.decisionAt = Date.now();
      }
      await persist(g);
    } finally {
      setBusy(false);
    }
  };

  /* ---------- LOBBY ---------- */
  const createGame = async () => {
    if (!name.trim()) return setErr("Digite seu nome.");
    setErr("");
    setBusy(true);
    const code = newCode();
    const g = {
      code,
      v: 0,
      status: "lobby",
      host: pid,
      players: [{ id: pid, name: name.trim(), token: tokenIdx, pos: 0, money: START_MONEY, inJail: false, jailTurns: 0, bankrupt: false, ready: false }],
      props: {},
      currentTurn: 0,
      turn: { phase: "roll", doubles: 0, canBuy: null },
      dice: null,
      log: [],
      lastCard: null,
      trade: null,
    };
    await saveGame(g);
    try {
      await window.storage.set("magnata3:last", code);
    } catch (e) {}
    setGame(g);
    setScreen("lobby");
    setBusy(false);
  };

  const joinGame = async () => {
    if (!name.trim()) return setErr("Digite seu nome.");
    const code = joinCode.trim().toUpperCase();
    if (!code) return setErr("Digite o código da sala.");
    setErr("");
    setBusy(true);

    // Retry logic para evitar race conditions
    let retries = 3;
    while (retries > 0) {
      try {
        // Carrega a versão mais recente do jogo
        const g = await loadGame(code);
        if (!g) {
          setBusy(false);
          return setErr("Partida não encontrada. Confira o código.");
        }

        const existing = g.players.find((p) => p.id === pid);
        if (existing) {
          setGame(g);
          setScreen(g.status === "lobby" ? "lobby" : "game");
          try {
            await window.storage.set("magnata3:last", code);
          } catch (e) {}
          setBusy(false);
          return;
        }

        if (g.status !== "lobby") {
          setBusy(false);
          return setErr("Essa partida já começou.");
        }
        if (g.players.length >= 6) {
          setBusy(false);
          return setErr("Sala cheia (máx. 6 jogadores).");
        }

        const taken = g.players.map((p) => p.token);
        let tk = tokenIdx;
        while (taken.includes(tk)) tk = (tk + 1) % TOKENS.length;
        g.players.push({ id: pid, name: name.trim(), token: tk, pos: 0, money: START_MONEY, inJail: false, jailTurns: 0, bankrupt: false, ready: false });
        addLog(g, `${name.trim()} entrou na sala.`);

        await saveGame(g);
        try {
          await window.storage.set("magnata3:last", code);
        } catch (e) {}
        setGame(g);
        setScreen("lobby");
        setBusy(false);
        return;
      } catch (e) {
        console.error("Erro ao entrar no jogo, tentando novamente...", e);
        retries--;
        if (retries === 0) {
          setBusy(false);
          return setErr("Erro ao entrar na partida. Tente novamente.");
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const startGame = () =>
    act((g) => {
      g.status = "playing";
      g.currentTurn = 0;
      g.turn = { phase: "roll", doubles: 0, canBuy: null };
      
      // Aplica bônus de boost na grana inicial de cada jogador
      g.players = g.players.map((p) => {
        let initialMoney = START_MONEY;
        if (p.boost === "bronze") initialMoney += 5000;
        else if (p.boost === "prata") initialMoney += 10000;
        else if (p.boost === "ouro") initialMoney += 20000;
        return { ...p, money: initialMoney };
      });

      addLog(g, `🎲 Partida iniciada! Vez de ${g.players[0].name}.`);
    });

  const addBot = () =>
    act((g) => {
      if (g.players.length >= 6 || g.status !== "lobby") return;
      const taken = g.players.map((p) => p.token);
      let tk = 0;
      while (taken.includes(tk)) tk++;
      const used = g.players.map((p) => p.name);
      const nm = BOT_NAMES.find((n) => !used.includes(n)) || "Robô " + (g.players.length + 1);
      // Bots não precisam marcar como pronto - ignoram o sistema de ready
      g.players.push({ id: "bot" + Math.random().toString(36).slice(2, 8), bot: true, name: nm, token: tk, pos: 0, money: START_MONEY, inJail: false, jailTurns: 0, bankrupt: false, ready: true });
      addLog(g, `🤖 ${nm} entrou na sala.`);
    });

  const removeBot = (id) =>
    act((g) => {
      if (g.status !== "lobby") return;
      g.players = g.players.filter((p) => p.id !== id);
    });

  const toggleReady = () =>
    act((g) => {
      const idx = g.players.findIndex((p) => p.id === pid);
      if (idx !== -1) {
        g.players[idx].ready = !g.players[idx].ready;
      }
    });

  const leaveToHome = async () => {
    try {
      await window.storage.set("magnata3:last", "");
    } catch (e) {}
    setGame(null);
    setScreen("home");
  };

  /* ---------- AÇÕES DE JOGO ---------- */
  const rollDice = () =>
    act((g) => {
      const pi = g.currentTurn;
      g.turn.canBuild = null;
      const d1 = rand6(), d2 = rand6();
      g.dice = [d1, d2];
      const sum = d1 + d2;
      if (d1 === d2) {
        g.turn.doubles = (g.turn.doubles || 0) + 1;
        if (g.turn.doubles >= 3) {
          addLog(g, `${g.players[pi].name} tirou 3 duplas seguidas!`);
          sendToJail(g, pi);
          return;
        }
      }
      addLog(g, `${g.players[pi].name} tirou ${d1} + ${d2} = ${sum}${d1 === d2 ? " (dupla!)" : ""}.`);
      movePlayer(g, pi, sum, sum);
      const p = g.players[pi];
      if (g.status === "ended" || p.bankrupt) {
        /* falência: o turno já foi passado adiante */
      } else if (g.turn.phase === "debt") {
        /* em dívida: aguardando o jogador levantar dinheiro */
      } else if (p.inJail) {
        g.turn.phase = "manage";
      } else if (d1 === d2) {
        g.turn.phase = "roll";
        addLog(g, `${p.name} joga de novo (dupla).`);
      } else {
        g.turn.phase = "manage";
      }
    });

  const payJail = () =>
    act((g) => {
      const pi = g.currentTurn;
      const p = g.players[pi];
      if (p.money < JAIL_FINE) return;
      charge(g, pi, JAIL_FINE, null);
      p.inJail = false;
      p.jailTurns = 0;
      addLog(g, `${p.name} pagou ${fmt(JAIL_FINE)} e saiu da Delegacia.`);
      g.turn.phase = "roll";
      g.turn.doubles = 0;
    });

  const tryJailRoll = () =>
    act((g) => {
      const pi = g.currentTurn;
      const p = g.players[pi];
      const d1 = rand6(), d2 = rand6();
      g.dice = [d1, d2];
      const sum = d1 + d2;
      if (d1 === d2) {
        p.inJail = false;
        p.jailTurns = 0;
        addLog(g, `${p.name} tirou dupla (${d1}+${d2}) e saiu da Delegacia!`);
        movePlayer(g, pi, sum, sum);
        if (!p.bankrupt && g.status !== "ended" && g.turn.phase !== "debt") g.turn.phase = "manage";
      } else {
        p.jailTurns += 1;
        if (p.jailTurns >= 3) {
          if (charge(g, pi, JAIL_FINE, null)) {
            p.inJail = false;
            p.jailTurns = 0;
            addLog(g, `${p.name} pagou ${fmt(JAIL_FINE)} após 3 tentativas e saiu.`);
            movePlayer(g, pi, sum, sum);
            if (!p.bankrupt && g.status !== "ended" && g.turn.phase !== "debt") g.turn.phase = "manage";
          } else {
            p.jailTurns = 2; /* tenta de novo na próxima vez */
          }
        } else {
          addLog(g, `${p.name} tirou ${d1}+${d2} e continua na Delegacia (${p.jailTurns}/3).`);
          g.turn.phase = "manage";
        }
      }
    });

  const buyProp = () =>
    act((g) => {
      const pi = g.currentTurn;
      const idx = g.turn.canBuy;
      if (idx == null) return;
      const sq = BOARD[idx];
      const p = g.players[pi];
      const own = g.props[idx];
      const price = buyPriceOf(g, idx);
      if (p.money >= price && (!own || own.owner === -1)) {
        p.money -= price;
        const houses = own ? own.houses || 0 : 0;
        g.props[idx] = { owner: pi, houses };
        addLog(g, `🏠 ${p.name} comprou ${sq.name} por ${fmt(price)}${houses > 0 ? ` com ${lvlLabel(houses)} incluídas` : ""}.`);
      }
      g.turn.canBuy = null;
    });

  const skipBuy = () =>
    act((g) => {
      g.turn.canBuy = null;
    });

  const buildHouse = () =>
    act((g) => {
      const pi = g.currentTurn;
      const p = g.players[pi];
      const idx = g.turn.canBuild;
      if (idx == null) return;
      const own = g.props[idx];
      const sq = BOARD[idx];
      if (!own || own.owner !== pi || sq.t !== "p" || own.mort) return;
      const lvl = own.houses || 0;
      const cost = nextBuildCost(idx, lvl);
      if (!ownsGroup(g, pi, sq.g) || !groupClear(g, sq.g) || lvl >= 8 || p.money < cost) return;
      p.money -= cost;
      own.houses = lvl + 1;
      g.turn.canBuild = null;
      addLog(g, `🏗️ ${p.name} evoluiu ${sq.name} para nível ${own.houses} (${lvlLabel(own.houses)}) por ${fmt(cost)}.`);
    });

  const sellBuild = (idx) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      const own = g.props[idx];
      if (i < 0 || !own || own.owner !== i || (own.houses || 0) <= 0) return;
      const lvl = own.houses;
      const refund = Math.round(nextBuildCost(idx, lvl - 1) / 2);
      own.houses = lvl - 1;
      g.players[i].money += refund;
      addLog(g, `🔨 ${g.players[i].name} desfez uma construção em ${BOARD[idx].name} e recebeu ${fmt(refund)}.`);
      settleDebt(g);
    });

  const mortgage = (idx) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      const own = g.props[idx];
      if (i < 0 || !own || own.owner !== i || own.mort || (own.houses || 0) > 0) return;
      const val = Math.round(priceOf(BOARD[idx]) / 2);
      own.mort = true;
      g.players[i].money += val;
      addLog(g, `🔒 ${g.players[i].name} hipotecou ${BOARD[idx].name} e recebeu ${fmt(val)}.`);
      settleDebt(g);
    });

  const unmortgage = (idx) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      const own = g.props[idx];
      if (i < 0 || !own || own.owner !== i || !own.mort) return;
      const val = Math.round(priceOf(BOARD[idx]) * 0.55);
      if (g.players[i].money < val) return;
      g.players[i].money -= val;
      own.mort = false;
      addLog(g, `🔓 ${g.players[i].name} resgatou a hipoteca de ${BOARD[idx].name} por ${fmt(val)}.`);
    });

  const sellProp = (idx) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      const own = g.props[idx];
      if (i < 0 || !own || own.owner !== i) return;
      const val = own.mort ? Math.round(priceOf(BOARD[idx]) / 4) : Math.round(investedOf(idx, own.houses) / 2);
      delete g.props[idx];
      g.players[i].money += val;
      addLog(g, `🏷️ ${g.players[i].name} vendeu ${BOARD[idx].name}${(own.houses || 0) > 0 ? " (com construções)" : ""} ao banco por ${fmt(val)}.`);
      settleDebt(g);
    });

  const declareBankruptcy = () =>
    act((g) => {
      const d = g.debt;
      if (!d) return;
      const i = g.players.findIndex((p) => p.id === pid);
      if (i !== d.who) return;
      if (d.to != null) g.players[d.to].money += g.players[i].money;
      g.players[i].money = 0;
      g.debt = null;
      doBankrupt(g, i);
    });

  const takeLoan = (kind, amt) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      if (i < 0) return;
      const p = g.players[i];
      if (kind === "bank") {
        if ((p.debtBank || 0) > 0) return;
        p.money += amt;
        p.debtBank = Math.round(amt * 1.1);
        addLog(g, `🏦 ${p.name} pegou ${fmt(amt)} no banco (deve ${fmt(p.debtBank)}, +10% por volta, abate automático na Partida).`);
      } else {
        if ((p.debtShark || 0) > 0) return;
        p.money += amt;
        p.debtShark = Math.round(amt * 1.3);
        p.sharkBase = amt;
        addLog(g, `🦈 ${p.name} pegou ${fmt(amt)} com o agiota (deve ${fmt(p.debtShark)}, +25% por volta — cuidado!).`);
      }
      settleDebt(g);
    });

  const payLoan = (kind, all) =>
    act((g) => {
      const i = g.players.findIndex((p) => p.id === pid);
      if (i < 0) return;
      const p = g.players[i];
      const key = kind === "bank" ? "debtBank" : "debtShark";
      const debt = p[key] || 0;
      const amt = all ? Math.min(debt, p.money) : Math.min(100, debt, p.money);
      if (amt <= 0) return;
      p.money -= amt;
      p[key] = debt - amt;
      if (kind !== "bank" && p[key] === 0) p.sharkBase = 0;
      addLog(g, `${kind === "bank" ? "🏦" : "🦈"} ${p.name} abateu ${fmt(amt)}${p[key] === 0 ? " e quitou a dívida!" : ` (restam ${fmt(p[key])})`}.`);
    });

  const openTrade = (counter) => {
    const g = gameRef.current;
    if (!g) return;
    if (counter && g.trade) {
      const t = g.trade;
      setTrPartner(t.from);
      setTrMine([...(t.askProps || [])]);
      setTrTheirs([...(t.offerProps || [])]);
      setTrGive(t.askMoney ? String(t.askMoney) : "");
      setTrAsk(t.offerMoney ? String(t.offerMoney) : "");
    } else {
      setTrPartner(-1);
      setTrMine([]);
      setTrTheirs([]);
      setTrGive("");
      setTrAsk("");
    }
    setShowTrade(true);
  };

  const proposeTrade = () =>
    act((g) => {
      const from = g.players.findIndex((p) => p.id === pid);
      if (from < 0 || trPartner < 0 || trPartner === from) return;
      if (g.trade && g.trade.to !== from) return; // só substitui se for contraproposta minha
      const countering = g.trade && g.trade.to === from;
      if (!countering && g.currentTurn !== from) return; // proposta nova só na sua vez
      const give = Math.max(0, parseInt(trGive) || 0);
      const ask = Math.max(0, parseInt(trAsk) || 0);
      if (trMine.length === 0 && trTheirs.length === 0 && give === 0 && ask === 0) return;
      g.trade = { from, to: trPartner, offerProps: trMine, askProps: trTheirs, offerMoney: give, askMoney: ask, ts: Date.now() };
      addLog(g, `🔁 ${g.players[from].name} propôs uma troca para ${g.players[trPartner].name}.`);
    });

  const respondTrade = (accept) =>
    act((g) => {
      const t = g.trade;
      if (!t) return;
      const meI = g.players.findIndex((p) => p.id === pid);
      if (!accept) {
        if (meI !== t.to && meI !== t.from) return;
        addLog(g, `🔁 Troca ${meI === t.from ? "cancelada por" : "recusada por"} ${g.players[meI].name}.`);
        g.trade = null;
        return;
      }
      if (meI !== t.to) return;
      settleTrade(g);
    });

  const endTurn = () =>
    act((g) => {
      g.turn = { phase: "roll", doubles: 0, canBuy: null };
      let n = g.currentTurn;
      do {
        n = (n + 1) % g.players.length;
      } while (g.players[n].bankrupt);
      g.currentTurn = n;
      addLog(g, `➡️ Vez de ${g.players[n].name}.`);
    });

  /* ---------- CHAT ---------- */
  const sendChat = async (forceText) => {
    const txt = (forceText != null ? forceText : chatText).trim();
    if (!txt || !game || !me) return;
    if (forceText == null) setChatText("");
    try {
      let arr = [];
      try {
        const r = await window.storage.get(CHATKEY(game.code), true);
        arr = r ? JSON.parse(r.value) : [];
      } catch (e) {}
      const dest = chatTo !== "all" ? chatTo : null;
      const destP = dest ? game.players.find((p) => p.id === dest) : null;
      arr.push({ pid, n: me.name, t: txt.slice(0, 200), ts: Date.now(), to: dest, toN: destP ? destP.name : null });
      const trimmed = arr.slice(-80);
      await window.storage.set(CHATKEY(game.code), JSON.stringify(trimmed), true);
      setChatMsgs(trimmed);
    } catch (e) {}
  };

  /* relógio para os timers de inatividade */
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  /* joga automaticamente por humanos ausentes; expira trocas sem resposta */
  useEffect(() => {
    const g = gameRef.current;
    if (!g || busy || g.status !== "playing") return;
    if (g.trade && g.host === pid && !g.players[g.trade.to].bot && nowTs - (g.trade.ts || 0) > TIMER_TRADE) {
      act((gg) => {
        if (gg.trade && Date.now() - (gg.trade.ts || 0) > TIMER_TRADE) {
          addLog(gg, "🔁 A proposta de troca expirou por falta de resposta.");
          gg.trade = null;
        }
      });
      return;
    }
    const dl = turnDeadline(g);
    if (!dl) return;
    const p = g.players[g.currentTurn];
    /* o próprio jogador age na hora; o anfitrião cobre com 6s de folga se o aparelho dele sumiu */
    const grace = p.id === pid ? 0 : g.host === pid ? 6000 : null;
    if (grace == null || nowTs < dl.at + grace) return;
    if (dl.action === "roll") {
      if (p.inJail) tryJailRoll();
      else rollDice();
    } else if (dl.action === "buy") {
      skipBuy();
    } else {
      endTurn();
    }
  }, [nowTs, busy, pid]);

  /* PILOTO AUTOMÁTICO: quando ligado, joga tudo sozinho na minha vez (sem esperar timer) */
  useEffect(() => {
    if (!autoPlay || !game || game.status !== "playing" || busy) return;
    const g = gameRef.current;
    const mi = g.players.findIndex((p) => p.id === pid);
    if (mi < 0 || g.currentTurn !== mi) return;
    const me2 = g.players[mi];
    if (me2.bankrupt) return;
    const t = setTimeout(() => {
      const gg = gameRef.current;
      if (!gg || gg.status !== "playing" || gg.currentTurn !== mi || busy) return;
      const p = gg.players[mi];
      // dívida: vende do mais barato; se nada, agiota; senão, falência
      if (gg.turn.phase === "debt" && gg.debt && gg.debt.who === mi) {
        let pick = -1;
        for (const [k, v] of Object.entries(gg.props))
          if (v.owner === mi && (pick === -1 || priceOf(BOARD[+k]) < priceOf(BOARD[pick]))) pick = +k;
        if (pick >= 0) return sellProp(pick);
        if (!(p.debtShark > 0)) return takeLoan("shark", 1000);
        return declareBankruptcy();
      }
      if (p.inJail && gg.turn.phase === "roll") return p.money >= 200 ? payJail() : tryJailRoll();
      if (gg.turn.phase === "roll") return rollDice();
      if (gg.turn.canBuy != null) {
        const price = buyPriceOf(gg, gg.turn.canBuy);
        return p.money - price >= 120 ? buyProp() : skipBuy();
      }
      if (gg.turn.canBuild != null) {
        const own = gg.props[gg.turn.canBuild];
        const cost = nextBuildCost(gg.turn.canBuild, own ? own.houses || 0 : 0);
        if (own && p.money - cost >= 250) return buildHouse();
      }
      endTurn();
    }, 900);
    return () => clearTimeout(t);
  }, [autoPlay, game && game.v, game && game.currentTurn, busy, pid]);

  /* ---------- EXECUTOR DA IA (no aparelho do anfitrião) ---------- */
  useEffect(() => {
    if (!game || game.status !== "playing" || game.host !== pid || busy) return;
    const cp = game.players[game.currentTurn];
    if (!cp || !cp.bot) return;
    const t = setTimeout(() => {
      const g = gameRef.current;
      if (!g || g.status !== "playing") return;
      const p = g.players[g.currentTurn];
      if (!p || !p.bot) return;
      if (p.bankrupt) {
        endTurn();
        return;
      }
      if (g.turn.phase === "debt" && g.debt) {
        act((gg) => {
          const d = gg.debt;
          if (!d) return;
          const q = gg.players[d.who];
          if (!q || !q.bot || q.bankrupt) return;
          let pick = -1;
          Object.entries(gg.props).forEach(([k, v]) => {
            const i2 = Number(k);
            if (v.owner === d.who && (pick === -1 || investedOf(i2, v.houses) < investedOf(pick, gg.props[pick].houses))) pick = i2;
          });
          if (pick >= 0) {
            const v = gg.props[pick];
            const val = v.mort ? Math.round(priceOf(BOARD[pick]) / 4) : Math.round(investedOf(pick, v.houses) / 2);
            delete gg.props[pick];
            q.money += val;
            addLog(gg, `🏷️ ${q.name} vendeu ${BOARD[pick].name} ao banco por ${fmt(val)} para cobrir a dívida.`);
            settleDebt(gg);
          } else if (!(q.debtShark > 0) && d.amount - q.money <= 1000) {
            q.money += 1000;
            q.debtShark = Math.round(1000 * 1.3);
            q.sharkBase = 1000;
            addLog(gg, `🦈 Desesperado, ${q.name} pegou ${fmt(1000)} com o agiota.`);
            settleDebt(gg);
          } else {
            if (d.to != null) gg.players[d.to].money += q.money;
            q.money = 0;
            gg.debt = null;
            doBankrupt(gg, d.who);
          }
        });
        return;
      }
      if (p.inJail && g.turn.phase === "roll") {
        if (p.money >= 200) payJail();
        else tryJailRoll();
        return;
      }
      if (g.turn.phase === "roll") {
        rollDice();
        return;
      }
      if (g.turn.canBuy != null) {
        const price = buyPriceOf(g, g.turn.canBuy);
        if (p.money - price >= 120) buyProp();
        else skipBuy();
        return;
      }
      if (p.money < 80 && !(p.debtBank > 0)) {
        act((gg) => {
          const q = gg.players[gg.currentTurn];
          if (q && q.bot && q.money < 80 && !(q.debtBank > 0)) {
            q.money += 300;
            q.debtBank = Math.round(300 * 1.1);
            addLog(gg, `🏦 ${q.name} pegou ${fmt(300)} emprestado do banco.`);
          }
        });
        return;
      }
      if (g.turn.canBuild != null) {
        const own = g.props[g.turn.canBuild];
        const cost = nextBuildCost(g.turn.canBuild, own ? own.houses || 0 : 0);
        if (own && p.money - cost >= 250) {
          buildHouse();
          return;
        }
      }
      endTurn();
    }, 1400);
    return () => clearTimeout(t);
  }, [game && game.v, busy, pid]);

  /* IA responde a propostas de troca */
  useEffect(() => {
    if (!game || game.host !== pid || !game.trade || busy) return;
    const t = game.trade;
    const target = game.players[t.to];
    if (!target || !target.bot) return;
    const timer = setTimeout(() => {
      act((gg) => {
        const t2 = gg.trade;
        if (!t2 || !gg.players[t2.to] || !gg.players[t2.to].bot) return;
        const val = (arr) => (arr || []).reduce((a, i) => a + priceOf(BOARD[i]), 0);
        const gain = (t2.offerMoney || 0) + val(t2.offerProps);
        const cost = (t2.askMoney || 0) + val(t2.askProps);
        if (gain >= cost * 1.15 && gg.players[t2.to].money >= (t2.askMoney || 0)) {
          settleTrade(gg);
        } else {
          addLog(gg, `🤖 ${gg.players[t2.to].name} recusou a troca. "Tá achando que sou bobo?"`);
          gg.trade = null;
        }
      });
    }, 2200);
    return () => clearTimeout(timer);
  }, [game && game.v, busy, pid]);

  const visibleChat = chatMsgs.filter((m) => !m.to || m.to === pid || m.pid === pid);
  const unread = Math.max(0, visibleChat.length - seenRef.current);

  /* ============================================================
     RENDER
     ============================================================ */
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Archivo:wght@500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');
    .mb-display { font-family: 'Archivo Black', 'Arial Black', sans-serif; }
    .mb-body { font-family: 'Archivo', system-ui, sans-serif; }
    .mb-mono { font-family: 'Space Grotesk', monospace; }
    .mb-felt {
      background:
        radial-gradient(ellipse at 50% 12%, rgba(120,180,255,.14) 0%, rgba(255,255,255,0) 42%),
        repeating-linear-gradient(45deg, rgba(255,255,255,.012) 0 2px, rgba(0,0,0,0) 2px 4px),
        radial-gradient(ellipse at 50% 32%, #1E4F86 0%, #0E2F5E 52%, #061A38 100%);
      background-color: #0E2F5E;
    }
    .mb-btn { transition: transform .08s ease, filter .12s ease, box-shadow .12s ease; box-shadow: 0 3px 0 rgba(0,0,0,.25), 0 6px 14px rgba(0,0,0,.25); }
    .mb-btn:active { transform: scale(.95) translateY(2px); box-shadow: 0 1px 0 rgba(0,0,0,.25); }
    .mb-btn:hover { filter: brightness(1.08); }
    .mb-pulse { animation: mbpulse 1.6s ease-in-out infinite; }
    @keyframes mbpulse { 0%,100% { box-shadow: 0 3px 0 rgba(0,0,0,.25), 0 0 0 0 rgba(242,193,46,.6);} 50% { box-shadow: 0 3px 0 rgba(0,0,0,.25), 0 0 0 9px rgba(242,193,46,0);} }
    .mb-board { box-shadow: inset 0 0 0 3px #061A38, inset 0 0 34px rgba(0,0,0,.4), 0 18px 54px rgba(0,0,0,.55), 0 0 0 6px #2E6BB8, 0 0 0 8px #C9A227, 0 0 0 11px #061A38; }
    .mb-cell { box-shadow: inset 0 0 0 1px rgba(8,26,56,.22), inset 0 2px 3px rgba(255,255,255,.6), inset 0 -2px 4px rgba(8,26,56,.16); transition: transform .14s ease, filter .15s ease, box-shadow .14s ease; }
    .mb-cell:hover { transform: scale(1.15); z-index: 25; box-shadow: 0 10px 24px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.5); }
    .mb-cell:active { filter: brightness(.93); }
    .mb-band { position: relative; }
    .mb-band::after { content:''; position:absolute; inset:0; background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,0) 55%, rgba(0,0,0,.12)); pointer-events:none; }
    .mb-glow { animation: mbglow 1.4s ease-in-out infinite; }
    @keyframes mbglow { 0%,100% { box-shadow: inset 0 0 0 2px rgba(242,193,46,.95), 0 0 12px rgba(242,193,46,.65);} 50% { box-shadow: inset 0 0 0 2px rgba(242,193,46,.4), 0 0 3px rgba(242,193,46,.2);} }
    .mb-pin { transition: left .16s ease-in-out, top .16s ease-in-out; will-change: left, top; }
    .mb-pin-body { width:100%; height:100%; border-radius:9999px 9999px 9999px 2px; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at 35% 30%, #ffffff, #E8E2D2 70%); box-shadow:0 4px 8px rgba(0,0,0,.45), inset 0 1px 2px rgba(255,255,255,.9); }
    .mb-pin-face { transform: rotate(45deg); }
    @keyframes mbhop { 0% { transform: translateY(0) scale(1,1); } 35% { transform: translateY(-58%) scale(.92,1.08); } 70% { transform: translateY(4%) scale(1.1,.88); } 100% { transform: translateY(0) scale(1,1); } }
    .mb-hop { animation: mbhop .17s ease-in-out; }
    @keyframes mbroll { 0% { transform: rotate(0) scale(1); } 25% { transform: rotate(-18deg) scale(1.25); } 50% { transform: rotate(14deg) scale(.95); } 75% { transform: rotate(-9deg) scale(1.12); } 100% { transform: rotate(0) scale(1); } }
    .mb-rolling { animation: mbroll .55s ease-in-out; }
    .mb-die { display:inline-flex; align-items:center; justify-content:center; background:linear-gradient(160deg,#ffffff,#E9E4D6); color:#1A1A1A; border-radius:18%; box-shadow:0 4px 10px rgba(0,0,0,.35), inset 0 -3px 5px rgba(0,0,0,.12), inset 0 2px 3px rgba(255,255,255,.9); }
    @keyframes mbfall { 0% { transform: translateY(-8vh) rotate(0); opacity:1; } 100% { transform: translateY(108vh) rotate(720deg); opacity:.85; } }
    .mb-confetti { position: fixed; top:0; width:9px; height:15px; z-index:60; pointer-events:none; animation: mbfall linear infinite; }
    @keyframes mbcardin { 0% { transform: translateY(14px) scale(.96); opacity:0; } 100% { transform: translateY(0) scale(1); opacity:1; } }
    .mb-cardin { animation: mbcardin .3s ease-out; }
    @keyframes mbflip { 0% { transform: perspective(900px) rotateY(95deg) scale(.7); opacity:0; } 60% { transform: perspective(900px) rotateY(-12deg) scale(1.04); opacity:1; } 100% { transform: perspective(900px) rotateY(0) scale(1); } }
    .mb-flip { animation: mbflip .65s cubic-bezier(.2,.8,.3,1); }
    @keyframes mbfloat { 0% { transform: translateY(0); opacity:1; } 100% { transform: translateY(-26px); opacity:0; } }
    .mb-float { animation: mbfloat 1.5s ease-out forwards; position:absolute; right:8px; top:4px; font-weight:800; pointer-events:none; }
    @keyframes mbshine { 0% { filter: drop-shadow(0 0 0 rgba(242,193,46,0)); } 50% { filter: drop-shadow(0 0 10px rgba(242,193,46,.55)); } 100% { filter: drop-shadow(0 0 0 rgba(242,193,46,0)); } }
    .mb-logo { animation: mbshine 4s ease-in-out infinite; }
    @media (prefers-reduced-motion: reduce) {
      .mb-pulse,.mb-glow,.mb-hop,.mb-rolling,.mb-confetti,.mb-cardin,.mb-flip,.mb-float,.mb-logo { animation: none; }
      .mb-pin,.mb-cell { transition: none; }
      .mb-cell:hover { transform: none; }
    }
  `;

  /* ---------- TELA INICIAL ---------- */
  if (screen === "home") {
    return (
      <div className="mb-felt mb-body min-h-screen flex items-center justify-center p-4 text-white">
        <style>{css}</style>
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <Logo w={250} dark />
            <p className="mt-2 text-sm opacity-80 text-center">Compre os pontos turísticos do país. Negocie, construa, domine. 🇧🇷</p>
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#FBF5E9", color: "#1A1A1A" }}>
            <label className="block text-xs font-bold uppercase tracking-wide mb-1 opacity-70">Seu nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 14))}
              placeholder="Ex.: Guilherme"
              className="w-full rounded-lg border-2 border-gray-300 px-3 py-2 mb-4 mb-body font-semibold focus:outline-none focus:border-green-700"
            />
            <label className="block text-xs font-bold uppercase tracking-wide mb-1 opacity-70">Seu peão</label>
            <div className="flex gap-2 mb-5">
              {TOKENS.map((t, i) => (
                <button key={i} onClick={() => setTokenIdx(i)} className={`mb-btn text-2xl w-11 h-11 rounded-xl flex items-center justify-center border-2 ${tokenIdx === i ? "border-green-700 bg-green-100" : "border-gray-200 bg-white"}`}>
                  {t}
                </button>
              ))}
            </div>

            <button onClick={createGame} disabled={busy} className="mb-btn w-full rounded-xl py-3 mb-3 font-bold text-white text-lg" style={{ background: "linear-gradient(160deg,#15543E,#0B3D2E)" }}>
              Criar partida
            </button>

            <div className="flex gap-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 4))}
                placeholder="CÓDIGO"
                className="mb-mono flex-1 rounded-lg border-2 border-gray-300 px-3 py-2 text-center text-lg tracking-widest font-bold focus:outline-none focus:border-green-700"
              />
              <button onClick={joinGame} disabled={busy} className="mb-btn rounded-xl px-5 font-bold text-white" style={{ background: "linear-gradient(160deg,#EE5050,#C22B2B)" }}>
                Entrar
              </button>
            </div>
            {err && <p className="text-red-600 text-sm font-semibold mt-3">{err}</p>}
          </div>
          <p className="text-center text-xs opacity-60 mt-4">2 a 6 jogadores (humanos ou IA) · sozinho? Adicione IAs na sala · as IAs jogam pelo aparelho do anfitrião</p>
        </div>
      </div>
    );
  }

  /* ---------- LOBBY ---------- */
  if (screen === "lobby" && game) {
    const isHost = game.host === pid;
    return (
      <div className="mb-felt mb-body min-h-screen flex items-center justify-center p-4 text-white">
        <style>{css}</style>
        <div className="w-full max-w-md">
          <div className="text-center mb-5">
            <div className="flex justify-center"><Logo w={170} dark /></div>
            <p className="text-sm opacity-80 mt-1">Compartilhe com seus amigos</p>
            <div className="mb-mono text-6xl font-bold tracking-widest mt-2 rounded-2xl py-3" style={{ background: "rgba(0,0,0,.25)", color: "#FBF5E9" }}>
              {game.code}
            </div>
            <button
              onClick={() => {
                const link = `${window.location.origin}${window.location.pathname}?sala=${game.code}`;
                navigator.clipboard.writeText(link);
                const btn = document.getElementById("copy-link-btn");
                if (btn) {
                  const oldText = btn.innerHTML;
                  btn.innerHTML = "Copiado! 📋";
                  btn.style.background = "#15543E";
                  setTimeout(() => {
                    btn.innerHTML = oldText;
                    btn.style.background = "rgba(255,255,255,0.12)";
                  }, 2000);
                }
              }}
              id="copy-link-btn"
              className="mt-2 text-xs font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: "rgba(255,255,255,0.12)", color: "#FBF5E9" }}
            >
              Copiar Link de Convite 🔗
            </button>
          </div>

          {/* PAINEL DE BOOSTS */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "linear-gradient(135deg, #1E3A8A, #3B82F6)", color: "#FFF" }}>
            <h3 className="font-bold text-sm text-center mb-2">🚀 ADQUIRIR VANTAGEM NO JOGO (BOOST PIX)</h3>
            <p className="text-xs opacity-90 text-center mb-3">Compre um boost opcional para começar a partida com mais dinheiro!</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "bronze", name: "Bronze", price: "R$ 0,10", bonus: "+R$ 5.000", bg: "linear-gradient(135deg, #A77044, #734A26)" },
                { id: "prata", name: "Prata", price: "R$ 0,20", bonus: "+R$ 10.000", bg: "linear-gradient(135deg, #DCE2E7, #8A95A5)" },
                { id: "ouro", name: "Ouro", price: "R$ 0,30", bonus: "+R$ 20.000", bg: "linear-gradient(135deg, #F9D04F, #D29B12)" },
              ].map((b) => {
                const myPlayerObj = game.players.find(p => p.id === pid);
                const hasThisBoost = myPlayerObj && myPlayerObj.boost === b.id;
                const isClicking = clickedBoost === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSelectBoost(b.id)}
                    className={`flex flex-col items-center justify-between p-2 rounded-xl text-center border-2 transition-all relative overflow-hidden hover:scale-105 active:scale-95 ${isClicking ? 'animate-pulse' : ''}`}
                    style={{
                      background: b.bg,
                      borderColor: hasThisBoost ? "#FFF" : isClicking ? "#FFD700" : "transparent",
                      boxShadow: hasThisBoost ? "0 0 12px rgba(255,255,255,0.8)" : isClicking ? "0 0 20px rgba(255,215,0,0.8)" : "none",
                      transform: hasThisBoost ? "scale(1.05)" : isClicking ? "scale(1.1)" : "scale(1)",
                    }}
                  >
                    {isClicking && (
                      <span className="absolute inset-0 bg-white opacity-30 animate-ping rounded-xl"></span>
                    )}
                    <span className="font-bold text-xs uppercase tracking-wider relative z-10">{b.name}</span>
                    <span className="text-[10px] opacity-80 mt-0.5 relative z-10">{b.price}</span>
                    <span className="font-extrabold text-xs mt-1 relative z-10">{b.bonus}</span>
                    {hasThisBoost && (
                      <span className="absolute top-1 right-1 text-[10px] z-10">✅</span>
                    )}
                    {isClicking && (
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl z-20 animate-bounce">⚡</span>
                    )}
                  </button>
                );
              })}
            </div>
            {(() => {
              const myPlayerObj = game.players.find(p => p.id === pid);
              if (myPlayerObj && myPlayerObj.boost) {
                return (
                  <p className="text-center text-xs font-bold mt-2 text-yellow-300">
                    Você ativou o Boost {myPlayerObj.boost.toUpperCase()}! Começará com +R$ {myPlayerObj.boost === "bronze" ? "5.000" : myPlayerObj.boost === "prata" ? "10.000" : "20.000"}.
                  </p>
                );
              }
              return null;
            })()}
          </div>

          <div className="rounded-2xl p-5" style={{ background: "#FBF5E9", color: "#1A1A1A" }}>
            <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-2">Jogadores ({game.players.length}/6)</div>
            {game.players.map((p) => (
              <div key={p.id} className="flex items-center gap-2 py-2 border-b border-gray-200 last:border-0">
                <span className="text-2xl">{TOKENS[p.token]}</span>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{p.name}</span>
                    {p.id === pid && <span className="text-xs opacity-60">(você)</span>}
                  </div>
                  {p.boost && (
                    <span className="text-[10px] font-bold text-blue-700">
                      🚀 Boost {p.boost.toUpperCase()} (+{p.boost === "bronze" ? "5k" : p.boost === "prata" ? "10k" : "20k"})
                    </span>
                  )}
                </div>
                {p.bot ? (
                  <>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#F58A1F" }}>🤖 IA</span>
                    {isHost && (
                      <button onClick={() => removeBot(p.id)} className="text-red-600 font-bold px-2" title="Remover IA">✕</button>
                    )}
                  </>
                ) : (
                  <>
                    {p.ready ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-full text-white animate-pulse" style={{ background: "#15543E" }}>
                        ✅ PRONTO
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: "#FDE68A", color: "#92400E" }}>
                        ⏳ Aguardando
                      </span>
                    )}
                  </>
                )}
                {game.host === p.id && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#E0E0E0", color: "#666" }}>HOST</span>}
              </div>
            ))}
            {isHost && game.players.length < 6 && (
              <button onClick={addBot} disabled={busy} className="mb-btn w-full rounded-xl py-2.5 mt-3 font-bold border-2 border-dashed" style={{ borderColor: "#F58A1F", color: "#C26508" }}>
                + Adicionar jogador IA 🤖
              </button>
            )}

            {/* Botão "Estou Pronto" para jogadores humanos */}
            {!game.players.find(p => p.id === pid)?.bot && (
              <button
                onClick={toggleReady}
                disabled={busy}
                className={`mb-btn w-full rounded-xl py-3 mt-3 font-bold text-white text-base transition-all ${game.players.find(p => p.id === pid)?.ready ? 'opacity-60' : 'mb-pulse'}`}
                style={{ background: game.players.find(p => p.id === pid)?.ready ? "linear-gradient(160deg,#15543E,#0B3D2E)" : "linear-gradient(160deg,#F59E0B,#D97706)" }}
              >
                {game.players.find(p => p.id === pid)?.ready ? "✅ Você está pronto! (Clique para cancelar)" : "🎯 Marcar como PRONTO"}
              </button>
            )}

            {/* Aviso sobre boost */}
            {!game.players.find(p => p.id === pid)?.ready && (
              <p className="text-center text-xs mt-2 opacity-60 italic">
                💡 Compre seu boost (se quiser) e clique em "PRONTO"
              </p>
            )}

            {(() => {
              const humanPlayers = game.players.filter(p => !p.bot);
              const readyHumans = humanPlayers.filter(p => p.ready);
              const allHumansReady = humanPlayers.length > 0 && humanPlayers.every(p => p.ready);

              if (isHost) {
                return (
                  <>
                    {humanPlayers.length > 0 && !allHumansReady && (
                      <div className="mt-3 p-3 rounded-lg text-center text-xs font-semibold" style={{ background: "#FEF3C7", color: "#92400E" }}>
                        ⏳ Aguardando {humanPlayers.length - readyHumans.length} jogador(es) marcar como PRONTO
                      </div>
                    )}
                    <button
                      onClick={startGame}
                      disabled={busy || game.players.length < 2 || !allHumansReady}
                      className={`mb-btn w-full rounded-xl py-3 mt-4 font-bold text-white text-lg ${(game.players.length < 2 || !allHumansReady) ? "opacity-40" : "mb-pulse"}`}
                      style={{ background: "linear-gradient(160deg,#EE5050,#C22B2B)" }}
                    >
                      {game.players.length < 2 ? "Adicione jogadores para começar" : !allHumansReady ? "Aguardando todos marcarem PRONTO..." : "🎮 INICIAR PARTIDA"}
                    </button>
                  </>
                );
              } else {
                return (
                  <p className="text-center text-sm mt-4 opacity-70">
                    {allHumansReady ? "✅ Todos prontos! Aguardando anfitrião iniciar..." : "⏳ Aguardando jogadores marcarem PRONTO..."}
                  </p>
                );
              }
            })()}
          </div>
          <button onClick={leaveToHome} className="block mx-auto mt-4 text-sm underline opacity-70">Sair da sala</button>

          {/* MODAL: Checkout PIX Mercado Pago - LOBBY */}
          {pixModal.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: "rgba(0,0,0,.65)" }} onClick={() => setPixModal(prev => ({ ...prev, show: false }))}>
              <div className="w-full max-w-sm rounded-2xl p-5 text-center" style={{ background: "#FBF5E9", color: "#1A1A1A", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
                <h3 className="font-bold text-lg mb-1 text-blue-800">⚡ Pagamento do Boost ({pixModal.boost?.toUpperCase()})</h3>
                <p className="text-xs opacity-75 mb-3">O bônus de <b>+R$ {pixModal.bonus.toLocaleString("pt-BR")}</b> será creditado ao iniciar a partida!</p>

                <div className="bg-white p-3 rounded-xl inline-block mb-3 border-2 border-dashed border-blue-400">
                  {pixModal.status === "loading" ? (
                    <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                      <span className="text-sm font-bold text-blue-800">Gerando QR Code...</span>
                      <span className="text-[10px] opacity-60 mt-1 animate-pulse">Aguarde alguns segundos</span>
                    </div>
                  ) : pixModal.qrCodeBase64 ? (
                    <img src={`data:image/png;base64,${pixModal.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                  ) : (
                    <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                      <span className="text-4xl mb-1">📱</span>
                      <span className="text-xs font-bold px-2 text-center">QR CODE PIX SIMULADO</span>
                      <span className="text-[9px] opacity-75 mt-1">(Modo de Desenvolvimento)</span>
                    </div>
                  )}
                </div>

                <div className="text-sm font-bold text-green-700 mb-2">Valor: R$ {pixModal.amount?.toFixed(2)}</div>

                {pixModal.status !== "loading" && (
                  <div className="mb-3 text-left">
                    <label className="text-[10px] font-bold opacity-60 uppercase">Código PIX Copia e Cola:</label>
                    <div className="flex gap-1 mt-0.5">
                      <input
                        readOnly
                        value={pixModal.qrCode || ""}
                        onClick={(e) => e.target.select()}
                        className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-gray-50 font-mono truncate"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pixModal.qrCode);
                          alert("Código PIX copiado! Cole no app do seu banco.");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-bold rounded-lg"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {pixModal.status === "loading" ? (
                  <p className="text-xs text-blue-700 font-semibold mb-3 animate-pulse">
                    ⚡ Conectando com Mercado Pago...
                  </p>
                ) : pixModal.simulation ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                    <p className="text-[10px] text-yellow-700 font-semibold mb-2 leading-tight">
                      💡 O servidor está sem credenciais do Mercado Pago ou fora do ar. Use a simulação abaixo para testar o boost de graça!
                    </p>
                    <button
                      onClick={simulatePixPayment}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-sm py-2 rounded-xl shadow-lg transition-all"
                    >
                      Simular Pagamento PIX 🤝
                    </button>
                  </div>
                ) : (
                  <p className="text-[10px] opacity-60 animate-pulse mb-3">
                    ⏳ Aguardando confirmação do pagamento... O boost ativa automaticamente ao pagar.
                  </p>
                )}

                <button
                  onClick={() => setPixModal(prev => ({ ...prev, show: false }))}
                  className="w-full border-2 border-gray-400 text-gray-700 font-bold py-2 rounded-xl text-sm"
                >
                  Voltar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- JOGO ---------- */
  if ((screen === "game" || (game && game.status !== "lobby")) && game) {
    const g = game;
    const canBuySq = isMyTurn && g.turn && g.turn.canBuy != null ? BOARD[g.turn.canBuy] : null;
    const trade = g.trade;
    const dl = turnDeadline(g);
    const secsLeft = dl ? Math.max(0, Math.ceil((dl.at - nowTs) / 1000)) : null;

    return (
      <div className="mb-felt mb-body min-h-screen text-white pb-8">
        <style>{css}</style>

        {/* topo */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 max-w-3xl mx-auto">
          <Logo w={120} dark />
          <div className="flex items-center gap-3">
            <button onClick={toggleMute} className="text-xl leading-none" title={muted ? "Ativar som" : "Silenciar"}>{muted ? "🔇" : "🔊"}</button>
            <div className="mb-mono text-sm opacity-80">sala {g.code}</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-2">
          {/* TABULEIRO */}
          <div className="mb-board relative w-full aspect-square rounded-2xl overflow-hidden" style={{ display: "grid", gridTemplateColumns: "repeat(11, 1fr)", gridTemplateRows: "repeat(11, 1fr)", gap: "1px", background: "#061A38" }}>
            {BOARD.map((sq, i) => {
              const { r, c } = posToCell(i);
              const own = g.props[i];
              const abandoned = own && own.owner === -1;
              const ownerColor = own && own.owner >= 0 ? COLORS[g.players[own.owner].token] : null;
              const curHere = curPlayer && !curPlayer.bankrupt && (dispPos[curPlayer.id] != null ? dispPos[curPlayer.id] : curPlayer.pos) === i;
              const art = ART[i];
              const BG = {
                sorte: "linear-gradient(160deg,#FCE9A8,#E8B43E)",
                tax: "linear-gradient(160deg,#EEEAE0,#DBD3C1)",
                go: "linear-gradient(150deg,#46BC74,#1E7A46)",
                jail: "linear-gradient(160deg,#DCE6ED,#B4C5D2)",
                free: "linear-gradient(160deg,#FCDC66,#E9A91B)",
                gojail: "linear-gradient(150deg,#EE6060,#BE2828)",
              };
              const ICON = { sorte: "❓", tax: "💸", go: "🛫", jail: "🚔", free: "🏖️", gojail: "🚨" };
              const dark = sq.t === "go" || sq.t === "gojail";
              const lvl = own ? own.houses || 0 : 0;
              const cellBg = art
                ? `linear-gradient(180deg, ${art.sky[0]}, ${art.sky[1]} 70%, ${art.gr} 70%)`
                : BG[sq.t] || "linear-gradient(160deg,#FFFDF6,#F1E8D4)";
              return (
                <button
                  key={i}
                  onClick={() => setCellInfo(i)}
                  style={{
                    gridRow: r + 1,
                    gridColumn: c + 1,
                    background: cellBg,
                    ...(own && own.mort ? { filter: "grayscale(.85) brightness(.9)" } : {}),
                    ...(ownerColor ? { boxShadow: `inset 0 0 0 2px ${ownerColor}, inset 0 2px 3px rgba(255,255,255,.5)` } : {}),
                  }}
                  className={`mb-cell relative flex flex-col items-stretch overflow-hidden text-left ${curHere ? "mb-glow" : ""}`}
                >
                  {/* arte de fundo da propriedade */}
                  {art && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ fontSize: "min(4.4vw,22px)", opacity: 0.5, transform: "translateY(8%)" }}>
                      {art.e}
                    </div>
                  )}
                  {sq.g && (
                    <div style={{ background: GROUPS[sq.g].c, height: "30%" }} className="mb-band w-full flex items-center justify-center relative z-10">
                      {lvl > 0 && (
                        <div className="relative z-10 flex items-center justify-center gap-px w-full h-full">
                          {lvl <= 4
                            ? Array.from({ length: lvl }).map((_, k) => (
                                <span key={k} style={{ width: "15%", height: "54%", background: "linear-gradient(180deg,#3FD37E,#127A45)", borderRadius: 2, boxShadow: "0 1px 1px rgba(0,0,0,.5)" }} />
                              ))
                            : Array.from({ length: lvl - 4 }).map((_, k) => (
                                <span key={k} style={{ width: "20%", height: "60%", background: "linear-gradient(180deg,#F05A4A,#9A1409)", borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,.5)" }} />
                              ))}
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`relative z-10 flex-1 flex flex-col items-center justify-center px-px ${dark ? "text-white" : "text-gray-900"}`}>
                    {ICON[sq.t] && <span style={{ fontSize: "min(3vw, 15px)", lineHeight: 1, filter: "drop-shadow(0 1px 1px rgba(0,0,0,.25))" }}>{ICON[sq.t]}</span>}
                    <span className="font-bold text-center leading-tight" style={{ fontSize: "min(1.5vw, 8px)", textShadow: art ? "0 1px 2px rgba(255,255,255,.85), 0 -1px 2px rgba(255,255,255,.85)" : dark ? "0 1px 2px rgba(0,0,0,.4)" : "none" }}>
                      {sq.short || sq.name}
                    </span>
                    {priceOf(sq) > 0 && (
                      <span className="mb-mono font-bold" style={{ fontSize: "min(1.4vw, 7px)", color: "#fff", background: "linear-gradient(180deg,#2E6BB8,#16407E)", borderRadius: 3, padding: "0 4px", boxShadow: "0 1px 2px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.3)" }}>
                        {abandoned ? investedOf(i, own.houses) : priceOf(sq)}
                      </span>
                    )}
                  </div>
                  {abandoned && (
                    <span className="absolute z-20" style={{ left: "4%", bottom: "4%", fontSize: "min(2.4vw,12px)" }}>🏦</span>
                  )}
                  {own && own.mort && (
                    <span className="absolute z-20" style={{ left: "4%", bottom: "4%", fontSize: "min(2.4vw,12px)" }}>🔒</span>
                  )}
                  {ownerColor && (
                    <span className="absolute z-20" style={{ right: "4%", bottom: "4%", width: "min(2vw,10px)", height: "min(2vw,10px)", borderRadius: 9999, background: ownerColor, border: "1.5px solid #fff", boxShadow: "0 1px 2px rgba(0,0,0,.4)" }} />
                  )}
                </button>
              );
            })}

            {/* centro — placa azul brilhante estilo tabuleiro comercial */}
            <div style={{ gridRow: "2 / 11", gridColumn: "2 / 11", background: "radial-gradient(ellipse at 50% 30%, #3D7AC4 0%, #1E4F86 45%, #0E2F5E 100%)" }} className="flex flex-col items-center justify-center relative overflow-hidden">
              {/* losango/placa central com brilho */}
              <div className="absolute" style={{ width: "78%", height: "78%", transform: "rotate(45deg)", borderRadius: "10%", background: "linear-gradient(135deg, rgba(120,175,235,.45), rgba(14,47,94,.15))", boxShadow: "inset 0 0 40px rgba(255,255,255,.18), inset 0 0 0 2px rgba(201,162,39,.55), 0 0 30px rgba(0,0,0,.35)" }} />
              <div className="absolute" style={{ width: "60%", height: "60%", transform: "rotate(45deg)", borderRadius: "10%", border: "1px solid rgba(255,255,255,.22)" }} />
              {/* reflexo diagonal */}
              <div className="absolute pointer-events-none" style={{ inset: 0, background: "linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,.16) 48%, rgba(255,255,255,0) 56%)" }} />
              <div className="relative z-10 flex flex-col items-center" style={{ transform: "rotate(-4deg)" }}>
                <Logo w={Math.min(196, 999)} dark />
              </div>
              {g.dice && (
                <div className={`relative z-10 mt-2 flex gap-2 ${rolling ? "mb-rolling" : ""}`}>
                  <span className="mb-die" style={{ width: "min(10vw, 52px)", height: "min(10vw, 52px)", fontSize: "min(9vw, 46px)", lineHeight: 1 }}>{DICE_FACES[g.dice[0] - 1]}</span>
                  <span className="mb-die" style={{ width: "min(10vw, 52px)", height: "min(10vw, 52px)", fontSize: "min(9vw, 46px)", lineHeight: 1 }}>{DICE_FACES[g.dice[1] - 1]}</span>
                </div>
              )}
              {curPlayer && g.status === "playing" && (
                <div className="relative z-10 mt-2 font-bold text-center px-3 py-1 rounded-full" style={{ fontSize: "min(2.8vw, 12px)", color: "#FBF5E9", background: "rgba(6,26,56,.55)", border: "1px solid rgba(201,162,39,.5)" }}>
                  Vez de {TOKENS[curPlayer.token]} {curPlayer.name}
                </div>
              )}
              {g.status === "ended" && g.winner != null && (
                <div className="relative z-10 mt-2 text-center px-2 font-bold" style={{ color: "#FFE9A0", fontSize: "min(3.4vw, 15px)" }}>
                  🏆 {g.players[g.winner].name} venceu!
                </div>
              )}
            </div>

            {/* PINOS */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
              {g.players.filter((p) => !p.bankrupt).map((p) => {
                const pos = dispPos[p.id] != null ? dispPos[p.id] : p.pos;
                const { r, c } = posToCell(pos);
                const mates = g.players.filter((q) => !q.bankrupt && (dispPos[q.id] != null ? dispPos[q.id] : q.pos) === pos);
                const k = mates.findIndex((q) => q.id === p.id);
                const offs = [[0, 0], [42, -22], [-42, -22], [42, 22], [-42, 22], [0, -44]][k] || [0, 0];
                const isCur = curPlayer && curPlayer.id === p.id && g.status === "playing";
                return (
                  <div
                    key={p.id}
                    className="mb-pin absolute"
                    style={{
                      left: `${((c + 0.5) / 11) * 100}%`,
                      top: `${((r + 0.5) / 11) * 100}%`,
                      width: "min(6vw, 32px)",
                      height: "min(6vw, 32px)",
                      marginLeft: "calc(min(6vw, 32px) / -2)",
                      marginTop: "calc(min(6vw, 32px) * -0.8)",
                      transform: `translate(${offs[0]}%, ${offs[1]}%)`,
                      zIndex: isCur ? 5 : 2,
                      filter: isCur ? "drop-shadow(0 0 6px rgba(242,193,46,.95))" : "drop-shadow(0 2px 3px rgba(0,0,0,.35))",
                    }}
                  >
                    <div key={pos} className="mb-hop w-full h-full">
                      <div className="mb-pin-body" style={{ border: `2.5px solid ${COLORS[p.token]}` }}>
                        <span className="mb-pin-face" style={{ fontSize: "min(3.2vw, 16px)", lineHeight: 1 }}>{TOKENS[p.token]}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PROPOSTA DE TROCA ATIVA */}
          {trade && (() => {
            const A = g.players[trade.from];
            const B = g.players[trade.to];
            const namesOf = (arr) => (arr || []).map((i) => BOARD[i].name).join(", ");
            return (
              <div className="mb-cardin mt-3 rounded-xl p-4" style={{ background: "linear-gradient(160deg,#FFFDF6,#F1E8D4)", color: "#1A1A1A", boxShadow: "0 8px 20px rgba(0,0,0,.35)", borderLeft: "6px solid #2456C4" }}>
                <div className="font-bold mb-1">🔁 Proposta de troca</div>
                <div className="text-sm">
                  <b>{A.name}</b> oferece: {namesOf(trade.offerProps) || "nada"}{(trade.offerMoney || 0) > 0 ? ` + ${fmt(trade.offerMoney)}` : ""}
                  <br />
                  e pede de <b>{B.name}</b>: {namesOf(trade.askProps) || "nada"}{(trade.askMoney || 0) > 0 ? ` + ${fmt(trade.askMoney)}` : ""}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {me && B.id === pid && (
                    <>
                      <button onClick={() => respondTrade(true)} disabled={busy} className="mb-btn rounded-xl px-4 py-2 font-bold text-white" style={{ background: "linear-gradient(160deg,#15543E,#0B3D2E)" }}>Aceitar 🤝</button>
                      <button onClick={() => openTrade(true)} disabled={busy} className="mb-btn rounded-xl px-4 py-2 font-bold text-white" style={{ background: "linear-gradient(160deg,#F58A1F,#C26508)" }}>Contraproposta</button>
                      <button onClick={() => respondTrade(false)} disabled={busy} className="mb-btn rounded-xl px-4 py-2 font-bold border-2 border-gray-400">Recusar</button>
                    </>
                  )}
                  {me && A.id === pid && (
                    <button onClick={() => respondTrade(false)} disabled={busy} className="mb-btn rounded-xl px-4 py-2 font-bold border-2 border-gray-400">Cancelar proposta</button>
                  )}
                  {B.bot && <span className="text-xs opacity-60 self-center">A IA vai responder em instantes…</span>}
                  {!B.bot && trade.ts && (
                    <span className="text-xs opacity-60 self-center mb-mono">⏱ expira em {Math.max(0, Math.ceil((trade.ts + TIMER_TRADE - nowTs) / 1000))}s</span>
                  )}
                </div>
              </div>
            );
          })()}

          {/* PAINEL DE AÇÕES */}
          <div className="mt-3 rounded-2xl p-4" style={{ background: "linear-gradient(160deg,#FFFDF6,#F1E8D4)", color: "#1A1A1A", boxShadow: "0 8px 20px rgba(0,0,0,.35)" }}>
            {g.status === "ended" ? (
              <div className="text-center">
                <div className="text-xl font-bold">🏆 {g.players[g.winner].name} é o Magnata do Brasil!</div>
                <button onClick={leaveToHome} className="mb-btn mt-3 rounded-xl px-6 py-2 font-bold text-white" style={{ background: "#0B3D2E" }}>Nova partida</button>
              </div>
            ) : !me ? (
              <p className="text-sm">Você é espectador desta partida.</p>
            ) : me.bankrupt ? (
              <p className="text-sm font-semibold">💥 Você faliu. Acompanhe o fim da partida.</p>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold">
                    {isMyTurn ? `Sua vez, ${me.name}!` : `Aguardando ${curPlayer ? curPlayer.name : "…"}`}
                    {secsLeft != null && (
                      <span className="ml-2 mb-mono text-sm font-bold" style={{ color: secsLeft <= 3 ? "#C0392B" : "#8A8170" }}>⏱ {secsLeft}s</span>
                    )}
                  </span>
                  <span className="mb-mono font-bold" style={{ color: "#0B3D2E" }}>{fmt(me.money)}</span>
                </div>

                {g.debt && g.debt.who === myIdx && (
                  <div className="mb-cardin rounded-xl p-3 mb-3" style={{ background: "#FBE8E8", border: "2px solid #B3261E" }}>
                    <div className="font-bold text-sm" style={{ color: "#B3261E" }}>
                      🚨 Você deve {fmt(g.debt.amount)} {g.debt.to != null ? `a ${g.players[g.debt.to].name}` : "ao banco"} e só tem {fmt(me.money)}.
                    </div>
                    <p className="text-xs opacity-70 mt-1 mb-2">
                      Levante a grana: toque nas suas propriedades no tabuleiro para vender (metade do investido, construções contam) ou hipotecar, pegue empréstimo em 💰 Grana, ou negocie uma troca. Assim que o saldo cobrir, a dívida é paga automaticamente. Sem saída?
                    </p>
                    <button onClick={declareBankruptcy} disabled={busy} className="mb-btn rounded-xl px-4 py-2 font-bold text-white" style={{ background: "linear-gradient(160deg,#B3261E,#7A0C0C)" }}>
                      💥 Declarar falência
                    </button>
                  </div>
                )}
                {isMyTurn && me.inJail && g.turn.phase === "roll" ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button onClick={payJail} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold text-white" style={{ background: "linear-gradient(160deg,#15543E,#0B3D2E)" }}>Pagar {fmt(JAIL_FINE)} fiança</button>
                    <button onClick={tryJailRoll} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold text-white" style={{ background: "linear-gradient(160deg,#EE5050,#C22B2B)" }}>Tentar dupla 🎲</button>
                  </div>
                ) : isMyTurn ? (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {g.turn.phase === "roll" && (
                      <button onClick={rollDice} disabled={busy} className="mb-btn mb-pulse rounded-xl px-5 py-2.5 font-bold text-white text-lg" style={{ background: "linear-gradient(160deg,#EE5050,#C22B2B)" }}>🎲 Jogar dados</button>
                    )}
                    {canBuySq && (
                      <>
                        <button onClick={buyProp} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold text-white" style={{ background: "linear-gradient(160deg,#15543E,#0B3D2E)" }}>
                          Comprar {canBuySq.short || canBuySq.name} ({fmt(buyPriceOf(g, g.turn.canBuy))})
                        </button>
                        <button onClick={skipBuy} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold border-2 border-gray-400">Não comprar</button>
                      </>
                    )}
                    {isMyTurn && g.turn.canBuild != null && (() => {
                      const bi = g.turn.canBuild;
                      const own2 = g.props[bi];
                      const lvl2 = own2 ? own2.houses || 0 : 0;
                      const cost2 = nextBuildCost(bi, lvl2);
                      return me.money >= cost2 ? (
                        <button onClick={buildHouse} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold text-white" style={{ background: "linear-gradient(160deg,#F58A1F,#C26508)" }}>
                          🏗️ Construir em {BOARD[bi].short || BOARD[bi].name} ({fmt(cost2)})
                        </button>
                      ) : null;
                    })()}
                    {g.turn.phase === "manage" && (
                      <button onClick={endTurn} disabled={busy} className="mb-btn rounded-xl px-4 py-2.5 font-bold border-2" style={{ borderColor: "#0B3D2E", color: "#0B3D2E" }}>Encerrar vez ➡️</button>
                    )}
                  </div>
                ) : null}

                {/* ferramentas sempre disponíveis */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-300">
                  <button onClick={() => setShowMoney(true)} className="mb-btn rounded-xl px-3 py-2 font-bold text-sm text-white" style={{ background: "linear-gradient(160deg,#2A6FD6,#1E4FA0)" }}>💰 Grana</button>
                  <button onClick={() => openTrade(false)} disabled={!!trade || !isMyTurn} className={`mb-btn rounded-xl px-3 py-2 font-bold text-sm text-white ${trade || !isMyTurn ? "opacity-40" : ""}`} style={{ background: "linear-gradient(160deg,#7A4FC2,#5A2FA0)" }} title={!isMyTurn ? "Só na sua vez" : ""}>🔁 Propor troca</button>
                  <button onClick={() => setChatOpen((o) => !o)} className="mb-btn rounded-xl px-3 py-2 font-bold text-sm text-white relative" style={{ background: "linear-gradient(160deg,#3E8F6E,#1F6F4E)" }}>
                    💬 Chat
                    {unread > 0 && !chatOpen && (
                      <span className="absolute -top-1.5 -right-1.5 text-xs font-bold rounded-full px-1.5" style={{ background: "#E03A3A", color: "#fff" }}>{unread}</span>
                    )}
                  </button>
                  <button onClick={() => setAutoPlay((a) => !a)} className="mb-btn rounded-xl px-3 py-2 font-bold text-sm text-white" style={{ background: autoPlay ? "linear-gradient(160deg,#E0922A,#B36608)" : "linear-gradient(160deg,#6B7280,#4B5563)" }} title="Joga sozinho na sua vez enquanto você estiver ausente">
                    {autoPlay ? "🤖 Piloto: LIGADO" : "🤖 Piloto auto"}
                  </button>
                </div>
                {autoPlay && (
                  <p className="text-xs font-semibold mt-2" style={{ color: "#B36608" }}>🤖 Piloto automático ligado: o jogo joga por você (rola, compra, constrói e encerra) na sua vez. Desligue para retomar o controle.</p>
                )}
                <p className="text-xs opacity-60 mt-2">Regra: construa só quando cair numa propriedade sua com o grupo de cor completo, e apenas nela (1 nível por jogada). Toque numa casa do tabuleiro para hipotecar, vender ou desfazer construções.</p>
              </div>
            )}
          </div>

          {/* JOGADORES */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {g.players.map((p, i) => (
              <div key={p.id} className={`relative rounded-xl px-3 py-2 ${p.bankrupt ? "opacity-40" : ""}`} style={{ background: "linear-gradient(160deg,#FFFDF6,#F1E8D4)", color: "#1A1A1A", boxShadow: "0 4px 10px rgba(0,0,0,.3)", border: g.currentTurn === i && g.status === "playing" ? "3px solid #F2C12E" : "3px solid transparent" }}>
                {floats[i] && (
                  <span key={floats[i].k} className="mb-float text-sm" style={{ color: floats[i].d > 0 ? "#1C7A4C" : "#C0392B" }}>
                    {floats[i].d > 0 ? "+" : "−"}{fmt(Math.abs(floats[i].d)).replace("R$ ", "R$")}
                  </span>
                )}
                <div className="flex items-center gap-1.5 font-bold text-sm truncate">
                  <span>{TOKENS[p.token]}</span>
                  <span className="truncate">{p.name}</span>
                  {p.bot && <span className="text-xs font-normal">🤖</span>}
                  {p.id === pid && <span className="text-xs font-normal opacity-60">(você)</span>}
                </div>
                <div className="mb-mono text-sm font-bold" style={{ color: "#0B3D2E" }}>{p.bankrupt ? "FALIDO" : fmt(p.money)}</div>
                <div className="text-xs opacity-70">
                  {Object.values(g.props).filter((v) => v.owner === i).length} propriedades{p.inJail ? " · 🚔 preso" : ""}
                </div>
                {(p.debtBank || 0) > 0 && <div className="text-xs font-bold" style={{ color: "#B3261E" }}>🏦 deve {fmt(p.debtBank)}</div>}
                {(p.debtShark || 0) > 0 && <div className="text-xs font-bold" style={{ color: "#B3261E" }}>🦈 deve {fmt(p.debtShark)}</div>}
              </div>
            ))}
          </div>

          {/* LOG */}
          <div className="mt-3 rounded-2xl p-4 text-sm" style={{ background: "rgba(0,0,0,.28)" }}>
            <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-2" style={{ color: "#F2C12E" }}>Diário de bordo</div>
            {(g.log || []).map((l, i) => (
              <div key={i} className={`py-0.5 ${i === 0 ? "font-bold" : "opacity-75"}`}>{l}</div>
            ))}
          </div>

          {/* CHAT (barra de acesso) */}
          <button onClick={() => setChatOpen(true)} className="mt-3 w-full flex justify-between px-4 py-3 font-bold text-sm rounded-2xl" style={{ background: "rgba(0,0,0,.28)" }}>
            <span style={{ color: "#F2C12E" }}>💬 CHAT DA MESA</span>
            <span className="opacity-80">{unread > 0 ? `${unread} nova${unread > 1 ? "s" : ""} · ` : ""}abrir ▴</span>
          </button>

          <button onClick={leaveToHome} className="block mx-auto mt-4 text-sm underline opacity-60">Sair da partida</button>
        </div>

        {/* CHAT (painel deslizante) */}
        {chatOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,.45)" }} onClick={() => setChatOpen(false)}>
            <div className="mb-cardin w-full max-w-md rounded-t-2xl p-3 pb-4" style={{ background: "#0E2A21", boxShadow: "0 -10px 30px rgba(0,0,0,.5)" }} onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="font-bold text-sm" style={{ color: "#F2C12E" }}>💬 CHAT DA MESA</span>
                <button onClick={() => setChatOpen(false)} className="font-bold text-lg opacity-80 px-2">✕</button>
              </div>
              <div ref={chatBoxRef} className="overflow-y-auto text-sm space-y-1 mb-2 px-1 rounded-lg py-2" style={{ height: 200, background: "rgba(0,0,0,.25)" }}>
                {visibleChat.length === 0 && <p className="opacity-50 text-xs px-2">Sem mensagens ainda. Provoca aí. 😏</p>}
                {visibleChat.map((m, i) => (
                  <div key={i} className="px-2">
                    <b style={{ color: m.pid === pid ? "#F2C12E" : "#9FD8C0" }}>{m.n}</b>
                    {m.to && <span className="text-xs opacity-70"> 🔒 p/ {m.to === pid ? "você" : m.toN}</span>}
                    <span>: {m.t}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1 mb-2 flex-wrap">
                {EMOJIS_CHAT.map((e) => (
                  <button key={e} onClick={() => sendChat(e)} className="text-lg rounded-lg px-1.5 py-0.5" style={{ background: "rgba(255,255,255,.12)" }}>{e}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <select value={chatTo} onChange={(e) => setChatTo(e.target.value)} className="rounded-lg px-2 py-2 text-gray-900 text-xs font-bold" style={{ maxWidth: 96 }}>
                  <option value="all">Todos</option>
                  {g.players.filter((p) => p.id !== pid && !p.bot).map((p) => (
                    <option key={p.id} value={p.id}>🔒 {p.name}</option>
                  ))}
                </select>
                <input
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendChat(); }}
                  placeholder="Mensagem…"
                  className="flex-1 min-w-0 rounded-lg px-3 py-2 text-gray-900 text-sm"
                />
                <button onClick={() => sendChat()} className="mb-btn rounded-lg px-4 font-bold text-white" style={{ background: "#15543E" }}>➤</button>
              </div>
              <p className="text-[10px] opacity-50 mt-2 px-1">As mensagens dos outros chegam em alguns segundos (sincronização automática).</p>
            </div>
          </div>
        )}

        {/* CARTA ANIMADA */}
        {cardShow && g.lastCard && (() => {
          const good = g.lastCard.good;
          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.6)" }} onClick={() => setCardShow(false)}>
            <div className="mb-flip rounded-2xl overflow-hidden text-center" style={{ width: 260, background: "#FBF5E9", boxShadow: "0 24px 60px rgba(0,0,0,.6)", border: "5px solid " + (good ? "#1C7A4C" : "#B3261E") }} onClick={(e) => e.stopPropagation()}>
              <div className="py-2.5 font-bold text-white mb-display tracking-wider text-sm" style={{ background: good ? "linear-gradient(160deg,#2EA86B,#15633F)" : "linear-gradient(160deg,#D14A3C,#8E1B12)" }}>
                {good ? "🍀 SORTE" : "💢 AZAR"}
              </div>
              <div className="flex items-center justify-center" style={{ height: 118, background: good ? "linear-gradient(180deg,#E6F7EC,#C2E9D2)" : "linear-gradient(180deg,#FBE4E1,#F0C2BC)", fontSize: 66 }}>
                {g.lastCard.e || "🎴"}
              </div>
              <div className="px-4 py-3" style={{ color: "#1A1A1A" }}>
                <div className="mb-display text-base" style={{ color: good ? "#15633F" : "#8E1B12" }}>{g.lastCard.ti || ""}</div>
                <div className="text-sm mt-1 font-semibold">{g.lastCard.txt}</div>
                <div className="text-xs opacity-60 mt-2">para {g.lastCard.player} · toque para fechar</div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* CONFETE */}
        {g.status === "ended" && CONFETTI.map((cf, i) => (
          <span key={i} className="mb-confetti" style={{ left: cf.left + "%", background: cf.color, animationDuration: cf.dur + "s", animationDelay: cf.delay + "s", borderRadius: i % 2 ? "50%" : "2px" }} />
        ))}

        {/* MODAL: detalhes da casa + gestão do patrimônio */}
        {cellInfo != null && (() => {
          const sq = BOARD[cellInfo];
          const own = g.props[cellInfo];
          const isMine = own && me && own.owner === myIdx;
          const lvl = own ? own.houses || 0 : 0;
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(0,0,0,.55)" }} onClick={() => setCellInfo(null)}>
              <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#FBF5E9", color: "#1A1A1A" }} onClick={(e) => e.stopPropagation()}>
                {sq.g && <div style={{ background: GROUPS[sq.g].c }} className="px-4 py-2 text-white font-bold text-xs uppercase tracking-wide">{GROUPS[sq.g].label}</div>}
                {ART[cellInfo] && <div className="px-3 pt-3"><Scene i={cellInfo} big /></div>}
                <div className="p-4">
                  <div className="font-bold text-lg flex items-center gap-2">{sq.name}{own && own.mort && <span className="text-sm">🔒 hipotecada</span>}</div>
                  {(sq.t === "p" || sq.t === "air" || sq.t === "util") ? (
                    <div className="text-sm mt-2 space-y-1">
                      <div>Preço: <b className="mb-mono">{fmt(priceOf(sq))}</b></div>
                      {sq.t === "p" && <div>Aluguel base: <b className="mb-mono">{fmt(sq.rent)}</b> · grupo completo: <b className="mb-mono">{fmt(sq.rent * 2)}</b></div>}
                      {sq.t === "p" && <div>Com construções (nível 1→8): <span className="mb-mono">{[1, 2, 3, 4, 5, 6, 7, 8].map((l) => fmt(sq.rent * LVLM[l]).replace("R$ ", "")).join(" · ")}</span></div>}
                      {sq.t === "p" && <div>Próximo nível: <b className="mb-mono">{lvl < 8 ? fmt(nextBuildCost(cellInfo, lvl)) : "máximo (4 hotéis)"}</b></div>}
                      {sq.t === "air" && <div>Aluguel: 25 / 50 / 100 / 200 conforme nº de aeroportos do dono</div>}
                      {sq.t === "util" && <div>Aluguel: 4× os dados (10× com as duas concessões)</div>}
                      <div>
                        Dono: {own && own.owner >= 0 ? <b>{TOKENS[g.players[own.owner].token]} {g.players[own.owner].name}</b> : own ? <b style={{ color: "#B3261E" }}>🏦 banco — à venda por {fmt(investedOf(cellInfo, own.houses))} (construções incluídas)</b> : <span className="opacity-60">à venda</span>}
                        {own && sq.t === "p" && lvl > 0 && <span> · 🏗️ nível {lvl} ({lvlLabel(lvl)})</span>}
                      </div>
                      {isMine && !me.bankrupt && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {lvl > 0 && (
                            <button onClick={() => { sellBuild(cellInfo); }} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#C26508" }}>
                              🔨 Desfazer 1 nível (+{fmt(Math.round(nextBuildCost(cellInfo, lvl - 1) / 2))})
                            </button>
                          )}
                          {lvl === 0 && !own.mort && (
                            <button onClick={() => { mortgage(cellInfo); }} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#5A2FA0" }}>
                              🔒 Hipotecar (+{fmt(Math.round(priceOf(sq) / 2))})
                            </button>
                          )}
                          {own.mort && (
                            <button onClick={() => { unmortgage(cellInfo); }} disabled={me.money < Math.round(priceOf(sq) * 0.55)} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: "#15543E" }}>
                              🔓 Resgatar (−{fmt(Math.round(priceOf(sq) * 0.55))})
                            </button>
                          )}
                          <button onClick={() => { sellProp(cellInfo); setCellInfo(null); }} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#B3261E" }}>
                            🏷️ Vender ao banco (+{fmt(own.mort ? Math.round(priceOf(sq) / 4) : Math.round(investedOf(cellInfo, lvl) / 2))})
                          </button>
                        </div>
                      )}
                    </div>
                  ) : sq.t === "tax" ? (
                    <div className="text-sm mt-2">Pague {fmt(sq.amt)} ao banco.</div>
                  ) : sq.t === "sorte" ? (
                    <div className="text-sm mt-2">Tire uma carta: pode ser <b style={{color:"#15633F"}}>Sorte</b> ou <b style={{color:"#8E1B12"}}>Azar</b>. Só dá pra saber virando! 🎴</div>
                  ) : sq.t === "go" ? (
                    <div className="text-sm mt-2">Receba {fmt(200)} ao passar. Dívidas cobram juros aqui: banco +10%, agiota +25%.</div>
                  ) : sq.t === "jail" ? (
                    <div className="text-sm mt-2">Só de visita… por enquanto.</div>
                  ) : sq.t === "gojail" ? (
                    <div className="text-sm mt-2">Vá direto para a Delegacia, sem receber os {fmt(200)}.</div>
                  ) : (
                    <div className="text-sm mt-2">Casa livre, descanse no feriado.</div>
                  )}
                  <button onClick={() => setCellInfo(null)} className="mb-btn mt-4 w-full rounded-xl py-2 font-bold text-white" style={{ background: "#0B3D2E" }}>Fechar</button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL: grana (banco + agiota) */}
        {showMoney && me && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(0,0,0,.55)" }} onClick={() => setShowMoney(false)}>
            <div className="w-full max-w-sm rounded-2xl p-4 max-h-[85vh] overflow-y-auto" style={{ background: "#FBF5E9", color: "#1A1A1A" }} onClick={(e) => e.stopPropagation()}>
              <div className="font-bold text-lg mb-1">💰 Central financeira</div>
              <div className="text-sm mb-3">Seu saldo: <b className="mb-mono">{fmt(me.money)}</b></div>

              <div className="rounded-xl p-3 mb-3" style={{ background: "#E8F0EA", border: "2px solid #15543E" }}>
                <div className="font-bold">🏦 Banco Nacional</div>
                <p className="text-xs opacity-70 mb-2">Juros de 10% por volta. Abate automático de até {fmt(100)} ao passar pela Partida. Uma dívida por vez.</p>
                {(me.debtBank || 0) > 0 ? (
                  <div>
                    <div className="text-sm font-bold mb-2" style={{ color: "#B3261E" }}>Você deve {fmt(me.debtBank)}</div>
                    <div className="flex gap-2">
                      <button onClick={() => payLoan("bank", false)} disabled={me.money <= 0} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: "#15543E" }}>Abater {fmt(100)}</button>
                      <button onClick={() => payLoan("bank", true)} disabled={me.money <= 0} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: "#0B3D2E" }}>Quitar tudo</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[100, 200, 300, 500].map((v) => (
                      <button key={v} onClick={() => takeLoan("bank", v)} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#15543E" }}>
                        Pegar {fmt(v)} <span className="opacity-70">(deve {fmt(Math.round(v * 1.1))})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl p-3 mb-3" style={{ background: "#FBE8E8", border: "2px solid #B3261E" }}>
                <div className="font-bold">🦈 Seu Tubarão (agiota)</div>
                <p className="text-xs opacity-70 mb-2">Dinheiro na hora, juros de 25% por volta. Se a dívida passar de 3× o valor pego, ele TOMA uma propriedade sua. Tá avisado.</p>
                {(me.debtShark || 0) > 0 ? (
                  <div>
                    <div className="text-sm font-bold mb-2" style={{ color: "#B3261E" }}>Você deve {fmt(me.debtShark)} (limite antes do confisco: {fmt((me.sharkBase || 0) * 3)})</div>
                    <div className="flex gap-2">
                      <button onClick={() => payLoan("shark", false)} disabled={me.money <= 0} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: "#B3261E" }}>Abater {fmt(100)}</button>
                      <button onClick={() => payLoan("shark", true)} disabled={me.money <= 0} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-40" style={{ background: "#7A0C0C" }}>Quitar tudo</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {[200, 500, 1000].map((v) => (
                      <button key={v} onClick={() => takeLoan("shark", v)} className="mb-btn rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: "#B3261E" }}>
                        Pegar {fmt(v)} <span className="opacity-70">(deve {fmt(Math.round(v * 1.3))})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs opacity-60 mb-3">Precisa de mais? Hipoteque ou venda propriedades tocando nelas no tabuleiro.</p>
              <button onClick={() => setShowMoney(false)} className="mb-btn w-full rounded-xl py-2 font-bold border-2" style={{ borderColor: "#0B3D2E", color: "#0B3D2E" }}>Fechar</button>
            </div>
          </div>
        )}

        {/* MODAL: propor troca */}
        {showTrade && me && (() => {
          const myProps = Object.entries(g.props).filter(([k, v]) => v.owner === myIdx).map(([k]) => Number(k));
          const partnerProps = trPartner >= 0 ? Object.entries(g.props).filter(([k, v]) => v.owner === trPartner).map(([k]) => Number(k)) : [];
          const toggle = (list, set, i) => set(list.includes(i) ? list.filter((x) => x !== i) : [...list, i]);
          const Chip = ({ i, sel, onClick }) => (
            <button onClick={onClick} className={`mb-btn rounded-lg px-2 py-1 text-xs font-bold border-2 flex items-center gap-1 ${sel ? "text-white" : ""}`} style={{ borderColor: BOARD[i].g ? GROUPS[BOARD[i].g].c : "#888", background: sel ? (BOARD[i].g ? GROUPS[BOARD[i].g].c : "#888") : "transparent" }}>
              {BOARD[i].short || BOARD[i].name}{g.props[i] && g.props[i].mort ? " 🔒" : ""}{(g.props[i].houses || 0) > 0 ? ` 🏗️${g.props[i].houses}` : ""}
            </button>
          );
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3" style={{ background: "rgba(0,0,0,.55)" }} onClick={() => setShowTrade(false)}>
              <div className="w-full max-w-sm rounded-2xl p-4 max-h-[88vh] overflow-y-auto" style={{ background: "#FBF5E9", color: "#1A1A1A" }} onClick={(e) => e.stopPropagation()}>
                <div className="font-bold text-lg mb-2">🔁 Propor troca</div>

                <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Negociar com</div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {g.players.map((p, i) => (i === myIdx || p.bankrupt ? null : (
                    <button key={p.id} onClick={() => { setTrPartner(i); setTrTheirs([]); }} className={`mb-btn rounded-lg px-3 py-1.5 text-sm font-bold border-2 ${trPartner === i ? "text-white" : ""}`} style={{ borderColor: COLORS[p.token], background: trPartner === i ? COLORS[p.token] : "transparent" }}>
                      {TOKENS[p.token]} {p.name}{p.bot ? " 🤖" : ""}
                    </button>
                  )))}
                </div>

                <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Você oferece</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {myProps.length === 0 && <span className="text-xs opacity-50">Você não tem propriedades.</span>}
                  {myProps.map((i) => <Chip key={i} i={i} sel={trMine.includes(i)} onClick={() => toggle(trMine, setTrMine, i)} />)}
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold">+ R$</span>
                  <input type="number" min="0" value={trGive} onChange={(e) => setTrGive(e.target.value)} placeholder="0" className="mb-mono w-28 rounded-lg border-2 border-gray-300 px-2 py-1.5 font-bold" />
                  <span className="text-xs opacity-60">(saldo: {fmt(me.money)})</span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wide opacity-70 mb-1">Você pede</div>
                {trPartner < 0 ? (
                  <p className="text-xs opacity-50 mb-2">Escolha um jogador acima.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {partnerProps.length === 0 && <span className="text-xs opacity-50">{g.players[trPartner].name} não tem propriedades.</span>}
                    {partnerProps.map((i) => <Chip key={i} i={i} sel={trTheirs.includes(i)} onClick={() => toggle(trTheirs, setTrTheirs, i)} />)}
                  </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-bold">+ R$</span>
                  <input type="number" min="0" value={trAsk} onChange={(e) => setTrAsk(e.target.value)} placeholder="0" className="mb-mono w-28 rounded-lg border-2 border-gray-300 px-2 py-1.5 font-bold" />
                </div>

                <button
                  onClick={() => { proposeTrade(); setShowTrade(false); }}
                  disabled={busy || trPartner < 0 || (trMine.length === 0 && trTheirs.length === 0 && !(parseInt(trGive) > 0) && !(parseInt(trAsk) > 0))}
                  className="mb-btn w-full rounded-xl py-2.5 font-bold text-white disabled:opacity-40"
                  style={{ background: "linear-gradient(160deg,#7A4FC2,#5A2FA0)" }}
                >
                  Enviar proposta 📨
                </button>
                <button onClick={() => setShowTrade(false)} className="mb-btn mt-2 w-full rounded-xl py-2 font-bold border-2" style={{ borderColor: "#0B3D2E", color: "#0B3D2E" }}>Fechar</button>
              </div>
            </div>
          );
        })()}
        {/* MODAL: Checkout PIX Mercado Pago */}
        {pixModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ background: "rgba(0,0,0,.65)" }} onClick={() => setPixModal(prev => ({ ...prev, show: false }))}>
            <div className="w-full max-w-sm rounded-2xl p-5 text-center" style={{ background: "#FBF5E9", color: "#1A1A1A", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-lg mb-1 text-blue-800">⚡ Pagamento do Boost ({pixModal.boost.toUpperCase()})</h3>
              <p className="text-xs opacity-75 mb-3">O bônus de <b>+R$ {pixModal.bonus.toLocaleString("pt-BR")}</b> será creditado ao iniciar a partida!</p>
              
              <div className="bg-white p-3 rounded-xl inline-block mb-3 border-2 border-dashed border-blue-400">
                {pixModal.status === "loading" ? (
                  <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                    <span className="text-sm font-bold text-blue-800">Gerando QR Code...</span>
                    <span className="text-[10px] opacity-60 mt-1 animate-pulse">Aguarde alguns segundos</span>
                  </div>
                ) : pixModal.qrCodeBase64 ? (
                  <img src={`data:image/png;base64,${pixModal.qrCodeBase64}`} alt="QR Code PIX" className="w-48 h-48 mx-auto" />
                ) : (
                  <div className="w-48 h-48 mx-auto flex flex-col items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
                    <span className="text-4xl mb-1">📱</span>
                    <span className="text-xs font-bold px-2 text-center">QR CODE PIX SIMULADO</span>
                    <span className="text-[9px] opacity-75 mt-1">(Modo de Desenvolvimento)</span>
                  </div>
                )}
              </div>

              <div className="text-sm font-bold text-green-700 mb-2">Valor: R$ {pixModal.amount.toFixed(2)}</div>
              
              {pixModal.status !== "loading" && (
                <div className="mb-3 text-left">
                  <label className="text-[10px] font-bold opacity-60 uppercase">Código PIX Copia e Cola:</label>
                  <div className="flex gap-1 mt-0.5">
                    <input
                      readOnly
                      value={pixModal.qrCode || ""}
                      onClick={(e) => e.target.select()}
                      className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-gray-300 bg-gray-50 font-mono truncate"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pixModal.qrCode);
                        alert("Código PIX copiado! Cole no app do seu banco.");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-bold rounded-lg"
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              )}

              {pixModal.status === "loading" ? (
                <p className="text-xs text-blue-700 font-semibold mb-3 animate-pulse">
                  ⚡ Conectando com Mercado Pago...
                </p>
              ) : pixModal.simulation ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  <p className="text-[10px] text-yellow-700 font-semibold mb-2 leading-tight">
                    💡 O servidor está sem credenciais do Mercado Pago ou fora do ar. Use a simulação abaixo para testar o boost de graça!
                  </p>
                  <button
                    onClick={simulatePixPayment}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-sm py-2 rounded-xl shadow-lg transition-all"
                  >
                    Simular Pagamento PIX 🤝
                  </button>
                </div>
              ) : (
                <p className="text-[10px] opacity-60 animate-pulse mb-3">
                  ⏳ Aguardando confirmação do pagamento... O boost ativa automaticamente ao pagar.
                </p>
              )}

              <button 
                onClick={() => setPixModal(prev => ({ ...prev, show: false }))} 
                className="w-full border-2 border-gray-400 text-gray-700 font-bold py-2 rounded-xl text-sm"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-felt min-h-screen flex flex-col items-center justify-center text-white">
      <style>{css}</style>
      <Logo w={210} dark />
      <div className="mb-mono text-sm opacity-70 mt-2">Carregando…</div>
    </div>
  );
}
