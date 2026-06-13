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

This is a React 19 + TypeScript + Vite multi-role platform for academic/institutional PDF document evaluation. It supports three user roles — **student**, **evaluator**, and **admin** — each with its own interface. All data is currently mocked in memory; no backend exists yet.

### Feature-first structure

All domain logic lives under `src/features/<feature-name>/`. Shared infrastructure (types, services, components, styles) lives under `src/shared/`.

```
src/
├── app/
│   ├── router/index.tsx            # React Router v7 — all routes, role-based redirect
│   └── providers/AppProviders.tsx  # Wrapper for future global providers
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx           # User-card login (simulated auth, no backend)
│   │   └── login.css
│   ├── evaluation/                 # Original standalone PDF evaluation module
│   │   ├── types/                  # EvaluationSession, Criterion, EvaluationMatrix, etc.
│   │   ├── services/               # evaluationService.ts — mocked, swap for API here
│   │   ├── hooks/                  # usePDFViewer (local UI), useEvaluation (store + service)
│   │   ├── components/
│   │   │   ├── EvaluationHeader.tsx
│   │   │   ├── PDFViewer/          # PDFViewer.tsx + PDFControls.tsx
│   │   │   └── CriteriaPanel/      # CriteriaPanel, CriterionItem, ObservationForm
│   │   ├── EvaluationPage.tsx      # Two-panel layout (PDF left, criteria right)
│   │   └── evaluation.css
│   ├── student/
│   │   ├── SubmissionPage.tsx      # Upload/view/edit/delete document submission
│   │   ├── components/
│   │   │   ├── SubmissionCard.tsx  # Shows doc, status, grade, evaluator feedback
│   │   │   └── UploadModal.tsx     # Drag-and-drop file + comment, create/edit modes
│   │   └── student.css
│   ├── evaluator/
│   │   ├── EvaluatorDashboard.tsx  # Assigned students list with filter pills
│   │   ├── components/
│   │   │   ├── StudentCard.tsx     # Student row with status badge and review button
│   │   │   ├── ReviewPage.tsx      # Full-screen 4-stage review (no AppShell)
│   │   │   └── StageNav.tsx        # Horizontal stage indicator in review header
│   │   ├── hooks/
│   │   │   └── useReview.ts        # Bridges reviewStore + platformService
│   │   └── evaluator.css
│   └── admin/
│       ├── AdminDashboard.tsx      # All evaluators with their assigned students
│       ├── components/
│       │   └── AssignmentPanel.tsx # Two-column selector to create/remove assignments
│       └── admin.css
├── shared/
│   ├── types/
│   │   └── platform.types.ts       # User, UserRole, StudentSubmission, Review, ReviewStage, Assignment
│   ├── services/
│   │   └── platformService.ts      # In-memory mock DB — users, submissions, reviews, assignments
│   ├── components/
│   │   └── AppShell.tsx            # 220px dark sidebar + Outlet; used by all dashboard routes
│   └── styles/
│       └── platform.css            # Shared styles: badges, modals, upload-zone, filter pills
├── store/
│   ├── evaluationStore.ts          # Zustand — active EvaluationSession (evaluation module)
│   ├── authStore.ts                # Zustand — currentUser (User | null), setUser, logout
│   └── reviewStore.ts              # Zustand — active Review, stage mutations
├── utils/cn.ts                     # Classname helper
└── index.css                       # Design tokens (CSS custom properties) + reset
```

### Routes

| Path | Layout | Role |
|------|--------|------|
| `/login` | none | all |
| `/` | none | all (redirects by role) |
| `/estudiante` | AppShell | student |
| `/evaluador` | AppShell | evaluator |
| `/evaluador/revision/:submissionId` | none (full-screen) | evaluator |
| `/admin` | AppShell | admin |
| `/admin/asignaciones` | AppShell | admin |
| `/evaluacion` | none (full-screen) | evaluator (legacy) |
| `/evaluacion/:id` | none (full-screen) | evaluator (legacy) |

`RootRedirect` (in router) reads `authStore` and sends users to their home route.

### State management

Three Zustand stores, each with a single concern:

- **`authStore`** — `currentUser: User | null`. Set on login, cleared on logout. All role-based logic reads from here.
- **`evaluationStore`** — active `EvaluationSession` for the legacy standalone evaluation module.
- **`reviewStore`** — active `Review` for the multi-stage evaluator review flow. Mutations update criteria by stage index + criterion id, immutably.

Feature hooks are the only consumers of both store and service layer. Components receive only what they need as props and never import stores directly.

### Data flow — review module

```
platformService (mock DB)
        ↓  getOrCreateReview / saveReview
useReview (hook)                reviewStore
        ↓  props                      ↑ mutations
ReviewPage
        ├──→ StageNav          (stages array, currentStageIndex)
        ├──→ CriteriaPanel     (fake EvaluationSession built from current stage)
        └──→ FinalizeModal     (grade + comment on last stage)
```

`ReviewPage` constructs a synthetic `EvaluationSession` from the current `ReviewStage` so it can reuse `CriteriaPanel` without modifying it.

### Data flow — evaluation module (unchanged)

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

### Mock data (platformService)

Module-level mutable arrays simulate an in-memory database. Seeded with:
- 1 admin, 2 evaluators (Prof. García, Prof. López), 3 students (Juan, María, Carlos)
- 2 assignments: García→Juan, García→María
- Juan: reviewed submission (grade 8.5, all review stages complete)
- María: under-review submission (stage 1 complete, stage 2 in progress)
- Carlos: no submission

Swapping to a real API requires only replacing `platformService.ts` — the hook and store interfaces stay the same.

### Styling

All styles use plain global CSS with CSS custom properties. No CSS modules, no Tailwind.

- Design tokens: `src/index.css` — variables `--c-*`, `--r-*`, `--shadow-*`
- Shared platform styles: `src/shared/styles/platform.css` — badges, modals, upload-zone, filter pills
- Feature styles: `<feature>/feature.css`, imported once by the feature's page component

### PDF rendering

`react-pdf` (wraps PDF.js). The worker is configured via `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)` inside `PDFViewer.tsx` — this is module-level and must stay there. Annotation and text layers are enabled; their CSS is imported at the component level.

### Adding a new feature

1. Create `src/features/<name>/` with subdirectories mirroring existing features.
2. Add the route in `src/app/router/index.tsx` — wrap in `<AppShell>` if it needs the sidebar.
3. If the feature needs global state, add a new Zustand store in `src/store/`.
4. Add mock data to `platformService.ts`; the service file exports an object with async methods so swapping to a real API requires only that file.

### Prepared extension points

- `PDFAnnotation` type is defined in `evaluation.types.ts` for future coordinate-based PDF annotations.
- `EvaluationSession.documentUrl` is present for loading PDFs from a remote URL.
- `AppProviders.tsx` is the place to add React Query, auth context, or theme providers.
- `authStore` is the natural integration point for a real auth provider (JWT, session cookie, etc.).
