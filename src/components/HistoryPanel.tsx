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
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 print:hidden">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slate-600" />
        <h3 className="text-sm font-bold uppercase tracking-tight text-slate-900">
          Historique récent
        </h3>
        {hasCloudSync && (
          <Cloud className="w-4 h-4 text-emerald-500 ml-auto" aria-label="Synchronisé dans le cloud" />
        )}
      </div>

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
