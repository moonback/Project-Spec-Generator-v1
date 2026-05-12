import type { HistoryItem } from './historyTypes';

export const HISTORY_STORAGE_KEY = 'architect-ai-history';

export function readHistoryFromStorage(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (row): row is HistoryItem =>
        typeof row === 'object' &&
        row !== null &&
        typeof (row as HistoryItem).id === 'string' &&
        typeof (row as HistoryItem).idea === 'string' &&
        typeof (row as HistoryItem).spec === 'string' &&
        typeof (row as HistoryItem).timestamp === 'number'
    );
  } catch {
    return [];
  }
}

export function writeHistoryToStorage(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota / private mode */
  }
}
