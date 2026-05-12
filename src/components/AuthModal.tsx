import { useState } from 'react';
import { X, Mail } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onSignIn: (email: string, profileName: string) => Promise<void>;
  isSyncing: boolean;
}

export default function AuthModal({ onClose, onSignIn, isSyncing }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [profileName, setProfileName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await onSignIn(email, profileName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Inscription & Connexion Cloud</h3>
              <p className="text-sm text-slate-500">Créez votre compte et synchronisez vos projets</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Recevez un lien magique par email pour vous connecter et sauvegarder vos spécifications dans le cloud.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="profileName" className="block text-sm font-medium text-slate-700 mb-2">
                Nom du profil
              </label>
              <input
                id="profileName"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Ex: Sarah Product"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isSyncing}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full px-4 py-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={isSyncing}
              />
            </div>

            <button
              type="submit"
              disabled={isSyncing || !email.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            >
              {isSyncing ? 'Envoi en cours...' : 'Recevoir le lien magique'}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center">
            Aucun mot de passe requis. Vérifiez votre boîte mail après l'envoi.
          </p>
        </div>
      </div>
    </div>
  );
}
