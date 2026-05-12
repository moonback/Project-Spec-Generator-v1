# Roadmap produit — ArchitectAI (Tech Spec Generator)

*Analyse codebase — mise à jour : 12 mai 2026*

Ce document reflète l’état réel de l’application (`src/App.tsx`, auth, Supabase, génération OpenRouter) et les prochaines étapes prioritaires.

---

## État actuel (référence technique)

| Domaine | Implémenté |
|--------|-------------|
| **Stack** | React + TypeScript + Vite, Tailwind, `react-markdown` + remark-gfm |
| **IA** | OpenRouter (Chat Completions), modèle défini en constante dans `App.tsx` |
| **Génération** | Prompt multi-sections strict, langue FR/EN/ES, options de sections dans `config/sections.ts` |
| **Export** | Copie, Markdown, impression navigateur (PDF) |
| **Historique** | `localStorage` + chargement / upsert Supabase à la connexion |
| **Auth** | Supabase **obligatoire** : sans `VITE_SUPABASE_*`, écran de configuration. Sinon `AuthGate` : connexion mot de passe, inscription, lien magique (OTP) |
| **Données** | Table `projects` (spec + colonnes `section_*`, `language`, `included_sections`) via `buildProjectUpsertRow` + parsing Markdown `##` (`specSections.ts`). Schéma SQL + RLS dans `supabase/migrations/` |
| **Profils** | Table `profiles` + trigger à l’inscription (côté SQL) — **pas d’écran profil** dans l’app |

---

## Phase 1 — MVP produit

- [x] Saisie d’idée, presets, génération Markdown structurée
- [x] Sections activables / désactivables
- [x] Export MD + copie + impression
- [x] Rendu Markdown (GFM)

## Phase 2 — Fiabilité & persistance

- [x] Historique local (`localStorage`)
- [x] Intégration OpenRouter + messages d’erreur HTTP détaillés
- [x] Persistance cloud Supabase (`projects`) avec RLS utilisateur
- [x] Envoi des champs structurés (`section_*`, langue, sections incluses) lors de l’upsert
- [x] Auth obligatoire si Supabase configuré (pas d’usage anonyme du générateur)
- [x] Connexion email + mot de passe, inscription, lien magique
- [ ] **Indicateur / toasts** d’erreur ou de succès pour sync cloud (aujourd’hui `console.error` seulement)
- [ ] **Stratégie fusion** local ↔ cloud documentée (au login, `fetchCloudHistory` remplace l’historique en mémoire : risque d’écraser le local non synchronisé)
- [ ] **Sélection du modèle** dans l’UI ou via `.env` documenté (au lieu d’une seule constante dans le code)

## Phase 3 — Espace projets & qualité document

- [ ] **Liste « Mes projets »** : titres, dates, recherche — au-delà du panneau historique limité (10 entrées côté client après génération)
- [ ] **CRUD** : renommer idée / titre, supprimer un projet (Supabase + UI)
- [ ] **Écran profil** : lecture / mise à jour `profiles` (nom affiché, avatar)
- [ ] **Mot de passe oublié** : flux `resetPasswordForEmail` + page de redirection Supabase
- [ ] **Versioning** : sauvegarder plusieurs versions d’une même spec, comparer (diff Markdown)
- [ ] **Mermaid** : rendu des blocs ```mermaid``` dans `SpecResult` (dépendance + style)
- [ ] **Itération assistée** : régénérer une section seule ou « affiner cette spec » (second appel IA avec contexte)

## Phase 4 — Intégrations & gouvernance

- [ ] Export vers **Jira / Linear / Notion** (MVP : copie JSON ou CSV des stories)
- [ ] Templates de spec (secteurs : SaaS, mobile, data) injectés dans le prompt
- [ ] PDF export natif (au lieu du seul « Imprimer » navigateur) — optionnel
- [ ] OAuth social (Google, etc.) en complément du couple email / mot de passe

## Phase 5 — Automatisation & « copilote »

- [ ] Mode **copilote** : chat sur la spec générée (Q/R avec contexte tronqué)
- [ ] Suggestions de stack contraintes (coût, délai, conformité) — prompt dédié ou second modèle
- [ ] Score ou checklist de **faisabilité / risques** post-génération (règles + ou petit modèle)

---

## Dette / risques identifiés (hors roadmap fonctionnelle)

- Dépendance forte à **OpenRouter** + une clé côté client (`VITE_OPENROUTER_API_KEY`) : exposée au navigateur — à terme, proxy serveur ou Edge Function pour cacher la clé.
- **Parsing des sections** : heuristique sur titres `##` ; si le modèle change de format, enrichir le parseur ou imposer un format de sortie plus strict (JSON intermédiaire).
- **Limite 10** générations récentes en local avant sync : aligner avec pagination côté Supabase pour historique long.

---

## Légende

- `[x]` : livré dans le dépôt à la date d’analyse
- `[ ]` : non livré ou partiellement couvert
