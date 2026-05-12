# 🗺️ ArchitectAI Development Roadmap

This document outlines the planned development phases for ArchitectAI, moving from the current MVP to a fully featured SaaS product.

## Phase 1: MVP (Completed) ✅
- [x] Basic React boilerplate setup with Vite and Tailwind CSS.
- [x] Integration with Google Gemini SDK (`@google/genai`).
- [x] Formulate a robust AI system prompt for tech spec generation.
- [x] Read-only UI rendering of generated markdown using `react-markdown`.
- [x] "Clean Minimalism" aesthetic implementation.
- [x] Included "Technical Risks & Mitigation Strategies" in the AI output.

## Phase 2: User Experience & Core Enhancements (Next) ✅
- [x] **Export Functionality**: Allow users to download the generated specification as a `.md` (Markdown) or `.pdf` file.
- [x] **Copy to Clipboard**: A quick copy button for the generated output text.
- [x] **Local History**: Save previous generated specs in the browser's `localStorage` so users don't lose their work if they refresh.
- [x] **Preset Prompts**: Add quick-select templates (e.g., "E-commerce SaaS B2B", "Application mobile de livraison", "Dashboard interne BI") to help users get started quickly.
- [x] **Loading Skeletons**: Improve the loading state with structured text skeletons instead of just a spinner.

## Phase 3: Advanced Features & Scale 🚀
- [ ] **Authentication**: Implement user login (via Supabase) to save projects in the cloud.
- [ ] **Project Management**: A dashboard to manage multiple saved project specifications.
- [ ] **Code Generation**: Use the generated specification as context to automatically bootstrap the initial codebase (Next.js/Node templates).
- [ ] **Diagram Generation**: Instruct the AI to generate Mermaid.js code for Database Schemas and System Architectures, and render them visually.
- [x] **Multi-language Support**: Allow users to select the output language (English, French, Spanish, etc.) via a UI dropdown.
- [x] **Customizable Blueprints**: Let the user customize the expected output structure (check/uncheck sections).

## Phase 4: Enterprise & Collaboration 🌟
- [ ] **Collaborative Editing**: Real-time multi-user editing of the generated spec after it has been created.
- [ ] **Jira/Trello Integration**: One-click export of structured User Stories directly to project management tools.
- [ ] **PDF Custom Branding**: Allow users to add their company logo to exported PDFs.
