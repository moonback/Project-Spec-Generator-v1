import { Settings, ChevronDown, ChevronUp, Cpu } from 'lucide-react';

interface Language {
  id: string;
  label: string;
}

interface Section {
  id: string;
  label: string;
  default: boolean;
}

interface OptionsPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  languages: Language[];
  includedSections: string[];
  onToggleSection: (id: string) => void;
  sections: Section[];
  modelOptions: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export default function OptionsPanel({
  isOpen,
  onToggle,
  language,
  onLanguageChange,
  languages,
  includedSections,
  onToggleSection,
  sections,
  modelOptions,
  selectedModel,
  onModelChange
}: OptionsPanelProps) {
  return (
    <div className="border-t border-slate-200 pt-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-slate-500 group-hover:rotate-90 transition-transform duration-300" />
          <span>Options avancées</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="space-y-6 pt-6 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              <Cpu className="w-4 h-4 text-slate-500" />
              Modèle OpenRouter
            </label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-lg border-2 border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {modelOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 leading-relaxed">
              Liste : variable <code className="text-slate-700">VITE_OPENROUTER_MODELS</code> (modèles séparés par
              des virgules), ou un seul <code className="text-slate-700">VITE_OPENROUTER_MODEL</code>.
            </p>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
              Langue de sortie
            </label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={`text-sm px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${
                    language === lang.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-transparent text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sections Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
                Sections à inclure
              </label>
              <span className="text-xs text-slate-500">
                {includedSections.length} / {sections.length} sélectionnées
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sections.map((section) => {
                const isChecked = includedSections.includes(section.id);
                return (
                  <label
                    key={section.id}
                    className={`flex items-center gap-3 text-sm cursor-pointer p-3 rounded-lg border-2 transition-all ${
                      isChecked
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleSection(section.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="font-medium">{section.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
