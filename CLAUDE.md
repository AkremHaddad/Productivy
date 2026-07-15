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

### Activity/time-worked logic (top priority)
`activityCron.js` increments each online user's time-worked bucket by a flat 1 minute per cron tick, rather than measuring actual elapsed time. This causes:
- No correction for missed/delayed cron ticks or server restarts (time silently lost, not reconciled)
- Day-bucketing uses server local time (`now.getFullYear()/getMonth()/getDate()`) instead of an explicit timezone — risk of activity logging to the wrong day if server timezone differs from the user's
- Correctness depends entirely on the client-side `isOnline`/`lastSeen` heartbeat being robust (e.g. handling tab-close/disconnect cleanly)

Planned fix: switch to elapsed-time accounting (compute real ms since last heartbeat, cap it to handle gaps) and use UTC or an explicit stored user timezone for day boundaries, instead of the current flat-increment/server-local-time approach.

### Other known bugs (per Akram, 2026-07-14)
- **Pomodoro timer's ring/alert doesn't play well, or at all** — needs investigation (likely a browser autoplay-restriction or audio-trigger timing issue).
- **A heartbeat/activity bug Akram believes he already fixed** — verify it's actually resolved before doing further work on the activity-tracking logic above; don't assume.
- General "not the best" design overall. **Dark theme is good; light theme needs work.** Elevate to match Akram's high-end UI/UX positioning (see `PROFILE.md` in `my profile`).
- Responsiveness — explicitly lower priority; the app is designed web-first, not mobile-first.

### Architecture option raised for time-tracking: local companion script
Akram floated an alternative/complementary approach to the current browser-tab heartbeat: a small script running locally on the user's machine that pings the server on app open and every ~20 minutes with time-worked data. This would be more resilient than relying on a browser tab staying open/focused, at the cost of requiring the user to install/run something locally. Not decided — worth weighing against simply hardening the existing web heartbeat (e.g. Page Visibility API, a service worker, flushing on `beforeunload`) before committing to a separate local-script architecture.

No implementation started yet as of 2026-07-14. Currently dormant — Akram isn't actively using it since starting at Nouvelair.

## Progress Tracking & GitHub Hygiene (standing rules, set 2026-07-14)

- **Write/maintain a real README.md** — `client/README.md` is currently just Vite boilerplate.
- **Keep `C:\Projects\my profile\Project Summaries\Productivy.md` (+ generated `.pdf`) up to date** as real implementation work happens — the polished, portfolio-ready summary. Foreground architecture/technique decisions (the heartbeat/presence-tracking redesign is a good one to document) over a plain feature list — see `Project Summaries/_TEMPLATE.md` and `README.md` there. Separate from this CLAUDE.md and the Second brain vault note at `Second brain/04 Personal Projects/Productivy.md`.
- **Commit and push after each completed task/subtask**, not in one batch — Akram wants an active GitHub history. Standing authorization covers push to the existing remote; it does NOT cover creating a new remote repo or force-pushing.
- Explain non-obvious architecture/technique decisions as they're made — Akram is using this work to learn architecture/patterns, not just to get working code.
