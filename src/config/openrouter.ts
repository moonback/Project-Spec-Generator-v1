export const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const FALLBACK_MODELS = [
  'arcee-ai/trinity-large-thinking:free',
  'openai/gpt-oss-120b:free'
] as const;

const MODEL_STORAGE_KEY = 'architect-ai-openrouter-model';

function uniqueModels(models: string[]): string[] {
  return [...new Set(models.map((m) => m.trim()).filter(Boolean))];
}

/**
 * Liste des modèles proposés : `VITE_OPENROUTER_MODELS` (séparateur virgule),
 * ou `VITE_OPENROUTER_MODEL` seul, sinon liste par défaut.
 */
export function getOpenRouterModelOptions(): string[] {
  const list = import.meta.env.VITE_OPENROUTER_MODELS;
  if (typeof list === 'string' && list.trim()) {
    const parsed = uniqueModels(list.split(','));
    if (parsed.length) return parsed;
  }
  const single = import.meta.env.VITE_OPENROUTER_MODEL?.trim();
  if (single) return [single];
  return [...FALLBACK_MODELS];
}

/** Modèle au premier chargement : .env → localStorage → premier de la liste */
export function resolveInitialModelChoice(models: string[]): string {
  if (!models.length) return FALLBACK_MODELS[0];
  const envDefault = import.meta.env.VITE_OPENROUTER_MODEL?.trim();
  if (envDefault && models.includes(envDefault)) return envDefault;
  try {
    const stored = localStorage.getItem(MODEL_STORAGE_KEY);
    if (stored && models.includes(stored)) return stored;
  } catch {
    /* ignore */
  }
  return models[0];
}

export function persistSelectedModel(model: string): void {
  try {
    localStorage.setItem(MODEL_STORAGE_KEY, model);
  } catch {
    /* ignore */
  }
}
