import { useEffect, useState } from 'react';
import {
  Star,
  Cloud,
  History,
  Loader2,
  Menu,
  X,
  PenLine,
  FileText,
  UserRound
} from 'lucide-react';

interface HeaderProps {
  user: { email?: string | null };
  historyCount: number;
  onOpenHistory: () => void;
  onSignOut: () => void;
  hasCloudSync: boolean;
  isSyncing?: boolean;
  hasSpec: boolean;
}

function scrollToId(id: string) {
  const el = document.getElementById(id);
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Header({
  user,
  historyCount,
  onOpenHistory,
  onSignOut,
  hasCloudSync,
  isSyncing = false,
  hasSpec
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const email = user.email ?? '';
  const displayName = email.split('@')[0] || 'Compte';

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const navClass =
    'text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg px-3 py-2 transition-colors hover:bg-slate-100/80';

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 print:hidden border-b border-slate-200/80 bg-white/85 backdrop-blur-md shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                closeMobile();
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#2563eb] px-2.5 py-2 text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-500/30 transition-transform hover:scale-[1.02] active:scale-[0.98] sm:gap-2.5 sm:px-3"
              aria-label="AI Product Architect — accueil"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Star className="h-4 w-4 fill-white text-white" strokeWidth={2} aria-hidden />
              </span>
              <span className="hidden max-w-[11rem] truncate font-semibold tracking-tight text-[13px] leading-none sm:inline">
                AI Product Architect
              </span>
            </a>

            <nav className="hidden min-w-0 md:flex md:items-center md:gap-0.5" aria-label="Principal">
              <button type="button" className={navClass} onClick={() => scrollToId('generateur')}>
                <span className="inline-flex items-center gap-2">
                  <PenLine className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  Créer
                </span>
              </button>
              <button
                type="button"
                className={navClass}
                onClick={() => {
                  onOpenHistory();
                  scrollToId('historique');
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <History className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  Historique
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-slate-600">
                    {historyCount}
                  </span>
                </span>
              </button>
              <button
                type="button"
                className={`${navClass} ${!hasSpec ? 'pointer-events-none opacity-45' : ''}`}
                disabled={!hasSpec}
                onClick={() => scrollToId('resultat-spec')}
                title={!hasSpec ? 'Générez une spec pour afficher le résultat' : undefined}
              >
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  Résultat
                </span>
              </button>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Menu</span>
            </button>

            <div
              className="flex max-w-[min(100vw-5rem,320px)] items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1.5 pr-1 shadow-sm sm:gap-3 sm:pl-2 sm:pr-1.5"
              role="group"
              aria-label="Session utilisateur"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 ring-1 ring-slate-200/80">
                  <UserRound className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0 hidden sm:block">
                  <p className="truncate text-sm font-medium text-slate-800" title={email}>
                    {displayName}
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-3 w-3 shrink-0 animate-spin text-blue-500" aria-hidden />
                        Synchronisation…
                      </>
                    ) : (
                      <>
                        {hasCloudSync ? (
                          <Cloud className="h-3 w-3 shrink-0 text-emerald-500" aria-label="Cloud actif" />
                        ) : null}
                        Connecté
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:text-sm sm:font-medium"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div
            id="mobile-nav"
            className="border-t border-slate-100 py-3 animate-in slide-in-from-top-2 duration-200 md:hidden"
          >
            <p className="mb-3 truncate px-1 text-xs text-slate-500 sm:hidden" title={email}>
              {email || '—'}
            </p>
            <nav className="flex flex-col gap-1" aria-label="Mobile">
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  scrollToId('generateur');
                  closeMobile();
                }}
              >
                <PenLine className="h-4 w-4 text-slate-400" />
                Créer une spec
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  onOpenHistory();
                  scrollToId('historique');
                  closeMobile();
                }}
              >
                <History className="h-4 w-4 text-slate-400" />
                Historique
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {historyCount}
                </span>
              </button>
              <button
                type="button"
                disabled={!hasSpec}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => {
                  scrollToId('resultat-spec');
                  closeMobile();
                }}
              >
                <FileText className="h-4 w-4 text-slate-400" />
                Voir le résultat
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
