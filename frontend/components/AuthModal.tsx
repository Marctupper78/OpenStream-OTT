import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

type Mode = 'login' | 'register';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: Mode;
}

const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 focus:border-transparent transition-all placeholder-slate-500';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const reset = () => { setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setError(null); };

  const switchMode = (m: Mode) => { setMode(m); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (mode === 'register') {
      if (!name.trim()) return setError('Nome é obrigatório');
      if (password !== confirmPassword) return setError('Senhas não conferem');
      if (password.length < 6) return setError('Senha deve ter pelo menos 6 caracteres');
    }
    setLoading(true);
    const err = mode === 'login'
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (err) return setError(err);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 px-8 pt-8 pb-6 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta gratuita'}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' ? 'Bem-vindo de volta ao Órbita Stream' : 'Junte-se ao Órbita Stream'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => switchMode('login')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'login' ? 'text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-slate-300'}`}>
            Entrar
          </button>
          <button
            onClick={() => switchMode('register')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${mode === 'register' ? 'text-white border-b-2 border-red-500' : 'text-slate-500 hover:text-slate-300'}`}>
            Criar conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Nome completo</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Seu nome" className={inputCls} required autoFocus={mode === 'register'} />
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" className={inputCls} required autoFocus={mode === 'login'} />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1.5">Senha</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className={`${inputCls} pr-11`} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors">
                {showPw
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                }
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5">Confirmar senha</label>
              <input
                type={showPw ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" className={inputCls} required />
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 text-red-300 text-sm flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2">
            {loading
              ? <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" /> Aguarde...</>
              : mode === 'login' ? 'Entrar' : 'Criar minha conta'
            }
          </button>

          <p className="text-center text-slate-500 text-xs pt-1">
            {mode === 'login'
              ? <>Não tem conta?{' '}<button type="button" onClick={() => switchMode('register')} className="text-red-400 hover:text-red-300 font-bold transition-colors">Cadastre-se grátis</button></>
              : <>Já tem conta?{' '}<button type="button" onClick={() => switchMode('login')} className="text-red-400 hover:text-red-300 font-bold transition-colors">Entrar</button></>
            }
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
