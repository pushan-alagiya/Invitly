# Invitly — Frontend

Invitly is a modern invitation platform built with Next.js and TypeScript. It provides tools to manage guests, send invitations, create and reuse templates, and a fully-featured visual editor for designing invitation templates (including AI-assisted image transformations and uploads via ImageKit).

This README focuses on the frontend app located at the repository root. If you have a companion backend, run it alongside the frontend for full functionality (image uploads, authentication, email sending, etc.).

## Key features

- Guest management (create, edit, import lists)
- Send invitations and track statuses
- Template creation and management
- Visual invitation editor (canvas-based editor using Fabric)
- Image uploads and AI image transforms (ImageKit integration via backend)
- PDF export and printing of invitations
- Admin section for roles, permissions and site-wide settings

## Tech stack

- Next.js (App Router) — version used in this project: see `package.json`
- React + TypeScript
- Tailwind CSS
- Fabric.js for canvas editing
- Redux Toolkit for state management
- Axios for HTTP requests
- ImageKit (uploads and transformations) via backend endpoints

## Quick start (development)

Prerequisites

- Node.js 18+ recommended
- Git
- The backend API (recommended) running and reachable. By default the frontend expects the backend base URL in `NEXT_PUBLIC_BASE_URL`.

Install dependencies

```bash
npm install
```

Start dev server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

Scripts (from `package.json`)

- `npm run dev` — start Next.js in development (with turbopack)
- `npm run build` — build for production
- `npm run start` — start the production server after build
- `npm run lint` — run linter

## Environment variables (frontend)

These are the main environment variables the frontend reads (defaults shown in code):

- `NEXT_PUBLIC_BASE_URL` — Base URL of the backend API. Default in code: `http://localhost:8001/api`
- `NEXT_PUBLIC_APP_NAME` — App name shown in UI. Default: `Invity`
- `NEXT_PUBLIC_VERSION` — API version appended to `NEXT_PUBLIC_BASE_URL` (default `v1`).

Full request flow: the frontend constructs requests with `BASE_URL + '/' + APP_VERSION` and then passes path strings such as `/imagekit/upload`. So if you keep defaults the frontend will call `http://localhost:8001/api/v1/imagekit/upload`.

Note: sensitive keys (ImageKit private keys, database credentials, email provider secrets) belong in the backend. The frontend only relies on backend endpoints for secure operations (signature, uploads, etc.).

## Backend endpoints the frontend expects (examples)

The frontend uses the `BaseClient` Axios instance to hit endpoints under the configured base URL + API version. Important endpoints used by the image/upload features:

- `POST /imagekit/auth-params` — request a signed ImageKit upload payload from the backend
- `POST /imagekit/upload` — backend handles the actual upload to ImageKit
- `POST /imagekit/ai-transform` — request AI image processing / generative edits
- `GET /imagekit/uploaded-images` — list images already uploaded

Other frontend features (guests, invitations, templates, admin) assume typical REST endpoints under the same API base (for example `/guests`, `/invitations`, `/templates`, etc.). Check the backend repo for exact routes and payloads.

## ImageKit & editor notes

- The frontend includes `lib/imagekit-service.ts` which contains a `demoMode` flag (default: `false`). When `demoMode` is `true` the service returns placeholder/demo images and doesn’t call the backend. Toggle this for offline UI development or demos.
- The visual editor lives under `components/editor/*`. It uses Fabric.js and helper libraries (Jimp, jspdf) for image manipulation and export.
- For full image upload and AI operations, ensure the backend is configured with ImageKit keys and exposes the signed endpoints listed above.

## Project structure (high level)

- `app/` — Next.js App Router pages and layouts
- `components/` — React components (editor, admin, UI primitives)
- `api/` — frontend API client and helper wrappers (`ApiClient.ts`)
- `lib/` — lightweight services/helpers (imagekit-service, editor-state, utils)
- `store/` — Redux store and slices
- `public/` — static assets
- `styles/` or `app/globals.css` — global styles

## Editor & template workflow (developer notes)

- Templates are stored and loaded by the frontend via template endpoints. The editor supports multi-page templates and layers (see `MultiPageEditor.tsx`, `LayerPanel.tsx`, `JsonCanvas.tsx`).
- Exporting: PDF and image export uses `jspdf` / `pdf-lib` and browser APIs to generate downloadable files.

## Troubleshooting

- Uploads failing / 403 / 401: verify `NEXT_PUBLIC_BASE_URL` points to a running backend that returns signed params for ImageKit. Check backend logs for request details.
- CORS errors: ensure backend allows your frontend origin in CORS settings.
- Editor rendering issues: Fabric depends on correct canvas initialization — try clearing application state or check console for Fabric errors.
- If you want to run frontend without backend for UI-only work, set `demoMode = true` in `lib/imagekit-service.ts` to avoid network calls and get mock images.

## Linting & type checks

- Lint: `npm run lint`
- TypeScript types are included; run `tsc --noEmit` if you need a full typecheck outside the Next build.

## Deployment

- Recommended: Vercel (Next.js is supported out-of-the-box). Set the environment variables in your Vercel project dashboard.
- On your production server, run:

```bash
npm install --production
npm run build
npm run start
```

Make sure the backend is available to the production frontend and that production env vars are configured.

## Contributing

- Please follow existing project conventions (TypeScript, React hooks, and Tailwind for styling).
- Add unit tests or integration tests for new features where appropriate.

## Notes / Known gaps

- No LICENSE file found in this repo — add one if you want to clarify reuse terms.
- Exact backend route names and JSON payloads are implemented in the backend repository. If you need me to extract the specific routes used by non-image features (guests, invitations, templates), I can scan the frontend components and list them.

---

If you'd like, I can also:

- Add a short `CONTRIBUTING.md` and small developer checklist
- Extract and list all backend endpoints used by the frontend automatically
- Create a `.env.example` with the variables shown above

Tell me which of these extras you'd like next.
