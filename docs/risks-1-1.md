---
name: gharmap-risks-1-1
description: Risk discussion on GharMap (28 Oct 2026 1-1): Risk 1–3 resolved, Risk 4 expanded, 5–9 to discuss.
sources: [chat]
aliases: [gharmap-risks]
---

<!-- Pulled from the GharMap project's memory: /projects/01a17dd4-6341-7320-866f-974c196009e4/areas/gharmap-risks-1-1.md -->

## Decisions

- [stated] Risk 1 (20+ hrs/week unsustainable): DROPPED. No fixed weekly hours; roadmap is target not plan.
- [stated] Risk 2 (data entry fatigue): DROPPED. Empty spatial map is the game and motivation, not a chore.
- [stated] Risk 3 (scope creep): DEFERRED. Will discuss when UX is further along.

## Risk 4: Sync bugs lose family data — EXPANDED

**Core mitigation (unchanged):** Use PowerSync instead of custom sync; soft deletes; daily encrypted export; test conflicts deliberately.

**Expanded (28 Oct):**
- **Assume sync will break.** In Phase 2, run deliberate conflict tests: two phones edit the same item offline, then sync. Device A deletes a space while B adds an item to it. Verify the sync engine handles these before family beta.
- **Encrypted local backup is non-negotiable.** Every device exports SQLite to encrypted JSON once daily, saved locally. If Postgres corrupts, restore from backup and resync. Users never know it happened.
- **Gradual rollout.** Phase 2: you + Priya only. Phase 3: you + Priya + one parent. After a month of clean sync, invite the rest. If it breaks, it's a small fire.
- **Clear recovery path in the app.** "Sync status: last sync 2 hrs ago. Export backup." Users who trust the process panic less if something looks off.

## Risks 5–9

To discuss:
- Privacy promise breaks (reputational, legal)
- Storing ID document images (Aadhaar, passport) — high-value target
- Gold value shown wrong (users make bad decisions)
- Cloud AI sends home data off-device (conflicts with privacy pitch)
- Solo bus factor (no one else can fix it)
