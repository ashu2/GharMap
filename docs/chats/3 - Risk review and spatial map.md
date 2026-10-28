# Risk review and spatial map

- Conversation: https://claude.ai/chat/9cbf70d5-bbb3-4de3-9adf-7721ff43f523
- Created 2026-10-28T00:28:54Z · Updated 2026-10-28T00:36:09Z

---

## User — 2026-10-28T00:28:54Z

lets talk on risks 1-1

---

## Claude — 2026-10-28T00:29:17Z

> 🔧 conversation_search, memory_read, recent_chats; read the GharMap Build Plan doc (https://claude.ai/artifact/PNinSd6Qva44zsfKaeMNk7)

Let's take the nine risks in the GharMap build plan one at a time. Here's the first.

**Risk 1: 20+ hours a week won't hold**

I think this is the risk most likely to kill the project. It comes from the calendar, not the technology.

- **November is crowded.** Phase 0 runs 2–15 Nov, which is the same month you planned to start practice job applications and interviews. Interview prep takes evening hours in bursts that are hard to predict, and that is the time GharMap needs.
- **The plan has a contradiction.** The constraints say "20+ hrs/week", but the roadmap is paced at 15. The plan should say one number. I'd use 15, because that's what the dates are built on.
- **Phase 0 is tight even at 15.** Two weeks gives about 30 hours for a SQLite WASM worker, the map, quick add, search, PWA setup and an S3 deploy. With AI coding help that's doable, but only if the WASM setup doesn't drag. That's why the two-day fallback to Dexie matters.

I'd add three things to the mitigation:

1. **Fixed slots, not leftover time.** For example, 2 hours on three weekday mornings plus a 6–8 hour weekend block. Hours that are only "whenever I'm free" get used up by interviews first.
2. **A minimum week.** If a week goes badly, do 3 hours of one small, finished task instead of none. A stalled side project usually dies from a few zero-hour weeks in a row, not from slow progress.
3. **A rule for when they clash.** If an interview loop lands in Phase 0, push Phase 0's end date by a week rather than cutting Gate 0's checks. The gates protect the whole plan.

One question before we move on: which slots in your week can you actually protect in November? Once you tell me, I'll check the Phase 0 dates against them. Then we'll go to Risk 2, data entry fatigue.

---

## User — 2026-10-28T00:30:24Z

no committment, I will do as I want. drop this risk

---

## Claude — 2026-10-28T00:30:36Z

Fine, dropped. One honest note: with no time commitment, the dates in the roadmap (Phase 0 by 15 Nov, and so on) are targets rather than a plan. The gates still work, since each one checks a result, not a date.

**Proposed edits to the doc.** I'll make these only after you approve:

1. Delete the row "20+ hrs/week is not sustained alongside a full-time job and the job hunt" from the Risks table.
2. In the Summary, change "solo build with AI coding help, 20+ hours a week" to "solo build with AI coding help, no fixed weekly hours".

Approve these, or should I leave the doc as is?

**Risk 2: Data entry fatigue**

This is the risk I'd rank highest now. GharMap is only useful once most of the house is entered, but entering things is the boring part. The vision deck shows 247 items. At 10 seconds each, that's about 40 minutes of pure typing, and in real life it takes much longer because you're opening almirahs and deciding what to call things. Most home-inventory apps die here, after the first room.

The plan's mitigation (a 10-second add, voice, photo-first, timing it in Phase 0) is right but incomplete. I'd add:

- **Don't map everything.** Enter only what you actually lose: documents, chargers, medicines, tools, gold, seasonal items. Your list of the 10 most-searched things is the real starting point. A map with 30 well-placed items is more useful than one with 247 half-entered ones.
- **Add containers, not contents.** "Blue box: winter accessories" is one entry. The search can match words in the notes, so you don't need ten separate items.
- **Enter things when they come up.** When someone searches and finds nothing, the app should offer "add it here once you find it". The map then grows from real searches instead of a cataloguing weekend.
- **Gate 0 should measure return use, not just speed.** Under 10 seconds per item proves the form is fast. It doesn't prove anyone comes back on day 10. I'd add "used to find something at least 3 times in week 2" to Gate 0.

Do you agree with starting from the lost-things list rather than a full house map? And is adding return use to Gate 0 worth it?

---

## User — 2026-10-28T00:31:39Z

fisrt is high level, its a level game. start with home, room etc. We will not say user to enter all of it ever.

---

## Claude — 2026-10-28T00:31:50Z

Right. The structure is visible from the start — the full home hierarchy — but users fill it in piece by piece, never forced to complete it.

**Risk 2 reframed: Data entry fatigue + abandonment**

The risk is not "too much to enter at once". It's "user adds a few items, the spatial map is still mostly empty, and they lose interest because there's no payoff until the house is mapped."

**Mitigations:**

- **Start small, specific.** The first entry could be "Master Bedroom → Wooden Almirah → Top Shelf → Medications" — one path, one item. The map zooms to show just that depth. It's not a blank canvas; it's something real and useful immediately.
- **Search works on partial data.** If you've entered 20 items across five rooms, search finds them. The map doesn't need to be complete for the core feature (finding things) to work.
- **Visual feedback on entered spaces.** Rooms with items show a count or a small badge. Empty rooms are visually lighter. This makes progress visible without pressure.
- **Gate 0:** Find things 3 times in week 2, median under 10s per item. That measure catches both speed (form is good) and repeated use (they came back).

Does that match what you're building?

---

## User — 2026-10-28T00:32:47Z

seeing empty spatial map is a motivation and not fatigue. Consider it as a game or task

---

## Claude — 2026-10-28T00:32:55Z

Got it. The empty map is the game board. Users see it and want to fill it in. Not a chore—the motivation itself.

**Risk 2 dropped.**

---

**Risk 3: Scope creep from the vision**

The vision deck has ~20 screens and features. The MVP has one: the spatial map and search. The risk is real because you have a 10-feature list sitting in that PDF, and it's easy to add "just the document vault" or "just the gold tracker" in Phase 1.

**Mitigation in the plan:** Hard gates per phase; new ideas go to a parking list.

That's correct, but I'd sharpen it:

- **Phase gates are not flexible.** Gate 0 says "find 5 items on the device app in under 10s each". Phase 1 doesn't start until that's proven. Feature requests land on a parking list, not in the current sprint.
- **The parking list is public.** Write it into the doc so Priya sees what's planned and can't sneak in "but what about this?" mid-phase.
- **A hard rule: no new tables in Phase 1.** Phase 0 has `space`, `item`, `attachment`. Phase 1 adds `reminder`, `member`, `household`. Phase 2 adds `embedding` (for AI). That's it for year one. No gold tables, no documents, no pantry. They're on the list for year two.

Does that level of gating work for you, or is it too rigid?

---

## User — 2026-10-28T00:33:40Z

but or UX must support this

Got it. The empty map is the game board. Users see it and want to fill it in. Not a chore—the motivation itself.
Risk 2 dropped.

risk 3
we will see this later

---

## Claude — 2026-10-28T00:33:50Z

Understood. The UX needs to support the architecture from day one—the spatial structure, the way features extend, the visual language for future additions.

Risk 3 deferred.

---

**Risk 4: Sync bugs lose family data**

This is the trust killer. Phase 2 adds a sync engine (PowerSync) to replicate SQLite on the phone to Postgres on AWS. If a sync bug loses an entry or corrupts the tree, the family abandons the app and you lose the year.

**Mitigation in the plan:**
- Use PowerSync instead of custom sync
- Soft deletes; daily encrypted export; test conflicts deliberately

That's the core. I'd add:

- **Assume sync will break.** In Phase 2, run deliberate conflict tests: two phones edit the same item offline, then sync. Device A deletes a space while B adds an item to it. The sync engine should handle these, but verify it actually does before the family beta.
- **Encrypted local backup is non-negotiable.** Every device exports its SQLite to encrypted JSON once a day, saved locally. If Postgres is corrupted, you restore from the backup and resync. Users never know it happened.
- **Gradual rollout to family.** Phase 2 is you + Priya only. Phase 3 is you + Priya + one parent. After a month of clean sync, invite the rest. If it breaks, it's a small fire.
- **A clear recovery path visible in the app.** "Sync status: last sync 2 hours ago. Export a backup." Users who trust the process are less likely to panic if something looks wrong.

Sound right?

---

## User — 2026-10-28T00:34:28Z

yes add this in our project plan,

---

## Claude — 2026-10-28T00:35:17Z

> 🔧 Several Claude Docs update/batch attempts on the Build Plan doc (rejected by the Docs API format checks)

I'll add the expanded Risk 4 mitigations directly to the doc. Give me a moment.

Docs API is being strict with formats. Let me save this to project memory instead, and you can paste the expanded Risk 4 into the doc when you're ready.

> 🔧 **memory_write** `/projects/01a17dd4-6341-7320-866f-974c196009e4/areas/gharmap-risks-1-1.md`

Done. Risk 4 expanded mitigations are saved in project memory.

**Copy this into the GharMap doc when you're ready** (replace the Sync bugs row in the Risks table):

> Use PowerSync instead of custom sync; soft deletes; daily encrypted export; test conflicts deliberately.
>
> **Expanded (28 Oct):**
> - Assume sync will break. In Phase 2, run deliberate conflict tests: two phones edit the same item offline, then sync. Device A deletes a space while B adds an item to it. Verify the sync engine handles these before family beta.
> - Encrypted local backup is non-negotiable. Every device exports SQLite to encrypted JSON once daily, saved locally. If Postgres corrupts, restore from backup and resync. Users never know it happened.
> - Gradual rollout. Phase 2: you + Priya only. Phase 3: you + Priya + one parent. After a month of clean sync, invite the rest. If it breaks, it's a small fire.
> - Clear recovery path in the app. "Sync status: last sync 2 hrs ago. Export backup." Users who trust the process panic less.

---

**Risk 5: Privacy promise breaks**

Next one?

---

## User — 2026-10-28T00:35:59Z

retry- we will not use paid sync tool unless we earn, this would be phased

---

## Claude — 2026-10-28T00:36:09Z

Got it. Sync is phased by revenue, not by phase number.

**Risk 4 revised:**

- Phase 2–3: PowerSync free tier only. No paid upgrade.
- If free tier limits are hit before the app earns, fall back to encrypted local backups and manual sync as needed.
- Phase 4+: Upgrade to PowerSync Pro or self-host the open edition only if the app is generating revenue to cover it.

This changes the mitigation:

- **Encrypted local backup becomes the safety net,** not just insurance. If you hit free tier limits, users can export, and you sync manually or find another approach.
- **Design Phase 2–3 to stay well within free limits.** PowerSync free tier is usually enough for a few users with modest sync. Verify their current limits before Phase 2 starts.
- **Monitor free tier usage from day one.** If you're approaching limits, you have time to decide: earn fast, self-host, or redesign the sync to use less.

Sound right? Should I update Risk 4 in memory?
