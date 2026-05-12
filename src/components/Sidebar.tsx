import { FileText, Blocks, Layout, Zap } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-8">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
          Ce que vous obtiendrez
        </h3>
      </div>

      <ul className="space-y-3">
        <li className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">
                Business & MVP
              </p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Objectifs business, features prioritaires, public cible et proposition de valeur.
              </p>
            </div>
          </div>
        </li>

        <li className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <Blocks className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-1">
                Architecture & Stack
              </p>
              <p className="text-sm text-purple-800 leading-relaxed">
                Choix techniques justifiés, architecture système, modèle de données et APIs.
              </p>
            </div>
          </div>
        </li>

        <li className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-lg shadow-sm">
          <div className="flex items-start gap-3">
            <Layout className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wide mb-1">
                Planning & Roadmap
              </p>
              <p className="text-sm text-emerald-800 leading-relaxed">
                User stories détaillées, roadmap de développement et gestion des risques.
              </p>
            </div>
          </div>
        </li>
      </ul>

      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-900">💡 Astuce :</span> Plus votre description est détaillée, 
          plus le document généré sera précis et adapté à vos besoins.
        </p>
      </div>
    </div>
  );
}
