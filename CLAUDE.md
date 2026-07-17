# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

**Productivy** — a MERN-stack (React+Vite+Tailwind client, Express+MongoDB server) personal project/sprint/notes tracker. Built by Akram right after his final-year internship (PFE/WeStart), partly to learn the MERN stack, partly as a real tool: track projects/sprints/notes, a Pomodoro timer, and a "time worked" tracker based on an online-presence heartbeat. Trello was a design inspiration. Auth via Google OAuth (Passport).

Live at **productivy.vercel.app** (client). Server CORS whitelists that origin.

## Architecture

- `client/` — React + Vite + Tailwind. Key components: `ProductivityDashboard.jsx`, `DayActivityGraph.jsx`, `ProductShowcase.jsx`.
- `server/` — Express + MongoDB (Mongoose). Models: `Activity`, `CurrentActivity`, `ProductiveTime`, `Project`, `User`, `WeeklySummary`, `Average`.
- `server/cron/activityCron.js` — the heartbeat job, runs every minute, walks online users and increments their activity/time-worked buckets. See "Known Issues" below — this is the area most in need of a rework.

## Known Issues & Planned Work (tracked 2026-07-14)

Full context in `C:\Projects\my profile\Second brain\04 Personal Projects\Productivy.md` — this repo is part of Akram's career-development plan tracked at `C:\Projects\my profile\`.

### Activity/time-worked logic — ✅ elapsed-time accounting fixed 2026-07-15, commit `c5938df`

`activityCron.js` used to increment each online user's time-worked bucket by a flat 1 minute per cron tick regardless of real elapsed time. Fixed: added `CurrentActivity.lastAccountedAt` and now credit `min(now - lastAccountedAt, 90s)` per tick — real elapsed time, capped so a missed/delayed cron run (server restart, cold start) can't dump a huge backlog once it resumes. First tick after coming online bootstraps and credits 0. `Activity.hours.*` and `ProductiveTime.minutes` now accumulate fractional minutes (both are plain Mongoose `Number`, floats are fine) instead of always whole numbers.

**Explicitly deferred, not fixed**: day/hour bucketing still uses server-local time (`now.getFullYear()/getMonth()/getDate()`), unchanged. This convention is used consistently in three places — `activityCron.js`, `activityController.js`'s `getTodayProductiveTime`, and `chartsController.js`'s daily/weekly day-string generation — so it's internally consistent, just potentially not matching the deployed server's actual timezone vs. the user's. Fixing this properly means touching all three together (to avoid a reads-vs-writes mismatch) and possibly adding a stored user-timezone preference — bigger scope than this pass, and not something to do solo without Akram's input on how much precision he actually wants here. Revisit as its own task.

Correctness still depends on the client-side `isOnline`/`lastSeen` heartbeat being robust (handling tab-close/disconnect cleanly) — not touched in this pass, no evidence it's currently broken.

Verification note: no test suite exists in this repo (`npm test` is a no-op placeholder). Verified via `node --check` on both changed files and a real local server boot (connects to the actual MongoDB via `.env`, no runtime errors) — not a full integration test of the cron's actual crediting behavior over time. Worth a manual sanity check (watch `ProductiveTime.minutes` over a few real minutes online) whenever this app is next actually used.

