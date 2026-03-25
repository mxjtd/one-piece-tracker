# Product Requirements Document
## One Piece Episode Tracker

**Version:** 1.2
**Last Updated:** March 2026
**Author:** JT Dumproff
**Status:** In Development
**Live URL:** https://onepiece.poopsmith.co

---

## 1. Overview

### 1.1 Product Vision
The One Piece Episode Tracker is a web-based application that helps viewers navigate and track their progress through the One Piece anime series. With over 1,155 episodes across 11 sagas and 32 story arcs, the series is one of the longest-running anime in history. This tracker provides a structured, visually engaging, and spoiler-conscious way to manage the viewing journey.

### 1.2 Problem Statement
One Piece viewers face several challenges that this product addresses:
- **Scale and complexity:** 1,155+ episodes with no clear way to track progress across dozens of story arcs and sagas.
- **Filler episodes:** 102 filler/transitional episodes that can be safely skipped but are difficult to identify without external guides.
- **Motivation:** The sheer length of the series leads to viewer fatigue. Progress visualization and milestone rewards help sustain engagement.
- **Spoiler risk:** Most episode guides contain spoilers. This tracker provides arc context without revealing plot details.

### 1.3 Target Audience
- **Primary:** First-time One Piece viewers working through the series, especially those watching without filler.
- **Secondary:** Returning viewers catching up after a break, or rewatchers tracking a new viewing session.
- **Tertiary:** Fans preparing for live-action season releases who want to align their anime progress with adapted arcs.

### 1.4 Success Metrics
| Metric | Target |
|--------|--------|
| Return visits | 60% weekly return rate |
| Completion rate | 30% of users track 100+ eps |
| Session engagement | Avg. 3+ min per session |
| Feature discovery | 50% interact with easter eggs |

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (functional components, hooks) |
| Bundler | Vite |
| Styling | Inline styles with theme object (CSS-in-JS pattern) |
| Storage | localStorage (`op-full-tracker-v3`) |
| Fonts | Google Fonts: Outfit (body), Pirata One (display) |
| Hosting | Netlify (onepiece.poopsmith.co) |
| Version Control | GitHub (github.com/mxjtd/one-piece-tracker) |

---

## 3. Feature Requirements

### 3.1 Core Features (P0) — ✅ Complete

#### 3.1.1 Episode Tracking ✅
- Individual episode toggle via clickable buttons within expanded arc views
- Bulk actions: mark entire arcs or entire sagas as watched/unwatched
- Visual differentiation between watched (saga-colored fill) and unwatched episodes
- Filler episodes visually distinct with dimmed styling and "FILLER" label
- Persistent storage saves all progress automatically with debounced writes (300ms)

#### 3.1.2 Filler Management ✅
- Global toggle: "Skip filler episodes (102 eps)"
- When enabled: filler episodes hidden from grids, excluded from progress percentages and stats
- When disabled: filler episodes visible but visually differentiated
- Toggle state persists between sessions
- **Note:** 102 filler/transitional episodes tracked (8 additional orphan episodes between arcs added in v1.1)

#### 3.1.3 Progress Visualization ✅
- Grand progress bar spanning the full series with saga boundary markers
- Per-saga progress bars in collapsed saga headers
- Per-arc progress bars in collapsed arc headers
- Stats dashboard: episodes watched, remaining, current arc, estimated watch time left
- Percentage display on the main progress bar

#### 3.1.4 Information Architecture ✅
- **Saga level:** 11 sagas, each color-coded, collapsible to reveal their arcs
- **Arc level:** 32 story arcs with icons, episode ranges, and spoiler-free teasers
- **Episode level:** individual episode buttons within expanded arcs

---

### 3.2 Secondary Features (P1)

#### 3.2.1 Light/Dark Mode ✅
Full theme switching between a dark nautical theme and a warm parchment-inspired light theme. Both themes use a token-based color system (20+ semantic tokens). User preference persists between sessions. Safari iOS overscroll area matches theme color.

#### 3.2.2 Milestone System ✅
13 milestones tied to key narrative moments. Toast notification animates in when a milestone episode is watched. Milestones display in the Stats view as a locked/unlocked achievement list.

#### 3.2.3 Stats View ✅
Dedicated Stats tab with:
- Quick facts grid (total episodes, canon count, filler count, sagas, arcs, estimated runtime)
- Arc ratings leaderboard (ranked by user rating)
- Milestones achievement list

#### 3.2.4 Easter Eggs ✅
- Clickable ship on the progress bar with escalating Luffy-style meat demands
- Additional easter eggs TBD

#### 3.2.5 Watch Pace Calculator ✅ *(added v1.1)*
Two-mode calculator in the dedicated Pace tab:
- **By Date:** Set a target completion date → shows episodes/day needed, days left, status chip (chill/on track/ambitious)
- **By Pace:** Set episodes/day → shows estimated finish date and days to completion
- Themed date picker (react-datepicker) matching dark/light mode
- Settings persist to localStorage

