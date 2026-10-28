# Ghar map project plan

- Conversation: https://claude.ai/chat/72c29cd7-678c-4e6a-84cb-42578c6d9b88
- Created 2026-10-27T14:47:27Z · Updated 2026-10-28T00:38:34Z

---

## User — 2026-10-27T14:47:28Z

search google drive and find about ghar map project

---

## Claude — 2026-10-27T14:47:49Z

I'll search your Google Drive for the Ghar Map project.

> 🔧 Google Drive search ("ghar map" / "gharmap"), then listed the GharMap folder and read GharMap_Vision_v10.pdf

I found a **GharMap** folder in your Drive (created 4 Aug 2026) with two files:

**1. GharMap_Vision_v10.pdf** (14 Jun 2026): a 20-screen product vision deck, imagined as the app in 2035. The tagline is "Your Home. In Your Pocket." It's a home inventory app that shows your home as a spatial map you can drill into: Home → Room → Storage unit → Compartment → Item. The main feature areas are:

- **Core experience:** a dashboard; a spatial home map as the flagship view (rooms drawn as nested rectangles); room view; and item detail cards with value, purchase info and move history.
- **Gold Vault:** each gold piece with weight, purity, hallmark, insurance and location, plus valuation at the live gold rate and gain over purchase price.
- **Pantry:** fast-moving items like groceries and medicines with +/- stock counts, and a shopping list built automatically from low-stock items that you can share on WhatsApp.
- **Smart features:** search that highlights the exact path on the map ("passport → Wooden Almirah → Right Side"), bulk camera scan of a shelf, and "GharAI", which answers natural-language questions from your actual inventory.
- **Documents:** a vault for property, vehicle, ID, electronics and financial papers, with an expiry tracker for insurance, PUC, passports and AMCs.
- **Family & homes:** multiple properties (Gurgaon flat, Dhanaura house, Manesar farmhouse) and family sharing with Owner/Admin/Member roles.
- **Analytics & alerts:** total asset value, value by category, and proactive reminders.
- **Privacy architecture:** local-first. Data lives in SQLite on your phone with AES-256 encryption, and backups go to the user's own Google Drive or iCloud. The servers hold zero user data, no account is needed, and sharing happens through an encrypted file.

The headline stats on the cover (2.4M families, 4.9★ rating) are aspirational figures for the 2035 vision, not real metrics.

**2. GharMap.pdf** (29 May 2026): an earlier React prototype exported to PDF. It's a `homeData` structure for the Gurgaon flat (Kitchen, Drawing Room, Master Bedroom, Kids Room, and so on) with units, compartments and items, using `useState`/`useMemo`. This looks like the first working mockup of the spatial map view.

I didn't find any other GharMap docs in Drive, such as a PRD, tech design or roadmap. I can draft an MVP scope or a technical architecture from the vision deck if you want to take it further.

