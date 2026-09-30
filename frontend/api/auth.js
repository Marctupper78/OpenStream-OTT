// api/auth.js — Register, Login, Me
// POST /api/auth?action=register  → { name, email, password }
// POST /api/auth?action=login     → { email, password }
// GET  /api/auth                  → Bearer <token> → user info

import { put, list } from '@vercel/blob';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const USERS_BLOB = 'users.json';
const JWT_SECRET = process.env.JWT_SECRET || 'orbita-stream-secret-2024';
const JWT_EXPIRES = '30d';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

async function getUsers() {
  try {
    const { blobs } = await list({ prefix: USERS_BLOB });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url);
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

async function saveUsers(users) {
  await put(USERS_BLOB, JSON.stringify(users), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(200).end();
  }
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  const action = req.query.action;

  // ── GET /api/auth → validate token ──────────────────────────────────────
  if (req.method === 'GET') {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Token ausente' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ user: payload });
    } catch {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  // ── POST register ────────────────────────────────────────────────────────
  if (action === 'register') {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

    const users = await getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
      return res.status(409).json({ error: 'Email já cadastrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      createdAt: new Date().toISOString(),
      role: users.length === 0 ? 'admin' : 'user', // primeiro cadastrado vira admin
    };
    users.push(user);
    await saveUsers(users);

    const { password: _, ...safeUser } = user;
    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({ token, user: safeUser });
  }

  // ── POST login ───────────────────────────────────────────────────────────
  if (action === 'login') {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });

    const users = await getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email ou senha incorretos' });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(200).json({ token, user: safeUser });
  }

  return res.status(400).json({ error: 'Ação inválida. Use ?action=register ou ?action=login' });
}
