import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import OptionsPanel from './components/OptionsPanel';
import GenerateButton from './components/GenerateButton';
import HistoryPanel from './components/HistoryPanel';
import Sidebar from './components/Sidebar';
import SpecResult from './components/SpecResult';

const OPENROUTER_MODEL = 'openai/gpt-oss-120b:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface HistoryItem {
  id: string;
  idea: string;
  spec: string;
  timestamp: number;
}

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

const SECTIONS = [
  { id: 'summary', default: true, label: 'Résumé du projet' },
  { id: 'business', default: true, label: 'Objectifs business' },
  { id: 'mvp', default: true, label: 'MVP (Minimum Viable Product)' },
  { id: 'stories', default: true, label: 'User Stories' },
  { id: 'architecture', default: true, label: 'Architecture système' },
  { id: 'schema', default: true, label: 'Modèle de données' },
  { id: 'api', default: true, label: 'API Endpoints' },
  { id: 'ui', default: true, label: 'Pages UI' },
  { id: 'stack', default: true, label: 'Stack technique recommandée' },
  { id: 'roadmap', default: true, label: 'Roadmap de développement' },
  { id: 'risks', default: true, label: 'Risques techniques & Mitigation' },
];

export default function App() {
  const [idea, setIdea] = useState('');
  const [spec, setSpec] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [language, setLanguage] = useState('fr');
  const [includedSections, setIncludedSections] = useState<string[]>(SECTIONS.filter(s => s.default).map(s => s.id));
  const [showOptions, setShowOptions] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('architect-ai-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchCloudHistory(session.user.id);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchCloudHistory(session.user.id);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchCloudHistory = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (!error && data) {
        setHistory(data.map(d => ({
          id: d.id,
          idea: d.idea,
          spec: d.spec,
          timestamp: new Date(d.timestamp).getTime()
        })));
      }
    } catch (err) {
      console.error('Failed to fetch cloud history', err);
    }
  };

  const syncToCloud = async (item: HistoryItem) => {
    if (!supabase || !user) return;
    setIsSyncing(true);
    try {
      await supabase.from('projects').upsert({
        id: item.id,
        user_id: user.id,
        idea: item.idea,
        spec: item.spec,
        timestamp: new Date(item.timestamp).toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.error('Failed to sync to cloud', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignIn = async (email: string) => {
    if (!supabase || !email.trim()) return;
    try {
      setIsSyncing(true);
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Lien de connexion envoyé ! Vérifiez vos emails.');
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = () => {
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
        const newHistory = [newItem, ...prev].slice(0, 10);
        localStorage.setItem('architect-ai-history', JSON.stringify(newHistory));
        if (user) {
          syncToCloud(newItem);
        }
        return newHistory;
      });
    }
  }, [isLoading, spec, idea, user]);

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
    if (!idea.trim()) return;

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
          model: OPENROUTER_MODEL,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-900 font-sans p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto space-y-8 print:space-y-0">
        <Header
          user={user}
          historyCount={history.length}
          onShowHistory={() => setShowHistory(!showHistory)}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          isSyncing={isSyncing}
          hasSupabase={!!supabase}
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
      </div>
    </div>
  );
}
