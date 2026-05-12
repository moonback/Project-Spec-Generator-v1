import { Lightbulb } from 'lucide-react';

interface IdeaInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export default function IdeaInput({ value, onChange, disabled }: IdeaInputProps) {
  return (
    <section className="space-y-5" aria-labelledby="idea-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-800">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
              1
            </span>
            Brief projet
          </div>
          <h2 id="idea-heading" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#0c1a3a] sm:text-xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </span>
            Décrivez votre idée de projet
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-600">
            Concentrez-vous sur le problème utilisateur, le périmètre fonctionnel et les contraintes (budget, délais,
            intégrations). Les réglages fins (modèle, langue, sections) viennent à l’étape suivante.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-1 shadow-inner">
        <textarea
          id="idea-input"
          rows={8}
          className="w-full resize-y rounded-[14px] border border-slate-200/80 bg-white px-4 py-3.5 text-sm leading-relaxed text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[180px]"
          placeholder="Exemple : plateforme SaaS B2B de gestion de projets avec suggestions IA, temps réel, rôles admin/membre, intégrations Slack et GitHub, objectif MVP en 10 semaines…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <span className="tabular-nums">{value.length} caractères</span>
        <span className={value.trim().length >= 50 ? 'font-medium text-emerald-600' : ''}>
          {value.trim().length >= 50 ? 'Brief suffisant pour passer à la configuration' : 'Viser au moins une dizaine de lignes pour une spec exploitable'}
        </span>
      </div>
    </section>
  );
}
