# GharMap — Build Plan

Oct 27, 2026 · @Ashutosh

## Summary

Build GharMap in four gated phases over 12 months: a local-only app for our own Gurgaon flat first, then family sync, then AI and gold, then a public beta. Each phase must prove one thing before the next one starts.

- **What it is:** a mobile app that maps a home as nested spaces (home → room → unit → compartment → item) and answers "where is it?" instantly.
- **Goal, in stages:** our own use first (months 1–3), a portfolio piece showing architecture and AI work (months 4–7), then a startup test with real families (months 8–12).
- **Constraints:** solo build with AI coding help, 20+ hours a week, AWS serverless, Node + React (React Native for mobile), Postgres, low running cost.
- **Core strategy:** win on one job, finding things fast, before adding gold, pantry, documents and AI. The vision deck has about ten products; the MVP has one.

## Review of the vision deck

The spatial map and search-with-highlight are the real differentiators; most other screens are features existing apps already do. Three things in the deck need fixing before any code.

| Area | Verdict | Why |
| --- | --- | --- |
| Spatial map + search highlight | Keep, build first | The unique idea. No common home app shows the exact path to an item. |
| Item detail + history | Keep, simplified | Name, location, photo, notes in v1. Value and history later. |
| Multiple homes, family sharing | Keep, phase 2 | Needed for real family use, but it forces the sync decision. |
| Document vault + expiry tracker | Keep, phase 2 | High value, low effort: reminders on dates. Store only what you must. |
| Bulk scan, GharAI | Keep, phase 3 | Strong demo value; depends on a cloud vision/LLM model. |
| Gold vault | Phase 3, narrower | Track weight, purity, hallmark, location. Show an indicative value only. |
| Pantry + shopping list | Last, or cut | Crowded space (quick-commerce apps already do this) and needs daily updates. |
| Home analytics | Cut for now | Vanity for a personal app; revisit with real data. |

**Fix 1: the privacy promise.** "Zero user data on our servers" cannot coexist with live family sync, cloud AI answers, or your Postgres-on-AWS stack. Pick one model (Decisions, below) and make the promise match it.

**Fix 2: data entry is the real risk.** The deck shows 247 items already entered. Getting there is hours of typing. If adding an item takes more than about 10 seconds, nobody gets past the first room.

