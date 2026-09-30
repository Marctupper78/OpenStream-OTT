
import React, { useState, useEffect, useMemo } from 'react';
import { Channel, AppRoute } from './types';
import { filterChannels } from './services/iptvService';
import { CATEGORIES } from './constants';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import ChannelCard from './components/ChannelCard';
import AdminPanel from './components/AdminPanel';
import AuthModal from './components/AuthModal';
import FeaturedCarousel from './components/FeaturedCarousel';
import LoginLanding from './components/LoginLanding';

const FAVORITES_KEY = 'openstream_favorites';

// ── Detecta se está na rota /admin ────────────────────────────────────────
const isAdminRoute = () =>
  window.location.pathname.startsWith('/admin');

// ── Página Admin standalone ───────────────────────────────────────────────
const AdminStandalone: React.FC = () => {
  return (
    <AdminPanel
      onClose={() => { window.location.href = '/'; }}
      standalone
    />
  );
};

// ── App principal ─────────────────────────────────────────────────────────
const AppInner: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Channel[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [footerClickCount, setFooterClickCount] = useState(0);

  // Carregar apenas canais customizados da API
  const loadChannels = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/channels');
      if (!res.ok) { setChannels([]); return; }
      const data = await res.json();
      const custom: Channel[] = Array.isArray(data.custom) ? data.custom : (Array.isArray(data) ? data : []);
      const blocked: string[] = Array.isArray(data.blocked) ? data.blocked : [];
      setChannels(custom.filter(c => !blocked.includes(c.url)));
    } catch {
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  };

  useEffect(() => {
    if (user) {
      loadChannels();
      loadFavorites();
    }
  }, [user]);

  const filteredChannels = useMemo(() => {
    const src = currentRoute === AppRoute.FAVORITES ? favorites : channels;
    return filterChannels(src, searchQuery, selectedCategory);
  }, [channels, favorites, searchQuery, selectedCategory, currentRoute]);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsMinimized(false);
  };

  const handleNextChannel = () => {
    if (!selectedChannel || filteredChannels.length === 0) return;
    const idx = filteredChannels.findIndex(c => c.url === selectedChannel.url);
    setSelectedChannel(filteredChannels[(idx + 1) % filteredChannels.length]);
  };

  const handlePrevChannel = () => {
    if (!selectedChannel || filteredChannels.length === 0) return;
    const idx = filteredChannels.findIndex(c => c.url === selectedChannel.url);
    setSelectedChannel(filteredChannels[(idx - 1 + filteredChannels.length) % filteredChannels.length]);
  };

  const handlePlayerClose = () => {
    setSelectedChannel(null);
    setIsMinimized(false);
    loadFavorites();
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  // Aguarda autenticação carregar
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="OrbitaStreaming" className="w-16 h-16 object-contain animate-pulse drop-shadow-lg" />
          <p className="text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não autenticado → landing page
  if (!user) {
    return (
      <>
        <LoginLanding
          onLoginClick={() => openAuth('login')}
          onRegisterClick={() => openAuth('register')}
        />
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            initialMode={authMode}
          />
        )}
      </>
    );
  }

  // ── Usuário autenticado ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLegalClick={() => setCurrentRoute(AppRoute.LEGAL)}
        onHomeClick={() => {
          setCurrentRoute(AppRoute.HOME);
          setSearchQuery('');
          setSelectedCategory('all');
        }}
        onFavoritesClick={() => {
          setCurrentRoute(AppRoute.FAVORITES);
          loadFavorites();
          setSearchQuery('');
        }}
        onAuthClick={() => openAuth('login')}
      />

      <main className="flex-1 pb-20">

        {/* ── HOME ────────────────────────────────────────────────────── */}
        {currentRoute === AppRoute.HOME && !searchQuery && selectedCategory === 'all' && (
          <>
            {/* Carrossel de destaque */}
            {channels.length > 0 ? (
              <FeaturedCarousel channels={channels} onPlay={handleChannelSelect} />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center h-[55vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4" />
                <p className="text-slate-400">Carregando canais...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[55vh] text-center px-6">
                <div className="text-6xl mb-4">📡</div>
                <h2 className="text-2xl font-black mb-2">Nenhum canal disponível</h2>
                <p className="text-slate-400 text-sm">O administrador ainda não adicionou canais à plataforma.</p>
              </div>
            )}

            {/* Favoritos no home */}
            {favorites.length > 0 && (
              <section className="px-6 md:px-16 mt-12 relative z-30">
                <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  Meus Favoritos
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {favorites.slice(0, 6).map(channel => (
                    <ChannelCard key={channel.url + 'fav'} channel={channel} onClick={handleChannelSelect} />
                  ))}
                  {favorites.length > 6 && (
                    <div
                      onClick={() => setCurrentRoute(AppRoute.FAVORITES)}
                      className="flex items-center justify-center bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:bg-slate-900 hover:border-red-600 transition-all group min-h-[120px]"
                    >
                      <span className="font-bold text-slate-500 group-hover:text-red-500">Ver Todos ({favorites.length})</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Grade por categoria */}
            <div className="px-6 md:px-16 mt-12 relative z-30 space-y-12">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600 mb-4" />
                  <p className="text-slate-400">Carregando canais...</p>
                </div>
              ) : (
                CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                  const catChannels = channels.filter(ch =>
                    ch.category.toLowerCase().includes(cat.id)
                  );
                  if (catChannels.length === 0) return null;
                  return (
                    <section key={cat.id}>
                      <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
                        {cat.name}
                        <span className="text-slate-500 text-sm font-medium">{catChannels.length} canais</span>
                      </h2>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {catChannels.map(channel => (
                          <ChannelCard key={channel.url} channel={channel} onClick={handleChannelSelect} />
                        ))}
                      </div>
                    </section>
                  );
                })
              )}
              {/* Todos os canais se não houver categorias */}
              {!loading && channels.length > 0 && CATEGORIES.filter(c => c.id !== 'all').every(cat => !channels.some(ch => ch.category.toLowerCase().includes(cat.id))) && (
                <section>
                  <h2 className="text-xl md:text-2xl font-bold mb-6">Todos os Canais</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {channels.map(channel => (
                      <ChannelCard key={channel.url} channel={channel} onClick={handleChannelSelect} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}

        {/* ── FAVORITOS / BUSCA / BROWSE ──────────────────────────────── */}
        {(currentRoute === AppRoute.FAVORITES || searchQuery || (currentRoute !== AppRoute.HOME && currentRoute !== AppRoute.LEGAL) || selectedCategory !== 'all') && currentRoute !== AppRoute.LEGAL && (
          <div className="pt-24 px-6 md:px-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                  {currentRoute === AppRoute.FAVORITES && (
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  )}
                  {currentRoute === AppRoute.FAVORITES
                    ? 'Meus Favoritos'
                    : searchQuery
                    ? `Resultados para "${searchQuery}"`
                    : selectedCategory !== 'all'
                    ? CATEGORIES.find(c => c.id === selectedCategory)?.name
                    : 'Todos os Canais'}
                </h2>
                <p className="text-slate-500 mt-2">{filteredChannels.length} resultado(s)</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mb-4" />
                <p className="text-slate-400">Carregando...</p>
              </div>
            ) : filteredChannels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
                {filteredChannels.map(channel => (
                  <ChannelCard key={channel.url} channel={channel} onClick={handleChannelSelect} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">
                  {currentRoute === AppRoute.FAVORITES ? '❤️' : '🔍'}
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {currentRoute === AppRoute.FAVORITES ? 'Nenhum favorito ainda' : 'Nenhum canal encontrado'}
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  {currentRoute === AppRoute.FAVORITES
                    ? 'Adicione canais aos favoritos durante a reprodução'
                    : 'Tente outra busca ou categoria'}
                </p>
                {currentRoute === AppRoute.FAVORITES ? (
                  <button onClick={() => setCurrentRoute(AppRoute.HOME)} className="text-red-500 font-bold hover:underline">
                    Explorar canais
                  </button>
                ) : (
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="text-red-500 font-bold hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── LEGAL ───────────────────────────────────────────────────── */}
        {currentRoute === AppRoute.LEGAL && (
          <div className="pt-24 px-6 md:px-16 max-w-4xl mx-auto">
            <h1 className="text-4xl font-black mb-8">Aviso Legal</h1>
            <p className="text-slate-300 leading-relaxed mb-6">
              O Órbita Stream é uma plataforma agregadora de transmissões públicas. Não hospedamos nenhum conteúdo de vídeo em nossos servidores. Todos os streams são reproduzidos diretamente dos servidores de origem.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Os canais disponíveis nesta plataforma são de acesso público e gratuito. O usuário é responsável por verificar as leis de transmissão vigentes em seu país.
            </p>
            <button
              onClick={() => setCurrentRoute(AppRoute.HOME)}
              className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Voltar para o início
            </button>
          </div>
        )}
      </main>

      {/* Reprodutor de Vídeo */}
      {selectedChannel && (
        <VideoPlayer
          channel={selectedChannel}
          isMinimized={isMinimized}
          onMinimize={() => setIsMinimized(true)}
          onExpand={() => setIsMinimized(false)}
          onClose={handlePlayerClose}
          onNext={handleNextChannel}
          onPrevious={handlePrevChannel}
        />
      )}

      <footer className="bg-slate-900 border-t border-slate-800 py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <img src="/logo.png" alt="" className="h-7 w-7 object-contain opacity-70" />
          <span
            className="text-xl font-black tracking-tight cursor-default select-none"
            onClick={() => {
              const next = footerClickCount + 1;
              setFooterClickCount(next);
              if (next >= 5) {
                setFooterClickCount(0);
                window.location.href = '/admin';
              }
            }}
            title={footerClickCount > 0 ? `${5 - footerClickCount} cliques para admin` : undefined}
          >
            <span className="text-orange-400">Orbita</span>Streaming
          </span>
        </div>
        <p className="text-slate-600 text-xs">
          {footerClickCount > 0 && footerClickCount < 5
            ? `🔐 ${5 - footerClickCount} clique(s) restantes`
            : '© 2024 OrbitaStreaming · Todos os direitos reservados'}
        </p>
      </footer>

      {/* Admin Panel (modal para acesso rápido) */}
      {showAdmin && (
        <AdminPanel onClose={() => { setShowAdmin(false); loadChannels(); }} />
      )}

      {/* Modal de Auth */}
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} initialMode={authMode} />
      )}
    </div>
  );
};

// ── Root: detecta rota /admin ─────────────────────────────────────────────
const App: React.FC = () => {
  if (isAdminRoute()) {
    return (
      <AuthProvider>
        <AdminStandalone />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
};

export default App;
