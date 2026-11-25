# AGENTS.md

ALTrack is a client-only AniList companion: React 19 + Vite SPA talking directly to the AniList GraphQL API (`https://graphql.anilist.co`) via Apollo Client 4. Deployed on Vercel (`vercel.json` rewrites everything to `/`).

## Commands

- `npm run dev` – start Vite dev server
- `npm run build` – production build to `dist/`
- `npm run lint` – ESLint (the only automated check; there are no tests)

Env: `VITE_ANILIST_CLIENT_ID` in `.env.local` (OAuth client id). Optional `VITE_BASE_PATH` sets Vite `base`.

## Layout

- `src/App.jsx` – Apollo client + link chain, routes, dock nav, toast container
- `src/pages/` – one component per route (`/Dashboard`, `/Discover`, `/Browse`, `/Search`, `/Userlist`, `/Profile`, `/Details`, `/Landing`); routes are capitalized
- `src/components/<Page>/` – page-specific pieces, prefixed with the page name (e.g. `DetailsCoverSection.jsx`)
- `src/services/Queries.jsx`, `Mutation.jsx` – all `gql` documents live here; add new ones here, not inline
- `src/services/` (`.js`) – Apollo links: `RateLimit.js`, `SmartRequestLink.js`, `CachePersistence.js`
- `src/contexts/` – `AuthContext.js` (context + `useAuth`) and `AuthContext.jsx` (provider), split for react-refresh
- `src/utils/` – helpers (`errorHandling.js` → `getApiErrorMessage`)
- `src/css/` – one plain CSS file per page/component, imported directly; MUI is used for some widgets

## Key behavior

- **Auth:** AniList implicit OAuth. Token arrives in the URL hash on `/Dashboard`, stored in `localStorage["anilist_token"]`. Use `useAuth()` for `authToken`/`login`/`logout`; login/logout also clear the persisted cache.
- **Link chain (order matters):** `authLink → rateLimitLink → smartRequestLink → persistenceLink → HttpLink`.
- **Rate limits:** AniList is strict (~90 req/min, lower when degraded). `smartRequestLink` throttles queries client-side; `rateLimitLink` detects 429s and drives `RateLimitOverlay`. Keep request counts low: prefer aggregated queries and cache hits over new fetches.
- **Cache:** Apollo cache is persisted to `localStorage["altrack:apollo-cache-v2"]` with a 24h TTL. Type policies live in `services/CachePolicies.js`; `Page` is keyed by its args plus its list field's args so different lists never overwrite each other. Bump the key version if the cached shape changes incompatibly.
- **Errors:** show user-facing errors with `react-toastify` using `getApiErrorMessage(err)`; it returns `null` for rate-limit errors (the overlay handles those), so skip the toast then.
- **Mutations:** follow the optimistic-update pattern used in `components/Details` and `components/Dashboard`.

## Conventions

- Plain JS/JSX (no TypeScript), function components and hooks, Apollo hooks imported from `@apollo/client/react`.
- Prettier-style formatting: double quotes, semicolons, trailing commas.
- Commits use Conventional Commits (`feat:`, `fix:`, `perf:`, `chore:`).
