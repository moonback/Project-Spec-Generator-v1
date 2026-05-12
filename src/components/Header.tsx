import { Sparkles, Cloud, History } from 'lucide-react';

interface HeaderProps {
  user: any;
  historyCount: number;
  onShowHistory: () => void;
  onSignOut: () => void;
  hasCloudSync: boolean;
}

export default function Header({
  user,
  historyCount,
  onShowHistory,
  onSignOut,
  hasCloudSync
}: HeaderProps) {
  return (
    <header className="space-y-4 pt-8 pb-6 border-b border-slate-200 print:hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-sm tracking-tight">AI Product Architect</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700 hidden sm:inline" title={user.email}>
                {user.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={onSignOut}
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-1 hover:bg-slate-50 rounded"
            >
              Déconnexion
            </button>
          </div>

          {historyCount > 0 && (
            <button
              onClick={onShowHistory}
              className="flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 px-4 py-2 border border-slate-200 rounded-lg shadow-sm transition-all hover:shadow-md"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-medium">Historique</span>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {historyCount}
              </span>
              {hasCloudSync && <Cloud className="w-3 h-3 text-emerald-500" aria-label="Synchronisé" />}
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
          Tech Spec <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Generator</span>
        </h1>
        <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
          Transformez une simple idée en un document d'architecture technique complet et détaillé,
          prêt à être confié à une équipe de développeurs.
        </p>
      </div>
    </header>
  );
}
