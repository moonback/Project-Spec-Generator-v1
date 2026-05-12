import { useState } from 'react';
import { Sparkles, Mail, Lock, Loader2 } from 'lucide-react';

type Tab = 'login' | 'register' | 'magic';

interface AuthGateProps {
  onSignInPassword: (email: string, password: string) => Promise<{ error?: string }>;
  onSignUp: (email: string, password: string) => Promise<{ error?: string; needsEmailConfirm?: boolean }>;
  onSignInMagicLink: (email: string) => Promise<{ error?: string }>;
  isBusy: boolean;
}

export default function AuthGate({
  onSignInPassword,
  onSignUp,
  onSignInMagicLink,
  isBusy
}: AuthGateProps) {
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const [info, setInfo] = useState('');

  const resetMessages = () => {
    setLocalError('');
    setInfo('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email.trim() || !password) {
      setLocalError('Renseignez l’email et le mot de passe.');
      return;
    }
    const { error } = await onSignInPassword(email.trim(), password);
    if (error) setLocalError(error);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email.trim() || !password) {
      setLocalError('Renseignez l’email et le mot de passe.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setLocalError('Les mots de passe ne correspondent pas.');
      return;
    }
    const { error, needsEmailConfirm } = await onSignUp(email.trim(), password);
    if (error) {
      setLocalError(error);
      return;
    }
    if (needsEmailConfirm) {
      setInfo('Compte créé. Vérifiez vos emails pour confirmer l’adresse avant de vous connecter.');
      setTab('login');
      setPassword('');
      setConfirm('');
    } else {
      setInfo('Compte créé. Vous êtes connecté.');
    }
  };

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    if (!email.trim()) return;
    const { error } = await onSignInMagicLink(email.trim());
    if (error) setLocalError(error);
    else setInfo('Lien de connexion envoyé. Vérifiez votre boîte mail.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AI Product Architect</h1>
          <p className="text-sm text-slate-400">Connexion requise pour utiliser le générateur</p>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/95 text-slate-900 rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
        <div className="flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          {(['login', 'register', 'magic'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                resetMessages();
              }}
              className={`flex-1 py-2 rounded-md transition-all ${
                tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'login' ? 'Connexion' : t === 'register' ? 'Inscription' : 'Lien magique'}
            </button>
          ))}
        </div>

        {localError && (
          <div className="p-3 text-sm bg-red-50 text-red-800 rounded-lg border border-red-200">{localError}</div>
        )}
        {info && (
          <div className="p-3 text-sm bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">{info}</div>
        )}

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="gate-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="gate-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isBusy}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="gate-pass" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="gate-pass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isBusy}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Se connecter
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isBusy}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-pass" className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe (min. 6 caractères)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-pass"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isBusy}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isBusy}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer un compte
            </button>
          </form>
        )}

        {tab === 'magic' && (
          <form onSubmit={handleMagic} className="space-y-4">
            <p className="text-sm text-slate-600">
              Nous vous enverrons un lien de connexion sans mot de passe (si activé dans votre projet Supabase).
            </p>
            <div>
              <label htmlFor="magic-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="magic-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isBusy}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isBusy || !email.trim()}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg text-sm font-semibold hover:bg-slate-900 disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Recevoir le lien
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500 max-w-sm">
        Dans le tableau Supabase : Authentication → Providers → activez « Email » et « Confirm email » selon votre
        choix. La connexion par mot de passe nécessite que l’option Email soit activée.
      </p>
    </div>
  );
}
