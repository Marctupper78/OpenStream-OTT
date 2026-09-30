// api/channels.js — Vercel Serverless Function
// GET  /api/channels  → { custom: Channel[], blocked: string[] }
// POST /api/channels  → salva { custom, blocked } (requer x-admin-password)

import { put, list } from '@vercel/blob';

export const config = { api: { bodyParser: true } };

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'orbita2024';
const BLOB_KEY = 'custom-channels.json';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-password',
  'Content-Type': 'application/json',
};

async function getData() {
  try {
    const { blobs } = await list({ prefix: BLOB_KEY });
    if (!blobs.length) return { custom: [], blocked: [] };
    // Sempre busca sem cache
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return { custom: [], blocked: [] };
    const raw = await res.text();
    if (!raw || !raw.trim()) return { custom: [], blocked: [] };
    const data = JSON.parse(raw);
    // Suporte a formato legado (array direto)
    if (Array.isArray(data)) return { custom: data, blocked: [] };
    return { custom: data.custom || [], blocked: data.blocked || [] };
  } catch (e) {
    console.error('getData error:', e);
    return { custom: [], blocked: [] };
  }
}

async function saveData(data) {
  const json = JSON.stringify(data);
  await put(BLOB_KEY, json, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

function parseBody(req) {
  // req.body pode ser string (raw) ou objeto (auto-parsed pelo Vercel)
  if (!req.body) return null;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  if (typeof req.body === 'object') return req.body;
  return null;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const data = await getData();
    return res.status(200).json(data);
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const password = req.headers['x-admin-password'];
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const body = parseBody(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Body inválido. Envie { custom: [], blocked: [] }' });
    }

    const data = {
      custom: Array.isArray(body.custom) ? body.custom : [],
      blocked: Array.isArray(body.blocked) ? body.blocked : [],
    };

    try {
      await saveData(data);
      return res.status(200).json({ ok: true, custom: data.custom.length, blocked: data.blocked.length });
    } catch (e) {
      console.error('saveData error:', e);
      return res.status(500).json({ error: 'Erro ao salvar no Blob: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
