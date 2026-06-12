# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Type-check then build for production (tsc -b && vite build)
npm run lint      # ESLint
npx tsc --noEmit  # Type-check only, no build artifacts
```

There are no tests configured yet.

## Architecture

This is a React 19 + TypeScript + Vite application for academic/institutional PDF document evaluation. The current version implements the evaluation module only; the architecture is designed to grow into a larger multi-module platform.

### Feature-first structure

All domain logic lives under `src/features/<feature-name>/`. The only feature currently implemented is `evaluation`.

```
src/
├── app/
│   ├── router/index.tsx        # React Router v7 — BrowserRouter with routes
│   └── providers/AppProviders.tsx  # Wrapper for future global providers
├── features/
│   └── evaluation/
│       ├── types/              # TypeScript interfaces (EvaluationSession, Criterion, etc.)
│       ├── services/           # evaluationService.ts — currently mocked, replaces with API calls
│       ├── hooks/              # usePDFViewer (local UI state), useEvaluation (bridges store + service)
│       ├── components/
│       │   ├── EvaluationHeader.tsx
│       │   ├── PDFViewer/      # PDFViewer.tsx + PDFControls.tsx
│       │   └── CriteriaPanel/  # CriteriaPanel, CriterionItem, ObservationForm
│       ├── EvaluationPage.tsx  # Composes the two-panel layout
│       └── evaluation.css      # All styles for this feature (global CSS classes, no modules)
├── store/
│   └── evaluationStore.ts      # Zustand store — single source of truth for session state
├── utils/cn.ts                 # Classname helper
└── index.css                   # Design tokens (CSS custom properties) + reset
```

### State management

**Zustand** (`src/store/evaluationStore.ts`) holds the active `EvaluationSession`, including all criteria with their status/observation/page-reference. The store is mutated immutably — every criteria update maps over `session.matrix.criteria`.

**`useEvaluation`** (feature hook) is the only consumer of both the store and the service layer. Components receive only what they need as props — they never import the store directly.

**`usePDFViewer`** is pure local state (page, zoom, loaded file) — it has no connection to the store.

### Data flow

```
evaluationService (mock/API)
        ↓  getSession / saveSession
useEvaluation (hook)
        ↓  props
EvaluationPage
        ├──→ EvaluationHeader   (stats, save action)
        ├──→ PDFViewer          (file, pagination, zoom — from usePDFViewer)
        └──→ CriteriaPanel      (session, mutation callbacks)
```

### Styling

All styles use plain global CSS with CSS custom properties. Design tokens are defined in `src/index.css` (variables named `--c-*`, `--r-*`, `--shadow-*`). Feature-specific styles live in `evaluation.css`, imported once by `EvaluationPage.tsx`. There are no CSS modules.

### PDF rendering

`react-pdf` (wraps PDF.js). The worker is configured via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` inside `PDFViewer.tsx` — this is module-level and must stay there. Annotation and text layers are enabled; their CSS is imported at the component level.

### Adding a new feature

1. Create `src/features/<name>/` with the same subdirectory structure.
2. Add the route in `src/app/router/index.tsx`.
3. If the feature needs global state, add a new Zustand store in `src/store/`.
4. The service file should export an object with async methods so swapping to a real API requires only that file.

### Prepared extension points

- `PDFAnnotation` type is defined in `evaluation.types.ts` for future coordinate-based PDF annotations.
- `EvaluationSession.documentUrl` is present for loading PDFs from a remote URL instead of a local file upload.
- The router already has a `/evaluacion/:id` route for loading sessions by ID.
- `AppProviders.tsx` is the place to add React Query, auth context, or theme providers.