---

### 3.3 Secondary Features (P2) — ✅ Complete

#### 3.3.1 Crew Recruitment Tracker ✅ *(added v1.2)*
Visual roster of Straw Hat crew members on a dedicated Crew tab. Members unlock at their recruitment episode with biography, role badge, and spoiler-gated bounty (hidden until the user reaches the relevant episode).

#### 3.3.2 Arc Rating System ✅ *(added v1.2)*
After completing an arc, users rate it 1–5 stars with half-star (0.5 increment) support. Interactive star UI with hover preview. Ratings persist to localStorage and display as a personal arc ranking in the Stats tab.

#### 3.3.3 Accessibility Audit ✅ *(added v1.2)*
WCAG AA compliance across all components:
- Global `:focus-visible` outline for keyboard users
- `role="status"` + `aria-live="polite"` on Toast for screen reader announcements
- `role="tablist"` / `role="tab"` / `aria-selected` on navigation
- `role="button"` + `tabIndex` + `aria-expanded` + keyboard handlers (Enter/Space) on saga/arc expand headers
- `aria-label` / `aria-pressed` on episode buttons, star rating buttons, theme toggle
- `<article>` + `<h3>` semantic structure in Crew Roster
- `aria-hidden` on all decorative emojis and icons
- `onFocus`/`onBlur` on HoverButton to mirror hover styles for keyboard focus

#### 3.3.4 Arc-Level Crunchyroll Link *(suggested by community)*
A "Watch on Crunchyroll" link per arc opening the One Piece series page. Arc-level rather than episode-level due to Crunchyroll's non-predictable episode URL structure.

---

### 3.4 Future Features (P3)

- Social sharing cards (progress snapshots)
- Watch session logging and streaks
- Per-episode notes
- PWA support for mobile home screen install
- Account system for cross-device sync
- Expansion to other long-running anime series

---

## 4. Design Specifications

### 4.1 Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Title | Pirata One | 400 | clamp(28px, 5vw, 42px) |
| Saga names | Outfit | 700 | 17px |
| Arc names | Outfit | 600 | 16px |
| Body/teasers | Outfit | 400 | 15px |
| Stat numbers | Outfit | 800 | 24–28px |

### 4.2 Saga Color System
| Saga | Color |
|------|-------|
| East Blue | #4A90D9 |
| Arabasta | #D4A44C |
| Sky Island | #9B59B6 |
| Water 7 | #2ECC71 |
| Thriller Bark | #E74C3C |
| Summit War | #F39C12 |
| Fish-Man Island | #1ABC9C |
| Dressrosa | #E91E63 |
| Whole Cake Island | #FF6F61 |
| Wano Country | #7C4DFF |
| Final Saga | #00BCD4 |

---

## 5. Data Model

- **SAGAS array:** 11 saga objects, each with name, color, and arcs array
- **Arc objects:** name, episode range [start, end], icon emoji, spoiler-free teaser
- **FILLER_EPS set:** 102 episodes (94 canonical filler + 8 transitional episodes between arcs)
- **MILESTONES array:** 13 milestone objects with episode number, emoji, and message
- **TOTAL_EPS:** 1155
- **Storage key:** `op-full-tracker-v3`

---

## 6. Known Issues / Resolved Bugs

| Issue | Status | Resolution |
|-------|--------|------------|
| 8 episodes unreachable (stuck at 99%) | ✅ Fixed v1.1 | Added orphan episodes 45,46,47,61,68,69,226,628 to FILLER_EPS |
| Skip filler OFF stuck at 94% | ✅ Fixed v1.1 | Stats now use `allTrackableEps` (arc-range episodes only) as denominator |
| Safari iOS overscroll shows white | ✅ Fixed v1.1 | Body background synced to theme via useEffect |

---

## 7. Roadmap

### Phase 1 — Foundation ✅ Complete
Episode tracking, saga/arc hierarchy, filler management, progress visualization, light/dark theme, milestone system, stats view, interaction polish, localStorage persistence, Netlify deployment.

### Phase 2 — Enrichment ✅ Complete
- ✅ Watch pace calculator
- ✅ Saga-level mark all watched
- ✅ Crew recruitment visual tracker
- ✅ Arc rating system (with half-star support)
- ✅ WCAG AA accessibility audit
- ✅ Keyboard navigation support

### Phase 3 — Social & Engagement
- ⬜ Social sharing cards
- ⬜ Watch session logging and streaks
- ⬜ Per-episode notes
- ⬜ Arc-level Crunchyroll links
- ⬜ Additional easter eggs

### Phase 4 — Platform
- ⬜ Account system / cross-device sync
- ⬜ PWA support
- ⬜ Push notification reminders
- ⬜ Expansion to other anime series
