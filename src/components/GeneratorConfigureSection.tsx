import { ChevronDown, ChevronUp, Layers, Sparkles } from 'lucide-react';
import OptionsPanel from './OptionsPanel';
import GenerateButton from './GenerateButton';

interface Language {
  id: string;
  label: string;
}

interface SectionRow {
  id: string;
  label: string;
  default: boolean;
}

interface GeneratorConfigureSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  ideaHasContent: boolean;
  presets: string[];
  onApplyPreset: (text: string) => void;
  disabled: boolean;
  optionsOpen: boolean;
  onToggleOptions: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  languages: Language[];
  includedSections: string[];
  onToggleSection: (id: string) => void;
  sections: readonly SectionRow[];
  modelOptions: string[];
  selectedModel: string;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  generateDisabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export default function GeneratorConfigureSection({
  isOpen,
  onToggle,
  ideaHasContent,
  presets,
  onApplyPreset,
  disabled,
  optionsOpen,
  onToggleOptions,
  language,
  onLanguageChange,
  languages,
  includedSections,
  onToggleSection,
  sections,
  modelOptions,
  selectedModel,
  onModelChange,
  onGenerate,
  generateDisabled,
  isLoading,
  error
}: GeneratorConfigureSectionProps) {
  const langLabel = languages.find((l) => l.id === language)?.label ?? language;
  const modelShort =
    selectedModel.length > 42 ? `${selectedModel.slice(0, 40)}…` : selectedModel;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]"
      aria-labelledby="configure-heading"
    >
      <button
        type="button"
        id="configure-heading"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50/80 sm:items-center sm:px-6 sm:py-5"
      >
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white sm:mt-0">
          2
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-[#0c1a3a]">Configuration & génération</span>
            <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 sm:inline">
              Modèle · Langue · Sections
            </span>
          </span>
          <span className="mt-1 block text-sm text-slate-600">
            {isOpen
              ? 'Affinez le modèle, la langue et les sections du document, puis lancez la génération.'
              : ideaHasContent
                ? `Résumé : ${includedSections.length} section(s) · ${langLabel} · ${modelShort}`
                : 'Rédigez d’abord votre idée ci-dessus, puis ouvrez ce panneau pour tout paramétrer.'}
          </span>
        </span>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
          {isOpen ? <ChevronUp className="h-5 w-5" aria-hidden /> : <ChevronDown className="h-5 w-5" aria-hidden />}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-6 border-t border-slate-100 px-5 pb-6 pt-2 animate-in slide-in-from-top-2 duration-200 sm:px-6 sm:pb-8">
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              <Sparkles className="h-4 w-4 text-blue-500" aria-hidden />
              Idées rapides
            </div>
            <p className="text-xs text-slate-500">
              Insère un canevas dans le champ de l’étape 1 — vous pourrez l’éditer avant de générer.
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onApplyPreset(preset)}
                  disabled={disabled}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3 text-blue-500 opacity-70 group-hover:opacity-100" aria-hidden />
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
              <Layers className="h-4 w-4 text-slate-500" aria-hidden />
              Paramètres du document
            </div>
            <OptionsPanel
              isOpen={optionsOpen}
              onToggle={onToggleOptions}
              language={language}
              onLanguageChange={onLanguageChange}
              languages={languages}
              includedSections={includedSections}
              onToggleSection={onToggleSection}
              sections={sections}
              modelOptions={modelOptions}
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              embedded
            />
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <GenerateButton
              onClick={onGenerate}
              disabled={generateDisabled}
              isLoading={isLoading}
            />
            <p className="text-xs leading-relaxed text-slate-500 sm:max-w-xs sm:text-right">
              La génération envoie votre brief et les sections cochées au modèle sélectionné (OpenRouter).
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
            >
              {error}
            </div>
          ) : null}
        </div>
      )}

      {!isOpen && error ? (
        <div
          role="alert"
          className="border-t border-red-100 bg-red-50/90 px-5 py-3 text-sm font-medium text-red-800 sm:px-6"
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}
