# Student Utility Hub — Expansion Plan (Overnight Autonomous Build)

> **For agentic workers:** This plan is executed by the `orchestrate.sh` script.
> Each milestone is one independent `opencode run` session. Read the milestone
> section fully, read `DESIGN.md` and `AGENTS.md` before coding, and **commit
> your work** before replying. Reply `DONE` only after `npm run build` passes.

**Goal:** Turn the existing 5-tool calculator site into a 9-tool student
utility suite by adding 4 new local-first tools, shared utilities, and a
quality/QA gate — all statically built with Astro, styled per `DESIGN.md`.

**Architecture:** Pure static Astro site. Every new tool is a self-contained
`.astro` page under `src/pages/` using vanilla JS `<script>` islands, Tailwind
v4 styling, and `localStorage` for persistence (same pattern as the existing
calculators). No backend, no new npm dependencies.

**Tech Stack:** Astro 6, Tailwind CSS v4, TypeScript, vanilla JS islands,
localStorage. Tests: plain Node scripts in `tests/` (no test framework —
match the existing ad-hoc style, but organized).

## Global Constraints

- Follow `DESIGN.md` for all colors, typography, spacing, and component feel
  (Vercel-style: `#171717` ink, `#fafafa` soft canvas, Geist/Inter fonts).
- No new npm packages. Use what's installed (astro, tailwindcss, @emailjs/browser).
- All user data local-first: `localStorage` only, never a backend.
- Every page: semantic HTML, `aria-` labels on interactive elements, mobile
  responsive (375px width must not overflow — `overflow-x: hidden` is banned).
- New pages get: an entry card on `src/pages/index.astro`, a link in
  `src/components/Header.astro` nav, and `title`/`description` meta + JSON-LD
  matching the existing pages' pattern.
- Every milestone: after coding, run `npm run build`, fix all errors, then
  commit with a descriptive message (`feat: ...`).
- Add pure-logic tests to `tests/` (plain Node, run with `node tests/<file>.cjs`)
  whenever a milestone introduces computable logic.
- localStorage keys must be namespaced: `suh-<feature>-v1`.

---

### M1: Shared utilities library

**Files:**
- Create: `src/lib/storage.ts` — typed localStorage helpers
- Create: `src/lib/format.ts` — number/percentage formatting helpers
- Create: `tests/test-storage.cjs`, `tests/test-format.cjs` — plain Node tests

**Interfaces:**
- `storageLoad<T>(key: string, fallback: T): T` — JSON.parse with try/catch
- `storageSave(key: string, value: unknown): void`
- `formatPercent(value: number, decimals = 1): string` — e.g. `75.0%`
- `formatDays(n: number): string` — e.g. `12 days`, `1 day`, `today`
- Consumed by: M2 (countdown), M3 (study timer), M4 (semester tracker), M5 (marks ledger)

- [ ] **Step 1:** Create `src/lib/storage.ts` and `src/lib/format.ts` with the
      exact interfaces above, exported as named exports.
- [ ] **Step 2:** Create `tests/test-storage.cjs` and `tests/test-format.cjs`
      using `require` (plain Node, no imports), asserting: storageLoad returns
      fallback on missing/corrupt JSON; formatPercent rounds to 1 decimal;
      formatDays handles 0, 1, 2, and >99 correctly. `console.log` PASS/FAIL
      per assertion and `process.exit(1)` on failure.
- [ ] **Step 3:** Run `node tests/test-storage.cjs && node tests/test-format.cjs` — all PASS.
- [ ] **Step 4:** Run `npm run build` — no errors.
- [ ] **Step 5:** Commit: `git add -A && git commit -m "feat: shared storage and format utilities"`.

---

### M2: Exam Countdown page

**Files:**
- Create: `src/pages/exam-countdown.astro`
- Modify: `src/pages/index.astro` (card), `src/components/Header.astro` (nav link)

**Interfaces:**
- Uses `storageLoad`/`storageSave` with key `suh-exams-v1`
- Consumed by: nothing (leaf page)

- [ ] **Step 1:** Build the page: form to add an exam (name, date via
      `<input type="date">`, optional subject). List of saved exams with a live
      countdown: `formatDays()` for the gap plus absolute date. Exams due
      within 7 days get an amber/red urgency badge. Delete button per exam.
      Store array of `{ id, name, date }` under `suh-exams-v1`.
- [ ] **Step 2:** Countdown recomputes on page load and via a 60s
      `setInterval` — no framework, plain `<script>` in the page.
- [ ] **Step 3:** Empty state: friendly message + "add your first exam" hint.
- [ ] **Step 4:** Wire up: index card + header nav link (route `/exam-countdown`).
- [ ] **Step 5:** `npm run build` clean, then commit `feat: exam countdown page`.

---

### M3: Study Timer (Pomodoro) page

**Files:**
- Create: `src/pages/study-timer.astro`
- Modify: `src/pages/index.astro` (card), `src/components/Header.astro` (nav link)

**Interfaces:**
- Uses `storageLoad`/`storageSave` with key `suh-pomodoro-v1`
- Consumed by: nothing (leaf page)

