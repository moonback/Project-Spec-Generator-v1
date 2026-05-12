export const SECTIONS = [
  { id: 'summary', default: true, label: 'Résumé du projet' },
  { id: 'business', default: true, label: 'Objectifs business' },
  { id: 'mvp', default: true, label: 'MVP (Minimum Viable Product)' },
  { id: 'stories', default: true, label: 'User Stories' },
  { id: 'architecture', default: true, label: 'Architecture système' },
  { id: 'schema', default: true, label: 'Modèle de données' },
  { id: 'api', default: true, label: 'API Endpoints' },
  { id: 'ui', default: true, label: 'Pages UI' },
  { id: 'stack', default: true, label: 'Stack technique recommandée' },
  { id: 'roadmap', default: true, label: 'Roadmap de développement' },
  { id: 'risks', default: true, label: 'Risques techniques & Mitigation' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
