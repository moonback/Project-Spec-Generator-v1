import { Clock, Cloud } from 'lucide-react';

interface HistoryItem {
  id: string;
  idea: string;
  spec: string;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadItem: (item: HistoryItem) => void;
  hasCloudSync: boolean;
}

export default function HistoryPanel({ history, onLoadItem, hasCloudSync }: HistoryPanelProps) {
  return (
    <div
      id="historique"
      className="scroll-mt-24 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12)] print:hidden"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-600" />
        <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
          Historique récent
        </h3>
        {hasCloudSync && (
          <Cloud className="w-4 h-4 text-emerald-500 ml-auto" aria-label="Synchronisé dans le cloud" />
        )}
      </div>

      {history.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-600 leading-relaxed">
          Aucune spec enregistrée pour l’instant. Générez un premier cahier des charges : il apparaîtra ici et sera
          synchronisé avec le cloud si vous êtes connecté.
        </p>
      ) : null}

      <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => onLoadItem(item)}
            className="w-full text-left p-4 border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                  {item.idea}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-xs text-slate-400 group-hover:text-blue-500 transition-colors">
                →
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
