# ArchitectAI - Tech Spec Generator

## 📌 Vue d'ensemble
ArchitectAI transforme une idée produit en spécification technique exécutable (Markdown), prête à être utilisée par une équipe produit/tech. L’application utilise désormais **OpenRouter** avec le modèle **`openai/gpt-oss-120b:free`**.

## ✨ Fonctionnalités
- Génération de specs techniques détaillées depuis un simple brief.
- Structure en sections activables/désactivables (MVP, architecture, API, risques, etc.).
- Sélection de langue de sortie (FR/EN/ES).
- Historique local (localStorage) + synchronisation cloud optionnelle (Supabase).
- Export Markdown, impression PDF, copie rapide.

## 🚀 Démarrage

### Prérequis
- Node.js 18+
- npm
- Une clé API OpenRouter

### Installation
```bash
npm install
```

### Variables d'environnement
Créez un fichier `.env` à la racine :
```env
VITE_OPENROUTER_API_KEY="your_openrouter_api_key"
```

> Optionnel (si vous utilisez l’auth + sync cloud) : variables Supabase selon votre config.

### Lancer en développement
```bash
npm run dev
```

## 🛠️ Stack technique
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- OpenRouter Chat Completions API
- Modèle: `openai/gpt-oss-120b:free`
- `react-markdown` + `remark-gfm`
- Supabase (auth / sauvegarde cloud, optionnel)

## 🧠 Qualité de génération (améliorations)
- Prompt renforcé pour produire du contenu actionnable (priorités P0/P1/P2, complexité S/M/L, hypothèses explicites).
- Contrôle strict des sections sélectionnées.
- Gestion d’erreurs API plus explicite pour faciliter le debug.

## 📄 Licence
SPDX-License-Identifier: Apache-2.0
