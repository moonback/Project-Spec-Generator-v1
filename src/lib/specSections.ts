import { SECTIONS, type SectionId } from '../config/sections';

/** Colonnes Supabase (snake_case) */
const SECTION_ID_TO_DB: Record<SectionId, string> = {
  summary: 'section_summary',
  business: 'section_business',
  mvp: 'section_mvp',
  stories: 'section_stories',
  architecture: 'section_architecture',
  schema: 'section_schema',
  api: 'section_api',
  ui: 'section_ui',
  stack: 'section_stack',
  roadmap: 'section_roadmap',
  risks: 'section_risks',
};

/** Titres alternatifs (réponses EN/ES ou variantes du modèle) */
const SECTION_SYNONYMS: Record<SectionId, readonly string[]> = {
  summary: [
    'project summary',
    'executive summary',
    'overview',
    'resumen del proyecto',
    'resumen del producto',
  ],
  business: [
    'business objectives',
    'business goals',
    'objectives',
    'objetivos de negocio',
    'objetivos comerciales',
  ],
  mvp: ['minimum viable product', 'mvp scope', 'alcance mvp'],
  stories: ['user stories', 'historias de usuario', 'casos de uso'],
  architecture: ['system architecture', 'architecture', 'arquitectura del sistema', 'arquitectura'],
  schema: ['data model', 'database schema', 'modele de donnees', 'modelo de datos'],
  api: ['api', 'endpoints', 'rest api', 'graphql'],
  ui: ['ui pages', 'pages', 'user interface', 'pantallas', 'interfaces'],
  stack: ['recommended stack', 'tech stack', 'technology stack', 'stack tecnico'],
  roadmap: ['development roadmap', 'roadmap', 'planning', 'plan de desarrollo'],
  risks: ['technical risks', 'risks and mitigation', 'riesgos tecnicos', 'riesgos'],
};

function normalizeHeading(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleMatchesSection(title: string, sectionId: SectionId, label: string): boolean {
  const raw = title.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
  const t = normalizeHeading(raw);
  if (!t) return false;

  const l = normalizeHeading(label);
  const short = normalizeHeading(label.replace(/\([^)]*\)/g, '').trim());

  if (t === l || t === short) return true;
  if (t.includes(l) || l.includes(t)) return true;
  if (short.length > 4 && (t.includes(short) || short.includes(t))) return true;

  for (const syn of SECTION_SYNONYMS[sectionId]) {
    const n = normalizeHeading(syn);
    if (n && (t === n || t.includes(n) || n.includes(t))) return true;
  }
  return false;
}

function matchTitleToSectionId(title: string): SectionId | null {
  for (const s of SECTIONS) {
    if (titleMatchesSection(title, s.id, s.label)) return s.id;
  }
  return null;
}

/**
 * Découpe le Markdown sur les titres de niveau ## uniquement (évite les ### internes).
 */
export function parseSpecIntoSections(spec: string): Partial<Record<SectionId, string>> {
  const lines = spec.split('\n');
  const out: Partial<Record<SectionId, string>> = {};
  let currentId: SectionId | null = null;
  const buffer: string[] = [];

  const flush = () => {
    if (!currentId) return;
    const body = buffer.join('\n').trim();
    if (body) out[currentId] = body;
    buffer.length = 0;
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+)$/);
    if (m) {
      flush();
      const title = m[1].trim();
      currentId = matchTitleToSectionId(title);
      if (!currentId) buffer.length = 0;
    } else if (currentId) {
      buffer.push(line);
    }
  }
  flush();
  return out;
}

function inferIncludedSections(parsed: Partial<Record<SectionId, string>>): string[] {
  const present = new Set(Object.keys(parsed) as SectionId[]);
  const ordered = SECTIONS.map((s) => s.id).filter((id) => present.has(id));
  if (ordered.length > 0) return ordered;
  return SECTIONS.map((s) => s.id);
}

export type ProjectUpsertRow = {
  id: string;
  user_id: string;
  idea: string;
  spec: string;
  timestamp: string;
  language: string;
  included_sections: string[];
} & Record<
  | 'section_summary'
  | 'section_business'
  | 'section_mvp'
  | 'section_stories'
  | 'section_architecture'
  | 'section_schema'
  | 'section_api'
  | 'section_ui'
  | 'section_stack'
  | 'section_roadmap'
  | 'section_risks',
  string | null
>;

export function buildProjectUpsertRow(params: {
  id: string;
  userId: string;
  idea: string;
  spec: string;
  timestamp: number;
  language: string;
  includedSections: string[];
}): ProjectUpsertRow {
  const parsed = parseSpecIntoSections(params.spec);
  const included =
    params.includedSections.length > 0 ? params.includedSections : inferIncludedSections(parsed);

  const row = {
    id: params.id,
    user_id: params.userId,
    idea: params.idea,
    spec: params.spec,
    timestamp: new Date(params.timestamp).toISOString(),
    language: params.language,
    included_sections: included,
  } as ProjectUpsertRow;

  for (const s of SECTIONS) {
    const col = SECTION_ID_TO_DB[s.id];
    row[col] = parsed[s.id] ?? null;
  }

  return row;
}
