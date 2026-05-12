import type { HistoryItem } from './historyTypes';

const MAX_HISTORY_ITEMS = 50;

/**
 * Fusionne l’historique cloud et local par `id`.
 * En cas de même id, conserve l’entrée au timestamp le plus récent (dernière modification gagne).
 * Résultat trié du plus récent au plus ancien, taille plafonnée.
 */
export function mergeHistoryById(cloud: HistoryItem[], local: HistoryItem[]): HistoryItem[] {
  const map = new Map<string, HistoryItem>();

  for (const item of local) {
    map.set(item.id, item);
  }

  for (const item of cloud) {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
    } else if (item.timestamp >= existing.timestamp) {
      map.set(item.id, item);
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_HISTORY_ITEMS);
}
