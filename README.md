# ArchitectAI - Tech Spec Generator

## 📌 Project Overview
ArchitectAI is an AI-powered tool designed to transform a simple project idea into a complete, structured, and actionable technical specification. By leveraging the Google Gemini API, it simulates the expertise of a Senior Product Manager, Software Architect, and Tech Lead to provide a robust blueprint for any software project.

## ✨ Features
- **AI-Powered Specifications**: Generates detailed technical specs from a simple user prompt.
- **Comprehensive Structure**: Automatically formats the output into 11 critical sections including MVP features, system architecture, database schema, and potential technical risks.
- **Markdown Support**: Renders the generated specification with clean, readable Markdown syntax.
- **Clean Minimalism Aesthetic**: Provides a professional, distraction-free user interface.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Google Gemini API Key

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
Configure your `.env` file based on `.env.example`. You will need to provide your Gemini API key:
```env
GEMINI_API_KEY="your_api_key_here"
```

3. Run the development server:
```bash
npm run dev
```

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4
- **AI Integration**: `@google/genai` (Gemini 3.1 Pro Preview)
- **Markdown Render**: `react-markdown` and `remark-gfm`
- **Icons**: `lucide-react`

## 🧠 Output Structure Generated
The AI generates a specification with the following strict structure:
1. 📌 Résumé du projet (Project Summary)
2. 🎯 Objectifs business (Business Objectives)
3. 🚀 MVP (Minimum Viable Product)
4. 👤 User Stories
5. 🧠 Architecture système (System Architecture)
6. 🗄️ Modèle de données (Database Schema)
7. 🔌 API (Endpoints)
8. 🖥️ Pages UI nécessaires (UI Pages)
9. 🛠️ Stack technique recommandée (Recommended Stack)
10. 🗺️ Roadmap de développement (Development Roadmap)
11. ⚠️ Risques techniques & Stratégies de mitigation (Technical Risks & Mitigation)

## 📄 License
SPDX-License-Identifier: Apache-2.0
