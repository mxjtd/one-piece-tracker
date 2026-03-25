# One Piece Tracker

A web app for tracking your progress through the One Piece anime — all 1,155 episodes across 11 sagas and 32 story arcs.

**Live:** [onepiece.poopsmith.co](https://onepiece.poopsmith.co)

---

## Features

- **Episode tracking** — mark individual episodes or entire arcs/sagas as watched
- **Filler management** — toggle 102 filler episodes on/off
- **Progress visualization** — grand progress bar, per-saga and per-arc bars
- **Watch pace calculator** — set a target date or daily pace to project your finish
- **Milestone toasts** — unlock notifications at 13 key story moments
- **Crew tracker** — Straw Hat crew members unlock as you watch their recruitment episode, with spoiler-gated bounties
- **Arc ratings** — rate completed arcs 1–5 stars (half-star support) with a personal ranking in Stats
- **Stats view** — quick facts, arc ratings leaderboard, milestones achievement list
- **Light/dark mode** — full theme switching with nautical-inspired palettes
- **Accessible** — WCAG AA compliant: keyboard navigation, screen reader support, visible focus indicators
- **Persistent storage** — all progress saves automatically via localStorage

## Development

```bash
npm install
npm run dev       # local dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build locally
```

## Stack

- React 19 + Vite
- Inline styles with token-based theme system
- localStorage for persistence
- Deployed on Netlify via GitHub integration

## Project Docs

See [PRD.md](./PRD.md) for full product requirements, roadmap, and design specs.