Sources:
- [GharMap_Vision_v10.pdf](https://drive.google.com/file/d/160_O5gCIht3z0tr1nyzHge1EZJJS0Yf6/view)
- [GharMap.pdf](https://drive.google.com/file/d/1UmsVXNOus8AlGNIQ50-W097r0vW-Y1Yz/view)
- [GharMap folder](https://drive.google.com/drive/folders/1eTzj2dwjL2OY4pB6PMZ4LLRBPfDfNwjf)

---

## User — 2026-10-27T14:48:33Z

lets plan this, its my dream project

---

## Claude — 2026-10-27T14:51:11Z

Let's turn GharMap into a real plan. A few answers first will shape the scope, timeline and stack.

> ❓ **Questions asked — your answers:**
> - What's the ambition for GharMap, at least for the first version? → **Launch as a product**
> - How much time can you realistically put in each week alongside your job? → **20+ hrs/week**
> - Which platform should version 1 target? → **web then ios, no android**
> - Who builds it? → **Me, with AI coding tools**

---

## Claude — 2026-10-28T00:25:19Z

Let's plan it properly. A few things from the vision deck will shape the plan, so it's worth naming them now:

- **The scope is about 10 products in one.** Inventory, gold valuation, pantry, document vault, renewal tracking, AI assistant, multi-home and family sharing could each be a separate app. The plan has to find the smallest version that is still useful on its own.
- **Some of the privacy promises conflict with other features.** "Zero data on our servers" fits a single-user app. But live family sync (Priya adds apples, you see them) and GharAI usually need a server or a cloud LLM. Sharing an encrypted file over WhatsApp works, but it isn't live sync. These are architecture decisions to settle early, not later.
- **The real risk is data entry, not technology.** Mapping 247 items room by room is tedious, so whether people keep using the app depends on how fast items can be added (bulk scan, voice) and how often they need to search.

A few quick questions so the plan fits your situation:

> ❓ **Questions asked — your answers:**
> - What do you want GharMap to become, at least for the next 12 months? → **1,2,3**
> - How much time can you realistically give it each week? → **4**
> - Who builds it? → **1**
> - Which platform and stack are you leaning towards? → **cheap hosting, scalanable, preference node and react, postgres db, any image db, any grapbh db, serverless as much as possible, aws cloud**

> 🔧 Web searches: Aurora Serverless v2 scale-to-zero pricing · Amazon Neptune serverless minimum cost · PowerSync Postgres React Native pricing · India live gold rate API
>
> 🔧 Created the Claude Doc **GharMap — Build Plan** and filled it section by section: summary, honest review of the vision, key decisions, data model, cost estimate, risks, first two weeks, sources, roadmap diagram, architecture diagram.

[GharMap — Build Plan](https://claude.ai/artifact/PNinSd6Qva44zsfKaeMNk7) is ready. It covers a 12-month roadmap with gates between phases, an architecture on AWS serverless, the data model, costs, risks and a checklist for the first two weeks.

Two places where I disagreed with your stack, so you can push back:

- **No graph database.** Your home data is a tree, and Postgres handles trees well. Amazon Neptune would cost about $80/month even when idle.
- **The "zero data on our servers" promise needs changing.** It can't hold once family sync goes through Postgres on AWS. The plan proposes local-first storage with cloud sync that the family opts into.

I also planned the calendar at 15 hrs/week rather than 20+. That leaves room for your job and the job hunt.

Edit it directly or leave comments, and I'll revise.

---

## User — 2026-10-28T00:27:22Z

would like to follow verdict,

also at first first design a phase 0 - only web UI

---

## Claude — 2026-10-28T00:29:05Z

I'll lock in the recommendations and rework Phase 0 as a web-only build. First I'll check whether you've edited the doc since my last write.

> 🔧 Web search: official SQLite WASM OPFS FTS5 build · read the doc

No edits from you since the last version, so I'll update the doc in place. Starting with the decisions, marking them confirmed.

Now the new Phase 0 design section, under the roadmap.

Now the checklist and the two diagrams.

> 🔧 Updated decisions, added Phase 0 design section, updated checklist, roadmap and architecture diagrams

I've updated the plan. All five decisions are marked confirmed, and Phase 0 is now a browser-only web app.

The new **Phase 0 design** section covers:
- **Scope:** the map, quick add with a per-item timer, search with path highlight, item detail, and JSON backup. It's installable on a phone, so Priya can test it there.
- **Screens:** six of them.
- **Tech:** React + Vite + TypeScript, with SQLite running in the browser.
- **Code layout:** the core logic sits in its own package, so the Phase 1 Expo app reuses it instead of starting over.
- **Build order:** a day-by-day plan for the two weeks.

I also updated the roadmap diagram, the architecture subtitle and the next-two-weeks checklist to match.

One trade-off: browser SQLite is the most finicky part to set up. I've added a fallback in the doc: if it takes more than two days, switch to IndexedDB storage and port the schema in Phase 1.

Next, I can draw mockups of the six screens for you to react to, or start building the Phase 0 web app itself. Which do you want?

---

## User — 2026-10-28T00:29:46Z

lets only consider UI as of now, do mock up- when you say mock i should be ssing in briwser

---

## Claude — 2026-10-28T00:29:55Z

I'll build clickable mockups of the six Phase 0 screens that open in your browser, starting from the Design canvas.

> 🔧 Created the Design artifact **GharMap Phase 0 — Web UI** (https://claude.ai/artifact/WZatHqQGFL5ZdqWevfiHGM) and wrote `project/canvas.json` + `project/Main.dc.html` (57,872 chars — saved in ../files/design-phase0-web-ui/)

Canvas is set up. I'll build it as one clickable phone-sized web app: all six screens, working search with the map highlight, and a timed quick add.

The Phase 0 mockup is a clickable phone-sized web app that opens in your browser. It covers all six screens and uses the room and item data from your React prototype.

Things to try:
- **Find something:** tap the search bar and try "passport". Tapping the result lights up the exact shelf on the home map in amber.
- **Zoom in:** tap any room or cupboard, then go deeper until you reach the shelf and its items.
- **Add an item:** tap **Add**. A timer starts and counts the seconds, which is the Gate 0 measure. Press Enter to save and start the next item; "Change" picks a different place.
- **Change an item:** open one to edit its quantity or notes, or move it. Each change is recorded in the item's history.
- **Check entry speed:** **Settings** shows the median seconds per item with a 10-second target line, and new items you add appear in it.

A few things to know:
- It's laid out for a phone screen, because that's where the family will use it. I can add a desktop layout next.
- Export and Import show a confirmation message only. The rest really works, but changes are lost when the page reloads.
- The link is private. Priya can't open it until you share it from the page's Share menu.

Tell me what to change, or point at a screen and I'll revise it.
