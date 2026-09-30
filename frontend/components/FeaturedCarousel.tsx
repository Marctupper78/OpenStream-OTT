import React, { useState, useEffect, useCallback } from 'react';
import { Channel } from '../types';

interface FeaturedCarouselProps {
  channels: Channel[];
  onPlay: (channel: Channel) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ channels, onPlay }) => {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const featured = channels.slice(0, 8);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % featured.length);
  }, [featured.length]);

  const prev = useCallback(() => {
    setCurrent(c => (c - 1 + featured.length) % featured.length);
  }, [featured.length]);

  useEffect(() => {
    if (paused || featured.length === 0) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next, featured.length]);

  if (featured.length === 0) return null;

  const ch = featured[current];

  // Gera cor de fundo baseada no nome do canal (sem imagens externas)
  const hue = (ch.name.charCodeAt(0) * 37 + ch.name.charCodeAt(Math.min(1, ch.name.length - 1)) * 13) % 360;
  const bgStyle = ch.logo
    ? {}
    : { background: `linear-gradient(135deg, hsl(${hue},60%,15%), hsl(${(hue + 40) % 360},50%,25%))` };

  return (
    <div
      className="relative w-full h-[55vh] md:h-[75vh] overflow-hidden select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 transition-all duration-700" style={bgStyle}>
        {ch.logo && (
          <img
            key={ch.url}
            src={`https://picsum.photos/seed/${encodeURIComponent(ch.name)}/1920/1080`}
            alt=""
            className="w-full h-full object-cover opacity-40 transition-opacity duration-700"
          />
        )}
      </div>

      {/* Logo do canal centralizado no fundo */}
      {ch.logo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img
            src={ch.logo}
            alt=""
            className="h-32 md:h-48 object-contain opacity-15 blur-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30 z-10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 z-20 max-w-3xl">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-red-600 text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-wider animate-pulse">
            ● AO VIVO
          </span>
          <span className="bg-slate-800/80 text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded capitalize">
            {ch.category}
          </span>
          {ch.country && (
            <span className="bg-slate-800/80 text-slate-400 text-[11px] font-bold px-2.5 py-1 rounded uppercase">
              {ch.country}
            </span>
          )}
        </div>

        {/* Logo do canal ou nome */}
        {ch.logo ? (
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <img
                src={ch.logo}
                alt={ch.name}
                className="h-14 md:h-20 w-auto object-contain"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">{ch.name}</h1>
          </div>
        ) : (
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-none">{ch.name}</h1>
        )}

        <p className="text-slate-300 md:text-lg mb-8 max-w-xl">
          Assista ao {ch.name} ao vivo e gratuitamente. Transmissão em alta qualidade direto do servidor de origem.
        </p>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => onPlay(ch)}
            className="flex items-center gap-2.5 bg-white text-black px-8 py-3 rounded-xl font-black text-base hover:bg-red-50 transition-colors shadow-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Assistir Agora
          </button>
          <button
            onClick={() => setCurrent((current + 1) % featured.length)}
            className="flex items-center gap-2.5 bg-slate-800/80 backdrop-blur text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-slate-700 transition-colors border border-slate-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Próximo
          </button>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white rounded-full w-11 h-11 flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/70 text-white rounded-full w-11 h-11 flex items-center justify-center transition-all backdrop-blur-sm border border-white/10 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-6 right-6 md:right-16 z-30 flex gap-2">
        {featured.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all rounded-full ${i === current ? 'w-8 h-2 bg-red-500' : 'w-2 h-2 bg-white/30 hover:bg-white/60'}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
          <div
            key={`${current}-progress`}
            className="h-full bg-red-500 animate-progress"
            style={{ animation: 'progress 6s linear forwards' }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0% } to { width: 100% } }
        .animate-progress { animation: progress 6s linear forwards; }
      `}</style>
    </div>
  );
};

export default FeaturedCarousel;
