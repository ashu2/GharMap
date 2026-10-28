# GharMap — project context (handoff from Claude chat)

GharMap is a personal side project: a home/family inventory app built around a spatial map of the home (spaces → items). Family members share data across phones.

## Code (Phase 0: browser-only web UI)
- npm workspaces monorepo. `packages/core` = plain TS logic (no UI, no DOM rendering) reused by the Phase 1 Expo app; `apps/web` = React 18 + Vite 5 + React Router.
- Commands: `npm run dev`, `npm test` (Vitest, core only), `npm run e2e` (Playwright, mobile + desktop projects, uses installed Chrome on port 5174), `npm run typecheck`, `npm run build`.
- Responsive: one component tree; phone = bottom tab bar, ≥900 px = sidebar + 3-column map + centred dialogs. Breakpoint lives in both `useWide.ts` and the `@media` block at the end of `styles.css`.
- Any UI change should keep `npm run e2e` green for both projects.
- All data edits go through pure functions in `packages/core/src/ops.ts`; the web store (`apps/web/src/store.tsx`) only holds state and persists it.
- Persistence is `localStorage` for now; `load`/`save` in `store.tsx` are the seam for the planned SQLite WASM (OPFS) worker.
- Client-generated UUIDs (`newId`, with a fallback for non-secure contexts like a phone hitting the LAN dev server).
- `design/phase0-mockup/` is the original Claude Design canvas mockup — reference only, not built.
- Planning docs live in `docs/` (build plan, risk notes, source chats).
- The repo sits in Google Drive: keep `node_modules/` and `dist/` out of anything that must sync.

## Architecture decisions so far
- Local-first: SQLite on each device, Postgres on the server.
- Sync via **PowerSync** (no custom sync engine).
- Soft deletes everywhere (never hard-delete synced rows).
- Daily encrypted export of local SQLite to JSON, saved on-device, as a restore path if Postgres corrupts.
- In-app sync status + "Export backup" control (e.g. "Last sync 2 hrs ago").

## Rollout plan
- Phase 2: Ashutosh + Priya only. Run deliberate conflict tests before any wider beta:
  - Two phones edit the same item offline, then sync.
  - Device A deletes a space while device B adds an item to it.
- Phase 3: add one parent.
- After a month of clean sync, invite the rest of the family.

## Risk review (28 Oct 2026)
- Risk 1 (20+ hrs/week unsustainable): dropped — roadmap is a target, not a plan.
- Risk 2 (data-entry fatigue): dropped — filling the empty map is the motivation.
- Risk 3 (scope creep): deferred until UX is further along.
- Risk 4 (sync bugs lose family data): mitigations above.
- Still to discuss:
  - Privacy promise breaks (reputational, legal)
  - Storing ID document images (Aadhaar, passport) — high-value target
  - Gold value shown wrong (users make bad decisions)
  - Cloud AI sending home data off-device (conflicts with privacy pitch)
  - Solo bus factor