**Fix 3: gold numbers are already stale.** The deck uses ₹9,840/g for 24K as a 2035 figure. 22K was already around ₹13,000–14,000/g in Aug–Sep 2026 ([goldmeter](https://goldmeter.in/ta/), [psuconnect](https://www.psuconnect.in/articles/gold-rate-today-5-sept-24k-22k-prices-update-check-city-wise-list)). Use a live rate API and label values "indicative, excludes making charges".

## Decisions to make first

Five decisions shape everything else. All five recommendations below were confirmed on 28 Oct 2026, with one change: Phase 0 is a web app only.

1. **Privacy and sync model.** Recommended: *local-first, cloud sync opt-in.* The phone's SQLite database is the source of truth and works offline. Family sync, when switched on, replicates to Postgres on AWS through a sync engine. The promise becomes "your data stays on your phone unless you turn on family sync; synced data is encrypted at rest and never sold". Alternative: pure local with encrypted file sharing on WhatsApp. It is more private, but it is not live sync and conflicts get messy.
2. **Graph database.** Recommended: *no graph DB.* The home is a tree, not a graph. Postgres handles trees well with a parent\_id column plus a materialised path (or the ltree extension), queried with recursive CTEs. Amazon Neptune has no free tier and its serverless option costs about $80/month at the 1 NCU minimum ([wring](https://wring.co/blog/aws-neptune-pricing-guide), [usage.ai](https://www.usage.ai/blogs/aws/database-savings-plans/neptune/serverless-ncu-pricing/)). Revisit only if you add true graph features, such as "items related to this warranty".
3. **Images and "image DB".** Recommended: S3 for files, Postgres for metadata, and pgvector embeddings in Postgres for image and semantic search. No separate image database.
4. **Mobile framework.** Recommended: React Native with Expo. It reuses your React prototype, ships Android and iOS from one codebase, and the main local-first sync engine has an Expo SDK ([PowerSync](https://apis.io/providers/powersync/)). Phase 0 is a browser-only web app (React + Vite) to test the idea fast; Expo starts in Phase 1 and reuses Phase 0's core code. Start Android-only for the beta, since most target families are on Android.
5. **Sync engine.** Recommended: PowerSync, which syncs Postgres to on-device SQLite. Its cloud has a free tier and a $49/month Pro plan, and an open edition can be self-hosted ([toolradar](https://toolradar.com/compare/powersync-vs-supabase-realtime)). Writing your own sync is a classic solo-project trap.

Open question: is iOS needed in year one? (Priya's phone decides it.)

## Roadmap

Five phases from November 2026 to October 2027. Each one ends with something the family can use, and a gate decides whether the next starts.

&#91;embedded content: GharMap roadmap · 5 phases, 5 gates\]

If a gate fails, fix that phase before adding features. If Gate 4 fails, GharMap stays a strong personal app and portfolio piece, which still meets two of the three goals.

## Phase 0 design: web UI only

Phase 0 is a browser-only web app with no backend, no login and no cloud. In two weeks (2–15 Nov 2026) it answers one question: will the family keep entering and finding items?

**In scope**

- Spatial map: rooms as nested rectangles, tap to zoom, breadcrumb back out
- Quick add: name plus location in under 10 seconds; everything else optional
- Search with path highlight: type "passport", see Master Bedroom → Wooden Almirah → Right Side lit up
- Item detail: edit, move to another space, simple history
- Seed data from the prototype's `homeData`; JSON export and import as backup
- A built-in timer that logs seconds per item added (the Gate 0 measure)
- Installable on a phone as a PWA, so Priya can test it on her phone's browser

**Out of scope:** login, sync, photo upload, multiple homes, family roles, gold, pantry, documents, reminders, AI.

### Screens

| # | Screen | Purpose | Key elements |
| --- | --- | --- | --- |
| 1 | Home map | The flagship view | Rooms as rectangles, search bar on top, + button |
| 2 | Space view | Zoom into a room or unit | Child spaces as tiles, item list, breadcrumb, add space or item |
| 3 | Quick add (bottom sheet) | Add in under 10 s | Name with autocomplete, current location prefilled, "Save and add another" |
| 4 | Item detail | View, edit, move | Name, full path, qty, notes, move picker, history |
| 5 | Search results | Find anything | Matches with full path; tap opens the map with the path highlighted |
| 6 | Settings | Data and stats | Export/import JSON, reset demo data, seconds-per-item stats |

### Tech choices

| Layer | Choice | Why |
| --- | --- | --- |
| UI | React + Vite + TypeScript, Tailwind CSS, React Router | Your existing React skills and prototype; fast builds |
| Storage | Official SQLite WASM (`@sqlite.org/sqlite-wasm`) in a Web Worker, persisted in OPFS with the `opfs-sahpool` VFS | Same SQL schema and FTS5 search as the phone app later, so no rewrite. Survives page reloads |
| Offline + install | `vite-plugin-pwa` | Works offline, installs to the home screen |
| Hosting | Local dev; for the family test, a static build on S3 + CloudFront | A few cents a month; first piece of the AWS setup |
| Tests | Vitest for the core, one Playwright smoke test | Catches regressions in the path and search logic |

Notes on storage: OPFS-backed SQLite must run in a Worker, not on the main thread, and needs Chromium 108+, Firefox 111+ or Safari 16.4+ ([OpenReplay](https://blog.openreplay.com/sqlite-browser-opfs/)). The `opfs-sahpool` VFS needs no special cross-origin headers, which keeps hosting simple ([dynoxide](https://docs.rs/crate/dynoxide-rs/latest/source/docs/wasm.md)). Fallback if WASM setup eats more than two days: IndexedDB (Dexie) + MiniSearch, accepting a schema port in Phase 1.

### Code layout, built to carry into Phase 1

- `packages/core`: schema, SQL queries, path and search logic, all plain TypeScript, no UI. Phase 1's Expo app reuses it as is.
- `apps/web`: the Phase 0 React UI.
- `apps/mobile`: added in Phase 1.

### Two-week build order

1. Days 1–3: repo, SQLite worker, schema, seed from `homeData`
2. Days 4–6: home map and space view with zoom and breadcrumb
3. Days 7–8: quick add with timer, item detail and move
4. Days 9–10: search with path highlight (FTS5)
5. Days 11–12: export/import, PWA, deploy to S3 + CloudFront
6. Days 13–14: map two rooms for real; Priya's 5-item test; Gate 0 review

**Done means Gate 0:** two rooms mapped, median under 10 s per item from the timer log, and Priya finds 5 of 5 test items on her phone.

## Architecture

The app reads and writes only its local SQLite database, so search is instant and works offline. AWS is added in Phase 2 for sync, photos, reminders and AI, all pay-per-use.

&#91;embedded content: GharMap architecture · phone + AWS serverless\]

- **Infrastructure as code:** SST or AWS CDK in TypeScript, so the whole stack is one repo and one deploy command.
- **Search:** on-device FTS5 first; pgvector semantic search ("something to fix a leaking tap") arrives with GharAI.
- **Photos:** resized on the phone before upload, then stored in S3 by presigned URL. Lambda never handles image bytes.
- **No graph DB, no separate image DB:** the tree lives in Postgres and SQLite; images are S3 objects.

## Data model

One self-referencing `space` table models the whole home, so rooms, almirahs, shelves and boxes nest to any depth. The same schema runs in on-device SQLite and in Postgres; sync just copies rows.

| Table | Key columns | Notes |
| --- | --- | --- |
| household | id, name, created\_by | The family; owns homes and members |
| member | household\_id, user\_id, role (owner / admin / member) | Roles from the vision's permission matrix |
| home | id, household\_id, name, address, type | Gurgaon flat, Dhanaura house, farmhouse |
| space | id, home\_id, parent\_id, kind (room / unit / compartment / box), name, path, sort, color | `path` = materialised path, e.g. `kitchen.fridge.mid_shelf`, for one-query lookups |
| item | id, space\_id, name, category, kind (durable / consumable / gold / document), qty, unit, notes, attrs (JSON) | `attrs` holds kind-specific fields: gold weight, purity, hallmark; document number, expiry |
| attachment | id, item\_id, s3\_key, mime, thumb\_key | Photos, receipts, scans; the file lives in S3 |
| reminder | id, item\_id, due\_on, repeat, status | Insurance, PUC, passport, AMC, warranty |
| item\_event | id, item\_id, type (added / moved / updated / used), from\_space, to\_space, by, at | Powers history and "last moved" |
| embedding | item\_id, vector | pgvector, cloud only; for semantic and image search |

Design rules:

- Client-generated UUIDs on every row, so items can be created offline without clashes.
- Soft deletes (`deleted_at`) on every table, so sync can propagate deletions.
- Every row carries `household_id`; sync rules and Postgres row-level security both filter on it.
- Search v1 = SQLite FTS5 on device over item name, category and notes, returning `path` for the highlight. No server needed.

## Cost estimate

Running cost stays near zero until real users arrive. The database is the biggest fixed cost, and it can scale to zero while idle. These are estimates; confirm each with the AWS Pricing Calculator for the Mumbai region (ap-south-1).

| Phase | Main costs | Approx. monthly (USD) |
| --- | --- | --- |
| 0–1: personal MVP | Nothing in the cloud; Google Play developer fee, one-time | \~$0 |
| 2: family sync | Aurora Serverless v2 with auto-pause, Lambda, S3, PowerSync free tier | \~$5–15 |
| 3: AI features | Above + pay-per-call vision/LLM (Bedrock) for scan and GharAI | \~$15–40, depends on usage |
| 4: public beta (\~50 families) | Aurora kept warm at 0.5 ACU minimum (\~$44), PowerSync Pro if free limits are hit ($49), AI calls | \~$60–130 |

Why these numbers:

- Aurora Serverless v2 has scaled to 0 ACUs with auto-pause since Nov 2024; while paused you pay storage only ([AWS](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-aurora-serverless-v2-scaling-zero-capacity)). The first request after a pause waits for a resume, so keep a 0.5 ACU floor in production. That floor is about $44/month at $0.12/ACU-hour ([usage.ai](https://www.usage.ai/blogs/aws/rds/aurora-serverless-v2/)).
- Sources disagree on the ACU rate (one quotes \~$0.29/ACU-hour for 2026), so check the console before budgeting.
- Skipping Neptune saves at least \~$80/month from day one.
- Cheaper fallback if AWS bills grow: Neon serverless Postgres also scales to zero ([Neon](https://neon.com/faqs/databases-automatically-scale-serverless-environments)), at the cost of leaving AWS for the database.

Guardrail: set an AWS Budget alert at $20 and $50 per month from the first deploy.

## Risks and mitigations

The biggest risks are people risks (time, data entry, scope), not technology.

| Risk | Impact | Mitigation |
| --- | --- | --- |
| 20+ hrs/week is not sustained alongside a full-time job and the job hunt | Phases slip; project stalls | Plan the calendar at 15 hrs/week; treat extra hours as buffer. Each phase ends in something usable, so a pause loses nothing. |
| Data entry fatigue | The app is abandoned after one room | 10-second add flow, voice input, photo-first items, "add to the shelf I'm looking at". Measure time per item in Phase 0. |
| Scope creep from the 20-screen vision | MVP never ships | Hard gates per phase; new ideas go to a parking list. |
| Sync bugs lose family data | Trust is gone permanently | Use PowerSync instead of custom sync; soft deletes; daily encrypted export; test conflicts deliberately. |
| Privacy promise breaks | Reputational and legal | Make the promise match the architecture; minimal data; review India's DPDP Act obligations before the public beta. |
| Storing ID document images (Aadhaar, passport) | High-value target if leaked | Keep document scans device-only by default; sync only metadata and expiry dates unless the user opts in. |
| Gold value shown wrong | Users make bad decisions | Label as indicative; show the rate source and time; exclude making charges. |
| Cloud AI sends home data off-device | Conflicts with the privacy pitch | Explicit opt-in for GharAI and scan; send minimum context; show what is sent. |
| Solo bus factor | No one else can fix it | Infrastructure as code, ADRs, simple stack. These double as portfolio material. |

## Next two weeks

The first two weeks test the riskiest assumption (will we keep entering items?) before any backend exists.

- [x] Confirm the five decisions (done 28 Oct; Phase 0 is web-only)
- [ ] List the 10 things the family searches for most (passport, chargers, medicines…)
- [ ] Set up the repo: Vite + React + TypeScript, monorepo with `packages/core` and `apps/web`
- [ ] Port the prototype's `homeData` into the `space` / `item` schema in browser SQLite (OPFS)
- [ ] Build the nested-rectangle map with tap-to-zoom on the real schema
- [ ] Build quick add with the per-item timer, then search with path highlight
- [ ] Deploy to S3 + CloudFront and install it on Priya's phone
- [ ] Map the kitchen and master bedroom in the app; check the median seconds per item
- [ ] Ask Priya to find 5 things using only the app; note what failed
- [ ] Write ADR-001 (local-first + opt-in sync), ADR-002 (Postgres tree, no graph DB), ADR-003 (web-first Phase 0)
- [ ] Phase 0 review: go/no-go on Phase 1

## Sources

- [GharMap\_Vision\_v10.pdf](https://drive.google.com/file/d/160_O5gCIht3z0tr1nyzHge1EZJJS0Yf6/view?usp=drivesdk) and [GharMap.pdf prototype](https://drive.google.com/file/d/1UmsVXNOus8AlGNIQ50-W097r0vW-Y1Yz/view?usp=drivesdk) — Google Drive
- [Aurora Serverless v2 scales to zero](https://aws.amazon.com/about-aws/whats-new/2024/11/amazon-aurora-serverless-v2-scaling-zero-capacity) — AWS, Nov 2024
- [Aurora Serverless v2 pricing guide](https://www.usage.ai/blogs/aws/rds/aurora-serverless-v2/) — usage.ai
- [Amazon Aurora pricing](https://www.factualminds.com/blog/amazon-aurora-pricing-io-optimized-serverless-v2-global/) — factualminds (higher ACU rate)
- [Neptune pricing guide](https://wring.co/blog/aws-neptune-pricing-guide) — wring
- [Neptune Serverless NCU pricing](https://www.usage.ai/blogs/aws/database-savings-plans/neptune/serverless-ncu-pricing/) — usage.ai
- [PowerSync SDKs](https://apis.io/providers/powersync/) — apis.io
- [PowerSync plans](https://toolradar.com/compare/powersync-vs-supabase-realtime) — toolradar, Oct 2026
- [Neon scale to zero](https://neon.com/faqs/databases-automatically-scale-serverless-environments) — Neon
- Gold rates: [goldmeter](https://goldmeter.in/ta/), [psuconnect](https://www.psuconnect.in/articles/gold-rate-today-5-sept-24k-22k-prices-update-check-city-wise-list)
