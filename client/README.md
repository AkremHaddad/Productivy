# Productivy — client

React + Vite + Tailwind frontend for **Productivy**, a personal project/sprint/notes tracker with a Pomodoro timer and an online-presence-based "time worked" tracker. Trello was the design inspiration. Live at [productivy.vercel.app](https://productivy.vercel.app).

See the repo root [`CLAUDE.md`](../CLAUDE.md) for full architecture notes, known issues, and standing rules for this project.

## Stack

- **React 19** + **React Router 7**, bundled with **Vite**
- **Tailwind CSS** for styling, dark/light theme via a `dark` class on `<html>` (see `src/api/useTheme.js`)
- **Framer Motion** for animation, **Recharts**/**D3** for charts, **@hello-pangea/dnd** for the Kanban drag-and-drop
- Talks to the `server/` (Express + MongoDB) API via `axios` (`src/api/`)

## Pages

- `/` — landing page (`Home`)
- `/account` — Google OAuth login, profile
- `/projects` — project list / Kanban board overview
- `/project/:id` — a single project's board, notes, and Pomodoro timer

## Getting started

```bash
npm install
npm run dev       # start the Vite dev server
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # eslint
```

Requires the `server/` API running (or reachable) for anything beyond the static landing page — see the server's own setup in `../server`.
