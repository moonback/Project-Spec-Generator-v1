import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { supabase } from './lib/supabase';
import Header from './components/Header';
import IdeaInput from './components/IdeaInput';
import OptionsPanel from './components/OptionsPanel';
import GenerateButton from './components/GenerateButton';
import HistoryPanel from './components/HistoryPanel';
import Sidebar from './components/Sidebar';
import SpecResult from './components/SpecResult';

// Initialize the API using the injected environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
  
  // Customization State
  const [language, setLanguage] = useState('fr');
  const [includedSections, setIncludedSections] = useState<string[]>(SECTIONS.filter(s => s.default).map(s => s.id));
  const [showOptions, setShowOptions] = useState(false);

  // History & Auth State
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
  
  // Supabase State
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

  // Save to history when a spec is fully generated
  useEffect(() => {
    if (spec && !isLoading && spec.length > 100) {
      setHistory(prev => {
        // Avoid duplicate saves for the same idea
        if (prev.length > 0 && prev[0].idea === idea && prev[0].spec === spec) {
          return prev;
        }
        const newItem = {
          id: crypto.randomUUID(),
          idea,
          spec,
          timestamp: Date.now()
        };
        const newHistory = [newItem, ...prev].slice(0, 10); // Keep last 10 locally
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
Ta mission est de transformer une idée de projet donnée par un utilisateur en document technique complet, structuré et exploitable par une équipe de développement.
Tu dois penser comme un :
CTO expérimenté
Architecte logiciel
Product Manager SaaS
Tech Lead startup

À partir d'une simple idée utilisateur, tu génères un dossier technique complet pour construire le produit.

Tu dois générer la structure suivante (ET UNIQUEMENT CES SECTIONS) formatée strictement en Markdown :
${requestedSections}

Règles de rédaction importantes :
- Langue de réponse : ${selectedLanguage}
- Sois très structuré et professionnel. 
- Ne fais jamais de réponses vagues. 
- Adapte toujours le contenu au type de projet. 
- Si l'idée est simple, tu dois l'enrichir intelligemment. 
- Pense toujours "startup réelle".
- Fournis UNIQUEMENT le texte Markdown, sans blockquote global.

USER INPUT: "${idea}"`;

      const response = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: prompt
      });
      
      let newSpec = "";
      for await (const chunk of response) {
        newSpec += chunk.text || '';
        setSpec(newSpec);
      }
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      setError(err.message || 'Une erreur est survenue lors de la génération. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 text-slate-900 font-sans p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto space-y-8 print:space-y-0">
        
        {/* Header */}
        <Header
          user={user}
          historyCount={history.length}
          onShowHistory={() => setShowHistory(!showHistory)}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
          isSyncing={isSyncing}
          hasSupabase={!!supabase}
        />

        {/* History Panel */}
        {showHistory && (
          <HistoryPanel
            history={history}
            onLoadItem={loadHistoryItem}
            hasCloudSync={!!user}
          />
        )}

        <div className="grid lg:grid-cols-[1fr,340px] gap-8 items-start print:hidden">
          
          {/* Main Input Area */}
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

          {/* Sidebar */}
          <Sidebar />
        </div>

        {/* Results Area */}
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
