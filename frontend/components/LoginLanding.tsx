import React from 'react';

interface LoginLandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const LoginLanding: React.FC<LoginLandingProps> = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header mínimo */}
      <header className="px-6 md:px-16 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white p-1.5 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter">ÓRBITA STREAM</span>
        </div>
        <button
          onClick={onLoginClick}
          className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-full text-sm transition-colors"
        >
          Entrar
        </button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-20">
        {/* Background gradients decorativos */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Ícone grande */}
        <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-red-600/30">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none">
          Órbita Stream
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Sua plataforma de TV ao vivo. Assista aos seus canais favoritos a qualquer hora, em qualquer lugar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button
            onClick={onRegisterClick}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-2xl text-base transition-colors shadow-xl shadow-red-600/20"
          >
            Criar conta grátis
          </button>
          <button
            onClick={onLoginClick}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl text-base transition-colors border border-slate-700"
          >
            Já tenho conta
          </button>
        </div>

        <p className="text-slate-600 text-xs mt-8 max-w-sm">
          Ao criar uma conta, você concorda com nossos termos de uso. Streaming gratuito de canais públicos.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-slate-800 bg-slate-900/50">
        {[
          { icon: '📺', title: 'Canais ao Vivo', desc: 'Assista aos melhores canais de TV ao vivo, direto no seu navegador.' },
          { icon: '⭐', title: 'Favoritos', desc: 'Salve seus canais preferidos e acesse rapidamente quando quiser.' },
          { icon: '🔒', title: 'Acesso Exclusivo', desc: 'Crie sua conta e tenha acesso completo à plataforma gratuitamente.' },
        ].map((f, i) => (
          <div key={i} className="px-8 py-10 text-center border-b md:border-b-0 md:border-r border-slate-800 last:border-r-0 last:border-b-0">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="font-black text-lg mb-2">{f.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoginLanding;
