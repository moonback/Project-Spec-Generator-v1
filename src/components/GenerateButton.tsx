import { Loader2, Rocket } from 'lucide-react';

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

export default function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
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
  );
}