### Other known bugs (per Akram, 2026-07-14)
- ✅ **Fixed 2026-07-15, commit `1f4be0a`** — Pomodoro timer's ring/alert doesn't play well, or at all. Root cause: `alarmPlayedRef` (guards against re-triggering the 10s-left alarm within a cycle) only got reset when a cycle reached 0 naturally — `restart()` and `saveSettings()` reset the timer state but not this ref, so hitting Restart before a cycle finished naturally left the alarm permanently "already played," silently never firing again for the rest of the session. Reset the ref in both places. (There's a separate, unrelated, standard browser-autoplay-unlock pattern already in place for the `<audio>` element via `toggleStart()` — left untouched, no evidence it's broken.)
- ⚠️ **Still open, NOT verified** — a heartbeat/activity bug Akram believes he already fixed. Couldn't verify statically without more specifics on what the original bug was; needs Akram to confirm via actually using the app, not something resolvable from code review alone. Don't assume it's fixed.
- ✅ **Fixed 2026-07-17, commit `2b52dd5`** — `ProductShowcase.jsx`'s auto-rotating feature tabs were supposed to pause on hover (`isHovered` is read in the rotation interval) but `setIsHovered` was declared and never called anywhere — the `onMouseEnter`/`onMouseLeave` handlers were simply missing from the JSX. Wired them onto the `<section>` wrapper.
- **Dark theme is good; light theme needs work** — partial start 2026-07-17, commit `37de952`: found and fixed two concrete bugs via `eslint`/manual review (no visual browser check was possible that session) — `Home.jsx` had a literal stray `"}` copy-paste artifact embedded inside two `className` template strings, which silently broke the `text-text-light` Tailwind class (text just fell back to browser-default color in light mode); `Projects.jsx`'s "Create Project" modal button was `bg-white dark:bg-white text-white dark:text-black` — invisible white-on-white text in light mode. **This is a couple of bugs found, not a full light-theme pass** — still needs an actual look-through in a browser (light mode, every page) to catch contrast/spacing issues that only show up visually, not via lint or code review.
- `deleteConfirm` (`Kanban.jsx`) and `isAdding`/`newCardTitle` (`Column.jsx`) are declared-but-unused state, per `eslint`'s `no-unused-vars` — left alone 2026-07-17, they look like partially-wired delete-confirmation/add-card UI rather than pure dead code, and finishing them means guessing at intended behavior without Akram's input.
- Responsiveness — explicitly lower priority; the app is designed web-first, not mobile-first.

### Architecture option raised for time-tracking: local companion script — deferred 2026-07-15
Akram floated an alternative/complementary approach: a small script running locally on the user's machine that pings the server on app open and every ~20 minutes with time-worked data — more resilient than relying on a browser tab staying open/focused, at the cost of requiring the user to install/run something locally.

**Claude's call, made unilaterally during an unsupervised run** (reversible/local-only decision, proceeded per standing guidance rather than blocking on Akram): went with hardening the existing web-heartbeat model (the elapsed-time-accounting fix above) instead of building a separate local-script system. Reasoning: productivy is currently dormant/not actively used, so a new deployment target (a cross-platform local script users must install and run) is disproportionate scope for a bug-fix pass; the client already heartbeats every 30s via `Status.jsx`, and the actual reported bug (flat-increment drift) is fully addressed without it. If Akram still wants the local-script approach for its own sake (e.g. tracking time spent outside the browser entirely), that's a distinct feature request, not a bug fix — revisit explicitly with him rather than assuming this closes the question.

No implementation started yet as of 2026-07-14. Currently dormant — Akram isn't actively using it since starting at Nouvelair.

## Progress Tracking & GitHub Hygiene (standing rules, set 2026-07-14)

- **Write/maintain a real README.md** — ✅ `client/README.md` written 2026-07-17 (commit `2b52dd5`), was still Vite boilerplate before. `server/` still has no README.
- **Keep `C:\Projects\my profile\Project Summaries\Productivy.md` (+ generated `.pdf`) up to date** as real implementation work happens — the polished, portfolio-ready summary. Foreground architecture/technique decisions (the heartbeat/presence-tracking redesign is a good one to document) over a plain feature list — see `Project Summaries/_TEMPLATE.md` and `README.md` there. Separate from this CLAUDE.md and the Second brain vault note at `Second brain/04 Personal Projects/Productivy.md`.
- **Commit and push after each completed task/subtask**, not in one batch — Akram wants an active GitHub history. Standing authorization covers push to the existing remote; it does NOT cover creating a new remote repo or force-pushing.
- Explain non-obvious architecture/technique decisions as they're made — Akram is using this work to learn architecture/patterns, not just to get working code.
