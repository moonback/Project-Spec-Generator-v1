import { Lightbulb, Sparkles } from 'lucide-react';

interface IdeaInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  presets: string[];
}

export default function IdeaInput({ value, onChange, disabled, presets }: IdeaInputProps) {
  return (
    <div className="space-y-4">
      <label htmlFor="idea-input" className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Lightbulb className="w-5 h-5 text-amber-500" />
        Décrivez votre idée de projet
      </label>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => onChange(preset)}
            disabled={disabled}
            className="group flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            {preset}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        id="idea-input"
        className="w-full h-44 bg-slate-50 border-2 border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-slate-400"
        placeholder="Exemple : Je veux créer une plateforme SaaS de gestion de projets avec IA pour automatiser les tâches répétitives, collaboration en temps réel, et intégrations avec Slack et GitHub..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{value.length} caractères</span>
        <span className="flex items-center gap-1">
          <span className={value.length > 50 ? 'text-emerald-600 font-medium' : ''}>
            {value.length > 50 ? '✓ Prêt' : 'Minimum 50 caractères recommandé'}
          </span>
        </span>
      </div>
    </div>
  );
}
