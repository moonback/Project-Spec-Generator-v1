import { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Sparkles, FileText, Blocks, Layout, Rocket, Copy, Download, History, Printer, Check, Cloud } from 'lucide-react';
import { supabase } from './lib/supabase';

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
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Supabase State
  const [user, setUser] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [showAuth, setShowAuth] = useState(false);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !authEmail.trim()) return;
    try {
      setIsSyncing(true);
      const { error } = await supabase.auth.signInWithOtp({ email: authEmail });
      if (error) throw error;
      alert('Lien de connexion envoyé ! Vérifiez vos emails.');
      setShowAuth(false);
    } catch (error: any) {
      alert(error.message || 'Erreur lors de la connexion');
    } finally {
      setIsSyncing(false);
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

  const loadHistoryItem = (item: HistoryItem) => {
    setIdea(item.idea);
    setSpec(item.spec);
    setShowHistory(false);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

  useEffect(() => {
    if (spec && resultRef.current) {
        window.scrollTo({
            top: resultRef.current.offsetTop - 40,
            behavior: 'smooth'
        });
    }
  }, [spec.length > 50]); // Scroll only on initial generation start

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 print:p-0 print:bg-white">
      <div className="max-w-5xl mx-auto space-y-8 print:space-y-0">
        
        {/* Header Section */}
        <header className="space-y-3 pt-8 pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-bold uppercase tracking-tight">
              <Sparkles className="w-4 h-4" />
              <span>AI Product Architect</span>
            </div>
            <div className="flex items-center gap-4">
              {supabase && (
                <>
                  {user ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Cloud className="w-4 h-4 text-green-500" />
                      <span className="hidden sm:inline" title={user.email}>{user.email?.split('@')[0]}</span>
                      <button 
                        onClick={() => supabase.auth.signOut()} 
                        className="text-xs ml-2 hover:text-slate-900 border border-slate-200 px-2 py-1 rounded"
                      >
                        Déconnexion
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <button 
                        onClick={() => setShowAuth(!showAuth)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-md transition-colors"
                      >
                        <Cloud className="w-4 h-4" />
                        <span>Cloud Save</span>
                      </button>
                      
                      {showAuth && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-10">
                          <h4 className="text-sm font-bold text-slate-900 mb-2">Sauvegarder dans le cloud</h4>
                          <p className="text-xs text-slate-500 mb-4">Connectez-vous pour synchroniser vos projets.</p>
                          <form onSubmit={handleSignIn} className="space-y-3">
                            <input
                              type="email"
                              value={authEmail}
                              onChange={(e) => setAuthEmail(e.target.value)}
                              placeholder="votre@email.com"
                              className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              required
                            />
                            <button
                              type="submit"
                              disabled={isSyncing}
                              className="w-full bg-slate-900 text-white text-sm py-2 rounded hover:bg-slate-800 disabled:opacity-50"
                            >
                              {isSyncing ? 'Envoi...' : 'Recevoir un lien magique'}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {history.length > 0 && (
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 px-3 py-1.5 border border-slate-200 rounded-md transition-colors"
                >
                  <History className="w-4 h-4" />
                  <span>Historique ({history.length})</span>
                  {user && <Cloud className="w-3 h-3 text-green-500 ml-1" title="Synchronisé" />}
                </button>
              )}
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">
            Tech Spec <span className="text-blue-600">Generator</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
            Transformez une simple idée en un document d'architecture technique complet et détaillé, prêt à être confié à une équipe de développeurs.
          </p>
        </header>

        {showHistory && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:hidden">
            <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900 mb-4">Historique récent</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left p-3 text-sm border border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50 rounded-md transition-colors truncate"
                  title={item.idea}
                >
                  <span className="text-xs text-slate-400 mr-3">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-slate-700">{item.idea}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr,300px] gap-8 items-start print:hidden">
          
          {/* Main Input Area */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6 flex-1">
            <div className="space-y-4">
              <label htmlFor="idea-input" className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight text-slate-900">
                <div className="w-1 h-4 bg-blue-500"></div>
                L'idée de votre projet
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setIdea(preset)}
                    className="text-[11px] font-medium px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                id="idea-input"
                className="w-full h-40 bg-slate-50 border border-slate-200 rounded-md p-4 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                placeholder="ex: Je veux créer un e-commerce de vêtements streetwear avec IA de recommandation..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-6">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {showOptions ? '- Masquer les options avancées' : '+ Options avancées (Langue & Sections)'}
              </button>
            </div>

            {showOptions && (
              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Langue de sortie
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => setLanguage(lang.id)}
                        className={`text-sm px-4 py-2 rounded border transition-colors ${language === lang.id ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Sections à inclure
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SECTIONS.map((section) => (
                      <label key={section.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded">
                        <input
                          type="checkbox"
                          checked={includedSections.includes(section.id)}
                          onChange={() => toggleSection(section.id)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        {section.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={generateSpec}
              disabled={!idea.trim() || isLoading || includedSections.length === 0}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  Générer le cahier des charges
                  <Rocket className="w-5 h-5" />
                </>
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded border border-red-100 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Sidebar Tips */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-purple-500"></div>
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">Ce que vous obtiendrez</h3>
            </div>
            <ul className="space-y-3">
              <li className="p-3 bg-blue-50 border-l-2 border-blue-400 flex items-center gap-3">
                <FileText className="w-4 h-4 text-blue-800" />
                <div>
                  <p className="text-[11px] font-bold text-blue-800 uppercase">Business & MVP</p>
                  <p className="text-xs text-blue-900">Objectifs, features, public cible.</p>
                </div>
              </li>
              <li className="p-3 bg-slate-50 border border-slate-100 rounded flex items-center gap-3">
                <Blocks className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Architecture & Stack</p>
                  <p className="text-xs text-slate-600">Choix techniques, base de données.</p>
                </div>
              </li>
              <li className="p-3 bg-slate-50 border border-slate-100 rounded flex items-center gap-3">
                <Layout className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Planning Détaillé</p>
                  <p className="text-xs text-slate-600">Roadmap de dev, UI, user stories.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Results Area */}
        {(spec || isLoading) && (
          <div ref={resultRef} className="pt-8 print:pt-0">
            <div className="flex items-center justify-between mb-6 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-emerald-500"></div>
                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-900">
                  Spécifications Techniques
                </h2>
              </div>
              
              {spec && !isLoading && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                    title="Copier le Markdown"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={handleDownloadMD}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                    title="Télécharger en Markdown (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handlePrintPDF}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
                    title="Imprimer / Exporter en PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-10 flex-1 flex flex-col print:border-none print:shadow-none print:p-0">
              
              {isLoading && !spec ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-8 bg-slate-100 rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  <div className="h-6 bg-slate-100 rounded w-1/4 mt-8"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                    <div className="h-4 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div className="markdown-body prose prose-slate max-w-none hover:prose-a:text-blue-600 prose-headings:font-semibold prose-heading:tracking-tight prose-h1:text-xl prose-h1:font-bold prose-h2:text-sm prose-h2:font-bold prose-h2:uppercase prose-h2:tracking-tight prose-h2:border-none prose-h2:mt-8 prose-h2:mb-4 prose-p:text-sm prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-sm prose-li:text-slate-600 text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {spec}
                  </ReactMarkdown>
                </div>
              )}

              {isLoading && spec && (
                <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 text-slate-400 print:hidden">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Rédaction en cours par l'architecte IA...</span>
                </div>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
