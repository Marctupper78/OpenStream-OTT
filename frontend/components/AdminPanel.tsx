
import React, { useState, useEffect, useRef } from 'react';
import { Channel } from '../types';
import { CATEGORIES } from '../constants';

const ADMIN_PASSWORD = 'orbita2024';
const CUSTOM_CHANNELS_KEY = 'openstream_custom_channels';
const ADMIN_AUTH_KEY = 'openstream_admin_auth';

const emptyChannel = (): Partial<Channel> => ({
  name: '',
  url: '',
  logo: '',
  category: 'news',
  country: '',
  language: '',
  source: 'custom',
});

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [editing, setEditing] = useState<Partial<Channel> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const load = () => {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_CHANNELS_KEY) || '[]') as Channel[];
    setChannels(saved);
  };

  const save = (list: Channel[]) => {
    localStorage.setItem(CUSTOM_CHANNELS_KEY, JSON.stringify(list));
    setChannels(list);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.url?.trim()) {
      setToast('❌ Nome e URL são obrigatórios');
      return;
    }
    const channel: Channel = {
      id: editing.id || `custom-${Date.now()}`,
      name: editing.name!.trim(),
      url: editing.url!.trim(),
      logo: editing.logo?.trim() || '',
      category: editing.category || 'general',
      country: editing.country?.trim() || '',
      language: editing.language?.trim() || '',
      source: 'custom',
    };
    let updated: Channel[];
    if (isNew) {
      updated = [channel, ...channels];
    } else {
      updated = channels.map(c => c.id === channel.id ? channel : c);
    }
    save(updated);
    setEditing(null);
    setToast('✅ Canal salvo com sucesso!');
  };

  const handleDelete = (id: string) => {
    if (!confirm('Deletar este canal?')) return;
    save(channels.filter(c => c.id !== id));
    setToast('🗑️ Canal removido');
  };

  const handleImportM3U = () => {
    const lines = importText.split('\n');
    const imported: Channel[] = [];
    let current: Partial<Channel> = {};
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('#EXTINF:')) {
        const name = line.match(/,(.*)$/)?.[1]?.trim() || 'Canal';
        const logo = line.match(/tvg-logo="([^"]*)"/)?.[1] || '';
        const cat = line.match(/group-title="([^"]*)"/)?.[1] || 'general';
        const country = line.match(/tvg-country="([^"]*)"/)?.[1] || '';
        const lang = line.match(/tvg-language="([^"]*)"/)?.[1] || '';
        current = { name, logo, category: cat.toLowerCase(), country, language: lang, source: 'custom' };
      } else if (line.startsWith('http') && current.name) {
        imported.push({
          id: `custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: current.name!,
          url: line,
          logo: current.logo || '',
          category: current.category || 'general',
          country: current.country || '',
          language: current.language || '',
          source: 'custom',
        });
        current = {};
      }
    }
    if (imported.length === 0) {
      setImportResult('❌ Nenhum canal encontrado. Verifique o formato M3U.');
      return;
    }
    const merged = [...imported, ...channels].filter(
      (v, i, a) => a.findIndex(t => t.url === v.url) === i
    );
    save(merged);
    setImportResult(`✅ ${imported.length} canais importados!`);
    setImportText('');
    setTimeout(() => { setImportOpen(false); setImportResult(null); }, 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImportText(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleExport = () => {
    const m3u = ['#EXTM3U', ...channels.map(c =>
      `#EXTINF:-1 tvg-logo="${c.logo}" tvg-country="${c.country}" tvg-language="${c.language}" group-title="${c.category}",${c.name}\n${c.url}`
    )].join('\n');
    const blob = new Blob([m3u], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orbita_canais.m3u';
    a.click();
  };

  const filtered = channels.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.url.toLowerCase().includes(q);
    const matchCat = filterCat === 'all' || c.category.toLowerCase() === filterCat;
    return matchQ && matchCat;
  });

  // ── Password gate ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-600 p-2 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black">Painel Admin</h2>
              <p className="text-slate-400 text-sm">Órbita Stream</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Senha de acesso</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setPwError(false); }}
                className={`w-full bg-slate-800 border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 ${pwError ? 'border-red-500' : 'border-slate-600'}`}
                placeholder="••••••••"
                autoFocus
              />
              {pwError && <p className="text-red-400 text-xs mt-1">Senha incorreta</p>}
            </div>
            <button type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-lg transition-colors">
              Entrar
            </button>
            <button type="button" onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Cancelar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin UI ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-slate-800 border border-slate-600 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-lg">Painel Admin</h1>
            <p className="text-slate-400 text-xs">{channels.length} canais personalizados</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Importar M3U
          </button>
          {channels.length > 0 && (
            <button onClick={handleExport}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-sm font-bold transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exportar
            </button>
          )}
          <button onClick={() => { setIsNew(true); setEditing(emptyChannel()); }}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-sm font-black transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Canal
          </button>
          <button onClick={onClose}
            className="ml-2 text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar canais..."
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

        {/* Channels table */}
        {channels.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-bold mb-2">Nenhum canal ainda</h3>
            <p className="text-slate-400 mb-6">Adicione canais manualmente ou importe uma playlist M3U</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setIsNew(true); setEditing(emptyChannel()); }}
                className="bg-red-600 hover:bg-red-500 px-6 py-2.5 rounded-lg font-bold transition-colors">
                + Adicionar Canal
              </button>
              <button onClick={() => setImportOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 px-6 py-2.5 rounded-lg font-bold transition-colors">
                Importar M3U
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-slate-500 text-sm mb-3">{filtered.length} canal(is) encontrado(s)</p>
            {filtered.map(ch => (
              <div key={ch.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl px-4 py-3 flex items-center gap-4 transition-all group">
                {/* Logo */}
                <div className="w-12 h-10 bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  {ch.logo ? (
                    <img src={ch.logo} alt="" className="w-full h-full object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 6H3a2 2 0 00-2 2v9a2 2 0 002 2h18a2 2 0 002-2V8a2 2 0 00-2-2zM3 17V8h18v9H3z" />
                    </svg>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{ch.name}</p>
                  <p className="text-slate-500 text-xs truncate">{ch.url}</p>
                </div>
                {/* Category badge */}
                <span className="hidden md:block bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full capitalize flex-shrink-0">
                  {ch.category}
                </span>
                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing({ ...ch }); setIsNew(false); }}
                    className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg transition-colors" title="Editar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(ch.id)}
                    className="bg-red-900/40 hover:bg-red-700 p-2 rounded-lg transition-colors" title="Deletar">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit / New Modal ───────────────────────────────────────────────── */}
      {editing && (
        <div className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-lg">{isNew ? '➕ Novo Canal' : '✏️ Editar Canal'}</h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Field label="Nome do Canal *" required>
                  <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
                    placeholder="CNN Brasil" className={inputCls} />
                </Field>
                <Field label="URL do Stream (m3u8 / ts) *" required>
                  <input value={editing.url || ''} onChange={e => setEditing({ ...editing, url: e.target.value })}
                    placeholder="https://exemplo.com/live/stream.m3u8" className={inputCls} />
                </Field>
                <Field label="Logo (URL da imagem)">
                  <div className="flex gap-2 items-center">
                    <input value={editing.logo || ''} onChange={e => setEditing({ ...editing, logo: e.target.value })}
                      placeholder="https://logo.com/canal.png" className={`${inputCls} flex-1`} />
                    {editing.logo && (
                      <img src={editing.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-slate-800 border border-slate-700"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    )}
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Categoria">
                    <select value={editing.category || 'general'} onChange={e => setEditing({ ...editing, category: e.target.value })}
                      className={inputCls}>
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="general">General</option>
                    </select>
                  </Field>
                  <Field label="País (código)">
                    <input value={editing.country || ''} onChange={e => setEditing({ ...editing, country: e.target.value })}
                      placeholder="BR" maxLength={3} className={inputCls} />
                  </Field>
                </div>
                <Field label="Idioma">
                  <input value={editing.language || ''} onChange={e => setEditing({ ...editing, language: e.target.value })}
                    placeholder="Portuguese" className={inputCls} />
                </Field>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleSave}
                className="flex-1 bg-red-600 hover:bg-red-500 font-black py-2.5 rounded-xl transition-colors">
                {isNew ? 'Adicionar Canal' : 'Salvar Alterações'}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Import M3U Modal ─────────────────────────────────────────────────── */}
      {importOpen && (
        <div className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between">
              <h3 className="font-black text-lg">📥 Importar Playlist M3U</h3>
              <button onClick={() => { setImportOpen(false); setImportResult(null); setImportText(''); }}
                className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <button onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Carregar arquivo .m3u
                </button>
                <input ref={fileRef} type="file" accept=".m3u,.m3u8,.txt" onChange={handleFileImport} className="hidden" />
              </div>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                rows={12}
                placeholder={`Cole sua playlist M3U aqui:\n\n#EXTM3U\n#EXTINF:-1 tvg-logo="https://..." group-title="News",Canal Exemplo\nhttps://stream.exemplo.com/live.m3u8`}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-600/50 resize-none"
              />
              {importResult && (
                <p className={`text-sm font-bold ${importResult.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {importResult}
                </p>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handleImportM3U} disabled={!importText.trim()}
                className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-black py-2.5 rounded-xl transition-colors">
                Importar Canais
              </button>
              <button onClick={() => { setImportOpen(false); setImportResult(null); setImportText(''); }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 font-bold py-2.5 rounded-xl transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent transition-all';

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({ label, required, children }) => (
  <div>
    <label className="text-xs font-bold text-slate-400 mb-1.5 block">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export const loadCustomChannels = (): Channel[] =>
  JSON.parse(localStorage.getItem(CUSTOM_CHANNELS_KEY) || '[]');

export default AdminPanel;
