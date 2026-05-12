import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './lib/supabase';
import { buildProjectUpsertRow } from './lib/specSections';
import { SECTIONS } from './config/sections';
import {
  OPENROUTER_URL,
  getOpenRouterModelOptions,
  resolveInitialModelChoice,
  persistSelectedModel
} from './config/openrouter';
import { mergeHistoryById } from './lib/historyMerge';
import { readHistoryFromStorage, writeHistoryToStorage } from './lib/historyStorage';
import type { HistoryItem } from './lib/historyTypes';
import Header from './components/Header';
import AuthGate from './components/AuthGate';
import IdeaInput from './components/IdeaInput';
import OptionsPanel from './components/OptionsPanel';
import GenerateButton from './components/GenerateButton';
import HistoryPanel from './components/HistoryPanel';
import Sidebar from './components/Sidebar';
import SpecResult from './components/SpecResult';
import ToastHost, { type ToastVariant } from './components/ToastHost';

const PRESETS = [
  "E-commerce SaaS B2B",
  "Application mobile de livraison",
  "Dashboard interne BI"
];

const LANGUAGES = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
];

export default function App() {
  const [idea, setIdea] = useState('');
  const [spec, setSpec] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [language, setLanguage] = useState('fr');
  const [includedSections, setIncludedSections] = useState<string[]>(SECTIONS.filter(s => s.default).map(s => s.id));
  const [showOptions, setShowOptions] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => readHistoryFromStorage());
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const modelOptions = useMemo(() => getOpenRouterModelOptions(), []);
  const [openRouterModel, setOpenRouterModel] = useState(() => resolveInitialModelChoice(modelOptions));

  const [toasts, setToasts] = useState<{ id: string; message: string; variant: ToastVariant }[]>([]);

  const pushToast = useCallback((message: string, variant: ToastVariant) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, variant === 'error' ? 8000 : 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!modelOptions.includes(openRouterModel) && modelOptions[0]) {
      setOpenRouterModel(modelOptions[0]);
    }
  }, [modelOptions, openRouterModel]);

  const handleModelChange = (model: string) => {
    setOpenRouterModel(model);
    persistSelectedModel(model);
  };

  const hydrateHistoryFromCloud = useCallback(
    async (userId: string): Promise<HistoryItem[]> => {
      const local = readHistoryFromStorage();
      if (!supabase) return local;

      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        const cloud: HistoryItem[] = (data ?? []).map((d) => ({
          id: d.id,
          idea: d.idea,
          spec: d.spec,
          timestamp: new Date(d.timestamp).getTime()
        }));

        const merged = mergeHistoryById(cloud, local);
        setHistory(merged);
        writeHistoryToStorage(merged);
        return merged;
      } catch (err: unknown) {
        console.error('Failed to fetch / merge cloud history', err);
        const msg = err instanceof Error ? err.message : 'Impossible de charger le cloud.';
        pushToast(msg, 'error');
        setHistory(local);
        writeHistoryToStorage(local);
        return local;
      }
    },
    [pushToast]
  );

  const syncAllHistoryToCloud = useCallback(
    async (userId: string, items: HistoryItem[]) => {
      if (!supabase || !items.length) return;

      try {
        setIsSyncing(true);
        const payload = items.map((item) =>
          buildProjectUpsertRow({
            id: item.id,
            userId,
            idea: item.idea,
            spec: item.spec,
            timestamp: item.timestamp,
            language: 'fr',
            includedSections: []
          })
        );

        const { error } = await supabase.from('projects').upsert(payload, { onConflict: 'id' });
        if (error) {
          pushToast(`Synchronisation : ${error.message}`, 'error');
          return;
        }
      } catch (err: unknown) {
        console.error('Failed to sync all history to cloud', err);
        const msg = err instanceof Error ? err.message : 'Échec de la synchronisation.';
        pushToast(msg, 'error');
      } finally {
        setIsSyncing(false);
      }
    },
    [pushToast]
  );

  const syncToCloud = useCallback(
    async (item: HistoryItem, lang: string, sectionsForRun: string[], uid: string) => {
      if (!supabase) return;
      setIsSyncing(true);
      try {
        const row = buildProjectUpsertRow({
          id: item.id,
          userId: uid,
          idea: item.idea,
          spec: item.spec,
          timestamp: item.timestamp,
          language: lang,
          includedSections: sectionsForRun
        });
        const { error } = await supabase.from('projects').upsert(row, { onConflict: 'id' });
        if (error) {
          pushToast(`Sauvegarde cloud : ${error.message}`, 'error');
          return;
        }
        pushToast('Spec enregistrée dans le cloud.', 'success');
      } catch (err: unknown) {
        console.error('Failed to sync to cloud', err);
        const msg = err instanceof Error ? err.message : 'Sauvegarde cloud impossible.';
        pushToast(msg, 'error');
      } finally {
        setIsSyncing(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    if (!supabase) {
      setAuthChecked(true);
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        setHistory([]);
        writeHistoryToStorage([]);
      }

      if (event === 'INITIAL_SESSION') {
        setAuthChecked(true);
        if (session?.user) {
          const merged = await hydrateHistoryFromCloud(session.user.id);
          if (merged.length) await syncAllHistoryToCloud(session.user.id, merged);
        }
      }

      if (event === 'SIGNED_IN' && session?.user) {
        const merged = await hydrateHistoryFromCloud(session.user.id);
        if (merged.length) await syncAllHistoryToCloud(session.user.id, merged);
      }
    });

    return () => subscription.unsubscribe();
  }, [hydrateHistoryFromCloud, syncAllHistoryToCloud]);

  const handleSignInPassword = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase non configuré.' };
    setIsSyncing(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      return {};
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase non configuré.' };
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}` }
      });
      if (error) return { error: error.message };
      const needsEmailConfirm = Boolean(data.user) && !data.session;
      return { needsEmailConfirm };
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignInMagicLink = async (email: string) => {
    if (!supabase || !email.trim()) return { error: 'Email requis.' };
    setIsSyncing(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}` }
      });
      if (error) return { error: error.message };
      return {};
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
    setHistory([]);
    writeHistoryToStorage([]);
    if (supabase) {
      supabase.auth.signOut();
    }
  };

  useEffect(() => {
    if (spec && !isLoading && spec.length > 100) {
      setHistory(prev => {
        if (prev.length > 0 && prev[0].idea === idea && prev[0].spec === spec) {
          return prev;
        }
        const newItem = {
          id: crypto.randomUUID(),
          idea,
          spec,
          timestamp: Date.now()
        };
        const newHistory = [newItem, ...prev].slice(0, 50);
        localStorage.setItem('architect-ai-history', JSON.stringify(newHistory));
        if (user) {
          syncToCloud(newItem, language, includedSections, user.id);
        }
        return newHistory;
      });
    }
  }, [isLoading, spec, idea, user, language, includedSections, syncToCloud]);

  const toggleSection = (id: string) => {
    setIncludedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadMD = () => {
    const blob = new Blob([spec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-spec-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setIdea(item.idea);
    setSpec(item.spec);
    setShowHistory(false);
  };

  const generateSpec = async () => {
    if (!idea.trim() || !user) return;

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      setError('Clé API manquante: définissez VITE_OPENROUTER_API_KEY dans votre fichier .env.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSpec('');
    setShowHistory(false);

    try {
      const requestedSections = SECTIONS
        .filter(s => includedSections.includes(s.id))
        .map((s, idx) => `${idx + 1}. ${s.label}`)
        .join('\n');

      const selectedLanguage = LANGUAGES.find(l => l.id === language)?.label || 'Français';

      const prompt = `Tu es un expert senior en Product Management, Architecture Logicielle et Génie logiciel.
Tu produis un document technique très concret en Markdown.

Contraintes de format:
- Respecte STRICTEMENT et UNIQUEMENT les sections ci-dessous.
- Utilise des sous-listes actionnables (checklists, bullets, tableaux si pertinent).
- Donne des hypothèses explicites quand une info manque.
- N'ajoute pas d'introduction ni de conclusion hors sections.

Sections à générer:
${requestedSections}

Règles de rédaction:
- Langue de réponse: ${selectedLanguage}
- Ton professionnel, précis, orienté exécution produit/tech.
- Pas de contenu générique; adapte à l'idée métier.
- Si pertinent, ajoute des estimations (complexité S/M/L) et priorités (P0/P1/P2).

USER INPUT: "${idea}"`;

      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ArchitectAI'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: 'You are a senior CTO and product architect. Output valid Markdown only.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4
        })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenRouter error (${response.status}): ${body}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('Réponse vide du modèle.');
      }

      setSpec(content);
    } catch (err: any) {
      console.error('OpenRouter API Error:', err);
      setError(err.message || 'Une erreur est survenue lors de la génération. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-xl font-bold mb-3">Configuration requise</h1>
        <p className="text-slate-400 max-w-md text-sm leading-relaxed">
          Définissez <code className="text-amber-200">VITE_SUPABASE_URL</code> et{' '}
          <code className="text-amber-200">VITE_SUPABASE_ANON_KEY</code> dans votre fichier{' '}
          <code className="text-amber-200">.env</code>, puis activez le fournisseur Email (mot de passe) dans le
          tableau Supabase — Authentication → Providers → Email.
        </p>
      </div>
    );
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthGate
        onSignInPassword={handleSignInPassword}
        onSignUp={handleSignUp}
        onSignInMagicLink={handleSignInMagicLink}
        isBusy={isSyncing}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-900 font-sans p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto space-y-8 print:space-y-0">
        <Header
          user={user}
          historyCount={history.length}
          onShowHistory={() => setShowHistory(!showHistory)}
          onSignOut={handleSignOut}
          hasCloudSync
          isSyncing={isSyncing}
        />

        {showHistory && (
          <HistoryPanel
            history={history}
            onLoadItem={loadHistoryItem}
            hasCloudSync={!!user}
          />
        )}

        <div className="grid lg:grid-cols-[1fr,340px] gap-8 items-start print:hidden">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
            <IdeaInput
              value={idea}
              onChange={setIdea}
              disabled={isLoading}
              presets={PRESETS}
            />

            <OptionsPanel
              isOpen={showOptions}
              onToggle={() => setShowOptions(!showOptions)}
              language={language}
              onLanguageChange={setLanguage}
              languages={LANGUAGES}
              includedSections={includedSections}
              onToggleSection={toggleSection}
              sections={SECTIONS}
              modelOptions={modelOptions}
              selectedModel={openRouterModel}
              onModelChange={handleModelChange}
            />

            <GenerateButton
              onClick={generateSpec}
              disabled={!idea.trim() || isLoading || includedSections.length === 0}
              isLoading={isLoading}
            />

            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>

          <Sidebar />
        </div>

        <SpecResult
          spec={spec}
          isLoading={isLoading}
          onCopy={handleCopy}
          onDownload={handleDownloadMD}
          onPrint={handlePrintPDF}
          copied={copied}
        />

        <ToastHost toasts={toasts} onDismiss={dismissToast} />
      </div>
    </div>
  );
}
