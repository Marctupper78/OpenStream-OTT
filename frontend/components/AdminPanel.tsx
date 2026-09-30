import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '../types';
import { CATEGORIES, IPTV_SOURCES } from '../constants';
import { fetchAndParseM3U } from '../services/iptvService';

const ADMIN_PASSWORD = 'orbita2024';
const API_URL = '/api/channels';
const ADMIN_AUTH_KEY = 'openstream_admin_auth';

const emptyChannel = (): Partial<Channel> => ({
  name: '', url: '', logo: '', category: 'news', country: '', language: '', source: 'custom',
});

interface AdminData { custom: Channel[]; blocked: string[]; }

interface AdminPanelProps { onClose: () => void; }

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);

  const [allChannels, setAllChannels] = useState<Channel[]>([]);   // IPTV + custom
  const [custom, setCustom] = useState<Channel[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState<'all' | 'custom'>('all');
  const [editing, setEditing] = useState<Partial<Channel> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (authed) loadAll(); }, [authed]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Data loading ─────────────────────────────────────────────────────────

  const loadAll = async () => {
    setLoadingChannels(true);
    try {
      // Carregar dados do servidor (custom + blocked) e IPTV em paralelo
      const [apiData, ...iptvResults] = await Promise.all([
        fetch(API_URL).then(r => r.ok ? r.json() : { custom: [], blocked: [] }).catch(() => ({ custom: [], blocked: [] })),
        fetchAndParseM3U(IPTV_SOURCES.CATEGORY_NEWS),
        fetchAndParseM3U(IPTV_SOURCES.CATEGORY_MOVIES),
        fetchAndParseM3U(IPTV_SOURCES.CATEGORY_SPORTS),
        fetchAndParseM3U(IPTV_SOURCES.CATEGORY_MUSIC),
        fetchAndParseM3U(IPTV_SOURCES.CATEGORY_ENTERTAINMENT),
      ]);

      const data: AdminData = {
        custom: Array.isArray((apiData as any).custom) ? (apiData as any).custom : [],
        blocked: Array.isArray((apiData as any).blocked) ? (apiData as any).blocked : [],
      };

      const iptvChannels = (iptvResults as Channel[][]).flat()
        .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

      // Todos os canais: custom primeiro, depois IPTV (sem duplicatas)
      const merged = [...data.custom, ...iptvChannels]
        .filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);

      setCustom(data.custom);
      setBlocked(data.blocked);
      setAllChannels(merged);
    } catch {
      showToast('Erro ao carregar canais', 'err');
    } finally {
      setLoadingChannels(false);
    }
  };

  const pushData = async (newCustom: Channel[], newBlocked: string[]) => {
    setSaving(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD },
        body: JSON.stringify({ custom: newCustom, blocked: newBlocked }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      setCustom(newCustom);
      setBlocked(newBlocked);
      return true;
    } catch (e: any) {
      showToast(`❌ ${e.message}`, 'err');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => setToast({ msg, type });

  // ── Block / Unblock ───────────────────────────────────────────────────────

  const toggleBlock = async (channel: Channel) => {
    const url = channel.url;
    const isBlocked = blocked.includes(url);
    const newBlocked = isBlocked ? blocked.filter(b => b !== url) : [...blocked, url];
    const ok = await pushData(custom, newBlocked);
    if (ok) showToast(isBlocked ? '✅ Canal reativado' : '🚫 Canal oculto da grade');
  };

  // ── Custom CRUD ───────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.url?.trim()) {
      showToast('Nome e URL são obrigatórios', 'err'); return;
    }
    const channel: Channel = {
      id: editing.id || `custom-${Date.now()}`,
      name: editing.name.trim(), url: editing.url.trim(),
      logo: editing.logo?.trim() || '', category: editing.category || 'general',
      country: editing.country?.trim() || '', language: editing.language?.trim() || '',
      source: 'custom',
    };
    const newCustom = isNew ? [channel, ...custom] : custom.map(c => c.id === channel.id ? channel : c);
    // Atualiza allChannels também
    const newAll = isNew
      ? [channel, ...allChannels.filter(c => c.url !== channel.url)]
      : allChannels.map(c => c.url === channel.url ? channel : c);
    const ok = await pushData(newCustom, blocked);
    if (ok) {
      setAllChannels(newAll);
      setEditing(null);
      showToast(isNew ? '✅ Canal adicionado!' : '✅ Canal atualizado!');
    }
  };

  const handleDelete = async (ch: Channel) => {
    if (!confirm(`Deletar o canal "${ch.name}"?`)) return;
    const newCustom = custom.filter(c => c.id !== ch.id);
    const newAll = allChannels.filter(c => c.url !== ch.url);
    const ok = await pushData(newCustom, blocked.filter(b => b !== ch.url));
    if (ok) { setAllChannels(newAll); showToast('🗑️ Canal removido'); }
  };

  // ── Import M3U ────────────────────────────────────────────────────────────

  const handleImportM3U = async () => {
    const lines = importText.split('\n');
    const imported: Channel[] = [];
    let cur: Partial<Channel> = {};
    for (const raw of lines) {
      const line = raw.trim();
      if (line.startsWith('#EXTINF:')) {
        cur = {
          name: line.match(/,(.*)$/)?.[1]?.trim() || 'Canal',
          logo: line.match(/tvg-logo="([^"]*)"/)?.[1] || '',
          category: (line.match(/group-title="([^"]*)"/)?.[1] || 'general').toLowerCase(),
          country: line.match(/tvg-country="([^"]*)"/)?.[1] || '',
          language: line.match(/tvg-language="([^"]*)"/)?.[1] || '',
        };
      } else if (line.startsWith('http') && cur.name) {
        imported.push({ id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: cur.name!, url: line, logo: cur.logo || '', category: cur.category || 'general', country: cur.country || '', language: cur.language || '', source: 'custom' });
        cur = {};
      }
    }
    if (!imported.length) { setImportResult('❌ Nenhum canal encontrado. Verifique o formato M3U.'); return; }
    const newCustom = [...imported, ...custom].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i);
    const ok = await pushData(newCustom, blocked);
    if (ok) {
      setAllChannels(prev => [...imported, ...prev].filter((v, i, a) => a.findIndex(t => t.url === v.url) === i));
      setImportResult(`✅ ${imported.length} canais importados!`);
      setImportText('');
      setTimeout(() => { setImportOpen(false); setImportResult(null); }, 2000);
    }
  };

  const handleExport = () => {
    const m3u = ['#EXTM3U', ...custom.map(c => `#EXTINF:-1 tvg-logo="${c.logo}" tvg-country="${c.country}" tvg-language="${c.language}" group-title="${c.category}",${c.name}\n${c.url}`)].join('\n');
    const blob = new Blob([m3u], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orbita_canais.m3u'; a.click();
  };

  // ── Filter ────────────────────────────────────────────────────────────────

  const source = tab === 'custom' ? custom : allChannels;
  const filtered = source.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q))
      && (filterCat === 'all' || c.category.toLowerCase() === filterCat);
  });

  // ── Login gate ────────────────────────────────────────────────────────────
  if (!authed) return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur flex items-center justify-center">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <div><h2 className="text-xl font-black">Painel Admin</h2><p className="text-slate-400 text-sm">Órbita Stream</p></div>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (password === ADMIN_PASSWORD) { sessionStorage.setItem(ADMIN_AUTH_KEY, 'true'); setAuthed(true); } else setPwError(true); }} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Senha de acesso</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setPwError(false); }}
              className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 ${pwError ? 'border-red-500' : 'border-slate-600'}`}
              placeholder="••••••••" autoFocus />
            {pwError && <p className="text-red-400 text-xs mt-1">Senha incorreta</p>}
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-500 font-bold py-2.5 rounded-lg transition-colors">Entrar</button>
          <button type="button" onClick={onClose} className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">Cancelar</button>
        </form>
      </div>
    </div>
  );

  // ── Main Admin UI ─────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[60] border px-5 py-3 rounded-xl shadow-2xl text-sm font-medium ${toast.type === 'ok' ? 'bg-slate-800 border-green-700 text-green-300' : 'bg-slate-800 border-red-700 text-red-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Saving overlay */}
      {saving && (
        <div className="fixed inset-0 z-[59] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-600 rounded-xl px-8 py-5 flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500" />
            <span className="font-bold">Salvando no servidor...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div>
            <h1 className="font-black text-lg leading-none">Gerenciar Canais</h1>
            <p className="text-slate-400 text-xs mt-0.5">{loadingChannels ? 'Carregando...' : `${allChannels.length} total · ${blocked.length} ocultos · ${custom.length} personalizados`}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={loadAll} disabled={loadingChannels} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
            <svg className={`w-4 h-4 ${loadingChannels ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Atualizar
          </button>
          <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Importar M3U
          </button>
          {custom.length > 0 && (
            <button onClick={handleExport} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exportar
            </button>
          )}
          <button onClick={() => { setIsNew(true); setEditing(emptyChannel()); }}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Novo Canal
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 w-fit">
          <button onClick={() => setTab('all')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            Todos os canais ({allChannels.length})
          </button>
          <button onClick={() => setTab('custom')}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === 'custom' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            Personalizados ({custom.length})
          </button>
        </div>

        {/* Blocked warning */}
        {blocked.length > 0 && (
          <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl px-4 py-3 mb-4 flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span className="text-amber-300"><strong>{blocked.length}</strong> canal(is) oculto(s) da grade. Canais ocultos aparecem aqui com ícone 🚫 — clique para reativar.</span>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar canal..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[{ id: 'all', name: 'Todos' }, ...CATEGORIES.filter(c => c.id !== 'all')].map(cat => (
              <button key={cat.id} onClick={() => setFilterCat(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${filterCat === cat.id ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Channel list */}
        {loadingChannels ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500 mb-4" />
            <p className="text-slate-400">Carregando todos os canais...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📺</div>
            <h3 className="text-lg font-bold mb-1">Nenhum canal encontrado</h3>
            <p className="text-slate-500 text-sm">Tente outro filtro ou adicione canais personalizados.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-slate-500 text-xs mb-3">{filtered.length} canal(is)</p>
            {filtered.map(ch => {
              const isBlocked = blocked.includes(ch.url);
              const isCustom = ch.source === 'custom';
              return (
                <div key={ch.id || ch.url}
                  className={`border rounded-xl px-4 py-3 flex items-center gap-3 transition-all group ${isBlocked ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800 hover:border-slate-600'}`}>
                  {/* Logo */}
                  <div className="w-11 h-9 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {ch.logo ? (
                      <img src={ch.logo} alt="" className="w-full h-full object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zM3 17V8h18v9H3z" /></svg>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`font-bold text-sm truncate ${isBlocked ? 'line-through text-slate-500' : ''}`}>{ch.name}</p>
                      {isCustom && <span className="bg-red-900/50 text-red-300 text-[10px] px-1.5 py-0.5 rounded font-bold">CUSTOM</span>}
                      {isBlocked && <span className="bg-slate-700 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-bold">OCULTO</span>}
                    </div>
                    <p className="text-slate-600 text-xs truncate">{ch.url}</p>
                  </div>
                  {/* Category */}
                  <span className="hidden lg:block bg-slate-800 text-slate-400 text-xs px-2 py-1 rounded-full capitalize flex-shrink-0">{ch.category}</span>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {/* Hide / Show */}
                    <button onClick={() => toggleBlock(ch)} title={isBlocked ? 'Reativar canal' : 'Ocultar da grade'}
                      className={`p-2 rounded-lg transition-colors ${isBlocked ? 'bg-green-900/30 hover:bg-green-700 text-green-400' : 'bg-slate-700 hover:bg-amber-600 text-slate-300'}`}>
                      {isBlocked
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      }
                    </button>
                    {/* Edit (apenas custom) */}
                    {isCustom && (
                      <button onClick={() => { setEditing({ ...ch }); setIsNew(false); }} title="Editar"
                        className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    )}
                    {/* Delete (apenas custom) */}
                    {isCustom && (
                      <button onClick={() => handleDelete(ch)} title="Deletar"
                        className="bg-red-900/40 hover:bg-red-700 p-2 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Edit / New Modal ──────────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-lg">{isNew ? '➕ Novo Canal' : '✏️ Editar Canal'}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nome do Canal *', key: 'name', placeholder: 'CNN Brasil' },
                { label: 'URL do Stream (m3u8/ts) *', key: 'url', placeholder: 'https://exemplo.com/live.m3u8' },
                { label: 'Logo (URL da imagem)', key: 'logo', placeholder: 'https://logo.com/canal.png' },
                { label: 'País (código)', key: 'country', placeholder: 'BR' },
                { label: 'Idioma', key: 'language', placeholder: 'Portuguese' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">{f.label}</label>
                  <input value={(editing as any)[f.key] || ''} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })}
                    placeholder={f.placeholder} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">Categoria</label>
                <select value={editing.category || 'general'} onChange={e => setEditing({ ...editing, category: e.target.value })} className={inputCls}>
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="general">General</option>
                </select>
              </div>
              {editing.logo && (
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-500">Preview do logo:</span>
                  <img src={editing.logo} alt="" className="h-10 rounded-lg bg-slate-800 border border-slate-700 object-contain px-2"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 font-black py-2.5 rounded-xl transition-colors">
                {isNew ? 'Adicionar Canal' : 'Salvar Alterações'}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import M3U Modal ──────────────────────────────────────────────────── */}
      {importOpen && (
        <div className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-lg">📥 Importar Playlist M3U</h3>
              <button onClick={() => { setImportOpen(false); setImportResult(null); setImportText(''); }} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Carregar arquivo .m3u
              </button>
              <input ref={fileRef} type="file" accept=".m3u,.m3u8,.txt" onChange={e => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = ev => setImportText(ev.target?.result as string); r.readAsText(f); }} className="hidden" />
              <textarea value={importText} onChange={e => setImportText(e.target.value)} rows={10}
                placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo=&quot;https://...&quot; group-title=&quot;News&quot;,Canal Exemplo&#10;https://stream.exemplo.com/live.m3u8"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none" />
              {importResult && <p className={`text-sm font-bold ${importResult.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{importResult}</p>}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleImportM3U} disabled={!importText.trim() || saving}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 font-black py-2.5 rounded-xl transition-colors">{saving ? 'Salvando...' : 'Importar Canais'}</button>
              <button onClick={() => { setImportOpen(false); setImportResult(null); setImportText(''); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent transition-all';

export const loadCustomChannels = (): Channel[] => [];
export default AdminPanel;
