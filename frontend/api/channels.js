// api/channels.js — Vercel Serverless Function
// GET  /api/channels        → retorna lista de canais do Blob
// POST /api/channels        → salva lista (requer x-admin-password header)
// DELETE /api/channels/:id  → remove canal por id

import { put, head, del, list } from '@vercel/blob';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'orbita2024';
const BLOB_KEY = 'custom-channels.json';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  'Content-Type': 'application/json',
};

async function getChannels() {
  try {
    // Lista blobs que começam com o nome do arquivo
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (blobs.length === 0) return [];

    const blob = blobs[0];
    const res = await fetch(blob.url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function saveChannels(channels) {
  await put(BLOB_KEY, JSON.stringify(channels), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export default async function handler(req, res) {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).set(corsHeaders).end();
  }

  // Set CORS headers em todas as respostas
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const channels = await getChannels();
    return res.status(200).json(channels);
  }

  // ── POST (salvar lista completa) ─────────────────────────────────────────
  if (req.method === 'POST') {
    const password = req.headers['x-admin-password'];
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const channels = req.body;
    if (!Array.isArray(channels)) {
      return res.status(400).json({ error: 'Body deve ser um array de canais' });
    }

    await saveChannels(channels);
    return res.status(200).json({ ok: true, count: channels.length });
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