- [ ] **Step 1:** Pomodoro: 25min focus / 5min short break / 15min long break
      (every 4 pomodoros). Big circular progress ring (SVG stroke-dashoffset),
      start/pause/reset buttons, session count today (persisted), tab title
      updates with remaining time (`document.title`).
- [ ] **Step 2:** When a focus session completes, play a short
      `AudioContext` beep (no external asset) and switch to break mode.
      `aria-live="polite"` status region for screen readers.
- [ ] **Step 3:** Persist: completed pomodoros per day `{ "2026-08-13": 4 }`.
      Show "Today: 4 pomodoros".
- [ ] **Step 4:** Wire up index card + header nav (route `/study-timer`).
- [ ] **Step 5:** `npm run build` clean, commit `feat: pomodoro study timer`.

---

### M4: Semester Syllabus Tracker

**Files:**
- Create: `src/pages/semester-tracker.astro`
- Modify: `src/pages/index.astro` (card), `src/components/Header.astro` (nav link)

**Interfaces:**
- Uses `storageLoad`/`storageSave` with key `suh-semester-v1`
- Consumed by: nothing (leaf page)

- [ ] **Step 1:** Local-first syllabus checklist: add subjects (name, optional
      units count). Each subject expands to unit checkboxes (1..N). Overall
      progress bar (completed units / total units) at top. Persist everything.
- [ ] **Step 2:** Progress bar uses gradient from `DESIGN.md`
      (`gradient-develop-start` → `gradient-develop-end`) and shows percentage
      via `formatPercent()`.
- [ ] **Step 3:** "Clear completed semester" button with `confirm()` dialog.
      Export button: downloads current semester data as a `.json` file via a
      Blob download (no libraries).
- [ ] **Step 4:** Wire up index card + header nav (route `/semester-tracker`).
- [ ] **Step 5:** `npm run build` clean, commit `feat: semester syllabus tracker`.

---

### M5: Marks Ledger

**Files:**
- Create: `src/pages/marks-ledger.astro`
- Modify: `src/pages/index.astro` (card), `src/components/Header.astro` (nav link)

**Interfaces:**
- Uses `storageLoad`/`storageSave` with key `suh-marks-v1`
- Consumed by: nothing (leaf page)

- [ ] **Step 1:** Record per-subject marks: subject name, internal marks
      (max 30 or 40 configurable per row via a `max` select: 10/20/30/40/50),
      external/theory marks (max 70/100 configurable). Auto-computed:
      total out of max, percentage via `formatPercent()`, and a letter grade
      (A+ ≥ 90, A ≥ 80, B+ ≥ 70, B ≥ 60, C ≥ 50, F < 50).
- [ ] **Step 2:** Summary cards: overall percentage, best subject, number of
      failures. Rows sortable by percentage desc via a "Sort by %" button.
      Edit and delete per row.
- [ ] **Step 3:** Grade colors follow DESIGN.md semantic tokens
      (success for pass, `error` for F).
- [ ] **Step 4:** Wire up index card + header nav (route `/marks-ledger`).
- [ ] **Step 5:** `npm run build` clean, commit `feat: marks ledger with grades`.

---

### M6: Homepage showcase, sitemap & SEO refresh

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `public/sitemap.xml` (if present) or create it
- Modify: `src/components/Seo.astro` if needed for new pages

- [ ] **Step 1:** Reorganize the homepage tool grid into categories
      ("Calculators", "Trackers", "Planners") with the 9 tools (5 existing +
      4 new). New tools get brief one-line descriptions.
- [ ] **Step 2:** Ensure all 9 pages are in the sitemap and every new page has
      unique `<title>` + meta description + JSON-LD (check existing pages'
      pattern in `src/components/Seo.astro` and copy it).
- [ ] **Step 3:** `npm run build` clean, commit `feat: homepage categories and sitemap refresh`.

---

### M7: QA gate — check, build, smoke tests, fixes

**Files:**
- Modify: any files with issues found below
- Test: `tests/test-marks.cjs` (pure logic: grade + percentage math)

- [ ] **Step 1:** Create `tests/test-marks.cjs` asserting the M5 grading rules
      (boundary cases: 90→A+, 79.9→B+, 49.9→F). To make this testable, extract
      the grade logic into `src/lib/grading.ts` (`gradeFor(percent: number): string`)
      and import it from the marks-ledger page script.
- [ ] **Step 2:** Run `node tests/test-marks.cjs`, `node tests/test-storage.cjs`,
      `node tests/test-format.cjs` — all PASS. Run `npx astro check` — no errors.
- [ ] **Step 3:** Run `npm run build`. Then audit: for each of the 9 pages,
      open it in a mobile viewport (375px) and verify: no horizontal scroll,
      all buttons/interactive elements work, dark mode toggle still works
      (use the browser devtools or a quick `node tests/smoke.cjs` with
      Playwright if available — otherwise manual reasoning + careful review).
- [ ] **Step 4:** Fix every console error, broken interaction, and overflow
      found. Re-run build.
- [ ] **Step 5:** Commit `fix: QA gate fixes across tools`.

---

### Final: Verification report

- [ ] After M7, confirm: `npm run build` passes, all tests pass,
      `git log --oneline` shows 8+ commits from this run.
- [ ] Write summary to `.overnight/MORNING_STATUS.md` (done by orchestrator script, not the agent).
