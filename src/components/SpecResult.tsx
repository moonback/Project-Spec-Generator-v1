import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Copy, Download, Printer, Check, FileCheck } from 'lucide-react';

interface SpecResultProps {
  spec: string;
  isLoading: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onPrint: () => void;
  copied: boolean;
}

export default function SpecResult({
  spec,
  isLoading,
  onCopy,
  onDownload,
  onPrint,
  copied
}: SpecResultProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (spec && resultRef.current && spec.length > 50) {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [spec.length > 50]);

  if (!spec && !isLoading) return null;

  return (
    <div ref={resultRef} className="pt-8 print:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-slate-900">
            Spécifications Techniques
          </h2>
          {spec && !isLoading && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              Généré
            </span>
          )}
        </div>

        {spec && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all hover:shadow-md group"
              title="Copier le Markdown"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-600">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium hidden sm:inline">Copier</span>
                </>
              )}
            </button>

            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all hover:shadow-md group"
              title="Télécharger en Markdown (.md)"
            >
              <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Télécharger</span>
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-2 px-3 py-2 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all hover:shadow-md group"
              title="Imprimer / Exporter en PDF"
            >
              <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Imprimer</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        {isLoading && !spec ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-slate-100 rounded-lg w-2/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded w-4/6"></div>
            </div>
            <div className="h-8 bg-slate-100 rounded-lg w-1/3 mt-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-full"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
            </div>
          </div>
        ) : (
          <div className="markdown-body prose prose-slate max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {spec}
            </ReactMarkdown>
          </div>
        )}

        {isLoading && spec && (
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200 text-slate-500 print:hidden">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Rédaction en cours par l'architecte IA...</span>
          </div>
        )}
      </div>
    </div>
  );
}
