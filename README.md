# Inventory pulse — React performance lab

A single-page **used-car inventory** demo built to **see** how React performance choices affect a long list: commit time and row paints are plotted live so you can compare toggles without guessing.

**Stack:** Vite, React 19, TypeScript, [react-window](https://github.com/bvaughn/react-window), [Recharts](https://recharts.org/).

## Run locally

```bash
npm install
npm run dev
```

```bash
npm run build   # production build
npm run lint
npm run preview # serve dist
```

### GitHub Pages

Project sites are served under `https://<user>.github.io/<repo>/`, but a root-absolute `/favicon.svg` resolves to `https://<user>.github.io/favicon.svg` and 404s. This project sets Vite `base: './'` in `vite.config.ts` and uses `%BASE_URL%` for the favicon in `index.html` so built assets stay **relative** to the deployed `index.html`. Rebuild and redeploy `dist/` after pulling this change.

## What you’re looking at

- **Chart:** rolling samples of **commit duration** (ms) and **how many row components painted** in that commit.
- **List:** search, shortlist, optional **virtual scrolling** so only visible rows mount.
- **Goal:** same UI, different costs — useful for demos, interviews, or profiling intuition.

## Controls (plain language)

| Toggle | What it does |
|--------|----------------|
| **Heavy load** | Larger catalog + heavier filtering work so differences show up clearly. |
| **Smart rendering** | **On:** memoized row + **stable** shortlist callback (`useCallback`). **Off:** unmemoized row + new handler each render — `React.memo` can’t help if props change every time. |
| **Virtual list** | Uses `react-window` — only visible rows (+ overscan) are mounted. Needs a long enough list (stress on or many matches). |
| **Defer search** | `useDeferredValue` on the search string so typing stays responsive while the list catches up; optional “Catching up…” hint when deferred value lags. |

**Filtered list:** `computeFiltered` is wrapped in `useMemo` on `cars`, the active search query, and whether the heavy inspection path runs — so the derived array doesn’t churn when unrelated state updates (e.g. chart refresh).

## How measurement works

`usePerfLog` marks the start of each render (`beginRender`) and increments a counter from each row’s layout effect (`noteRowRender`). After paint, a layout effect records **commit ms** and **row count** into a rolling buffer. A timer pushes samples to React state for the chart; commits that only mirror ref data into state are **skipped** so the series stays readable.

See `src/hooks/usePerfLog.ts` and the top of `App.tsx` where `beginRender()` runs.

## Project layout (high signal)

| Path | Role |
|------|------|
| `src/App.tsx` | Flags, catalog, filtered list, virtual vs native list, resize observer for list height |
| `src/hooks/usePerfLog.ts` | Commit + row-paint sampling |
| `src/components/CarRow.tsx` | `CarRow` (`memo`) vs `CarRowUnmemoized` |
| `src/logic/filterCars.ts` | Filter + optional expensive pass |
| `src/components/PerfCharts.tsx` | Chart UI |

## Interview-style one-liner

“I built a constrained inventory UI with toggles that turn optimizations on and off, and a live chart so we can relate **list architecture** (memoization, stable callbacks, virtualization, deferred input) to **measured render cost**.”

---

Bootstrapped with [Vite](https://vite.dev/) + React + TypeScript.
