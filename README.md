# Journey Mentor — Flight Search

A flight search SPA built with Vue 3 + TypeScript against the [Duffel](https://duffel.com) sandbox API.

**Live:** https://journey-mentor-challenge.vercel.app/ 

## Stack

- Vue 3 (`<script setup>`, Composition API), TypeScript
- Pinia for state
- Tailwind CSS 3
- Vite, deployed to Vercel (with a Vercel Serverless Function as the API proxy)
- `@vueuse/core` for `useDebounceFn`, `useUrlSearchParams`, `useStorage`, `onClickOutside`

## Setup

```bash
npm install
cp .env.example .env   # fill in your Duffel sandbox token
npm run dev
```

`.env` variables (server-side only, never sent to the browser):

```
DUFFEL_API_TOKEN=duffel_test_xxxxxxxxxxxxxxxxxxxxxxxx
DUFFEL_API_BASE_URL=https://api.duffel.com
DUFFEL_VERSION=v2
```

`npm run build` runs `vue-tsc -b && vite build`.

## Architecture

```
Browser  →  /api/duffel/*  →  proxy (dev: Vite server.proxy, prod: Vercel rewrite + function)  →  api.duffel.com
```

The frontend never talks to `api.duffel.com` directly and never sees the Duffel token. It only calls
same-origin relative paths (`/api/duffel/...`). Both proxies share the same contract: they inject
`Authorization: Bearer <token>` and `Duffel-Version` server-side.

- **Dev** — `vite.config.ts` reads the env vars via `loadEnv` (Node-only, never bundled) and configures
  `server.proxy['/api/duffel']`, injecting the auth header in the `proxyReq` hook.
- **Production** — `api/duffel-proxy.ts` is a Vercel serverless function with an allowlist of Duffel
  path prefixes (`air/offer_requests`, `air/offers`, `places/suggestions`). `vercel.json` rewrites
  `/api/duffel/:path*` to it (`?path=:path*`), rather than relying on Vercel's filesystem catch-all
  routing (`api/duffel/[...path].ts`), which only matched single-segment paths in production — see
  the git history for that fix. The function always overwrites any `Authorization` header sent by the
  client and forwards Duffel's status/error body unchanged.

This was a deliberate fix: the project originally had `VITE_DUFFEL_API_URL`/`VITE_DUFFEL_API_TOKEN`,
which Vite inlines into the client bundle — anyone could `view-source` the token. Renaming to
unprefixed, server-only vars and routing everything through the proxy closes that hole.

## Key decisions

- **Pinia over ad-hoc composables** — `ResultsList`, `SortFilterBar`, `DateWindowShifter`, and
  `SearchHistoryPanel` are sibling components that all need the same search state without prop-drilling.
  Pinia was already a project dependency and is also where persistence naturally lives.
- **No vue-router** — there's only one logical screen; an offer's detail is an in-place expansion
  (a table row → lazy-loaded `OfferDetail`, via `defineAsyncComponent`) rather than a route. Adding a
  router for a single view would be pure ceremony.
- **Search state lives in the URL, not `localStorage`** — `form`, `filters`, `sort`/`sortDirection` are
  backed by VueUse's `useUrlSearchParams` (see `stores/search.ts`), so a search is a shareable,
  bookmarkable, back/forward-navigable link. Query params are only written on a real "apply" action
  (picking an autocomplete suggestion, changing a filter/sort, submitting the form) — free typing in
  Origin/Destination is kept in local component state and never touches the URL until a suggestion is
  picked or the form is submitted. `offers`/`status`/`offerRequestId` are deliberately **not** persisted
  anywhere (in-memory `ref`s only): Duffel offers expire, so caching them across reloads would show stale
  prices as if they were live. If the URL already encodes a full search on load (deep link, reload,
  shared link), the store re-issues the request automatically.
- **`useStorage` for search history only** — unlike the current search, past searches genuinely are
  per-device, not shareable, so `stores/searchHistory.ts` is the one place that still goes through
  VueUse's `useStorage`, a reactive wrapper instead of manual `JSON.parse(localStorage.getItem(...))`.
- **`defineModel()`** — form subcomponents (`AutocompleteInput`, the generic `Select`, `DateInput`) use
  the Vue 3.4+ `defineModel()` macro instead of manually wiring `modelValue` prop + `update:modelValue`
  emit boilerplate. `Select` is a single generic component (accepts both string and number options) rather
  than one bespoke dropdown per field.
- **Composable cleanup** — `usePlaceAutocomplete` aborts any in-flight suggestion request via
  `onScopeDispose`, and `onClickOutside` (VueUse) disposes its own listener; nothing leaks past a
  component's lifetime. The search store's own request is aborted the same way whenever a newer search
  starts (see Race conditions below).
- **Vue's reactivity as the "signals" layer** — `ref`/`computed` in the store and in
  `usePlaceAutocomplete` are Vue's fine-grained reactive primitives; there's no separate signals API to
  reach for, and no manual change-detection opt-in (like Angular's `OnPush`) is needed — Vue's reactivity
  is push-based and per-property by default.
- **Sticky header, filter bar above the results table** — `AppHeader` is sticky; the sort/filter controls
  (`SortFilterBar`, which also hosts the date-window shifter) sit in a single bar above `OffersTable`
  rather than a sidebar, so the same bar works from mobile up to desktop without a separate layout.
- **Keyboard-accessible table** — sort column headers are real `<button>`s with `aria-sort` on the `<th>`,
  and each row's expand/collapse control is a focusable `<button>` with `aria-expanded`, not just a
  click handler on the row.
- **TypeScript everywhere**, including the Duffel wire types (`types/duffel.ts`) and app-level types
  (`types/search.ts`), kept separate so a Duffel schema change doesn't ripple through component props.
- **Native `Date`/`Intl.DateTimeFormat`** — no date library. The only non-trivial parsing is ISO 8601
  durations (`PT7H30M`, or `P1DT4H45M` for offers that span midnight), handled by a ~10-line parser in
  `utils/duration.ts`.
- **User-facing errors are mapped, not passed through** — `services/duffelClient.ts` exposes
  `friendlyErrorMessage()`, so `ErrorState` never shows Duffel's raw API error text to the end user.
- **Round trips are a second slice, not a second search** — `form.returnDate` is optional; when set,
  `services/offers.ts` adds a return slice (`destination → origin`) to the same `POST /air/offer_requests`
  payload, so Duffel returns each offer with both slices already priced together. `utils/offer.ts` centralizes
  `stopCount()` and `totalDurationMinutes()` as sums across **all** slices, so sorting/filtering and the
  results table behave consistently whether an offer has one slice (one-way) or two (round trip).
- **Autocomplete selection vs. free typing** — `AutocompleteInput` writes the exact same string to the
  draft on `select` as `SearchForm` commits to `form.originName`/`destinationName`. `SearchForm.commitDrafts()`
  compares the draft against that committed name on submit and clears `origin`/`originName` (or
  `destination`/`destinationName`) on any mismatch — so editing the text after picking a suggestion, without
  picking a new one, fails validation instead of silently submitting the stale IATA code.

## Bonus features implemented

- Debounced autocomplete for origin/destination (`usePlaceAutocomplete`, 300ms debounce via
  `useDebounceFn`), with its own abort/sequence guard per input instance.
- Sort (price / duration / departure time, ascending or descending, toggled from the table headers) and
  filter (stops — nonstop / 1 / 2+, airline, price range, departure time window) — combinable, computed
  client-side over the last successful offer set.
- Persisted search history (last 10, deduped by origin/destination/date), one click re-runs a past search.

## What was left out, and why

- A dedicated date-range picker for the "date window" bonus — implemented instead as a ± one day shifter
  that re-issues a fresh `POST /air/offer_requests` (offer requests are immutable; Duffel has no `PATCH`
  for the departure date), which is enough to demonstrate the state-machine/race-guard behavior the
  challenge is checking for. Shifting preserves the outbound/return gap when a return date is set.
- A literal 3-column desktop layout — the top filter bar + full-width results table already solves the
  "don't waste a wide viewport" problem; a third column would need a summary/comparison panel this app's
  data model doesn't have a real use for yet.
- Baggage allowance in the offer detail falls back to "no info" per segment if Duffel's sandbox doesn't
  populate `segments[].passengers[].baggages` for a given fare — this is sandbox data availability, not
  something the client can compute.
- **Automated tests.** Not part of the brief's requirements, so no test runner was added; the time budget
  went to the Core/bonus feature list instead. If this were extended, the first tests added would be the
  pure functions with no Vue/DOM dependency — `utils/validation.ts`, `utils/duration.ts`, `utils/offer.ts`,
  `utils/date.ts` — since they're the cheapest to test and encode the trickiest logic (ISO 8601 duration
  parsing, round-trip stop/duration aggregation, date-window shifting).

## Race conditions

`stores/search.ts` keeps a module-scoped `AbortController` and a monotonic `requestSeq` outside Pinia's
reactive state (so they're not persisted or tracked). Every `search()` call aborts the previous in-flight
request, takes a new controller + sequence number, and only applies the response to state if its sequence
number is still the latest when the promise resolves. `usePlaceAutocomplete` uses the same pattern per
input instance, so typing quickly in both Origin and Destination can't cross-write results.

## Deployment (Vercel)

1. Push to a GitHub repo, import it in Vercel.
2. Set `DUFFEL_API_TOKEN`, `DUFFEL_API_BASE_URL`, `DUFFEL_VERSION` as Environment Variables for both
   Production and Preview (Project Settings → Environment Variables).
3. Deploy. `api/duffel-proxy.ts` is picked up automatically as a serverless function; `vercel.json`
   rewrites `/api/duffel/*` requests to it — no extra dashboard config needed.
4. Verify: DevTools Network tab should only ever show requests to `/api/duffel/...`, never
   `api.duffel.com` directly; `grep -R "duffel_test" dist/` should return nothing after `npm run build`.

## A note on this README

This documentation (structure, wording, the trade-off write-ups above) was drafted with the help of an
AI/LLM assistant, then reviewed and edited. The code changes it describes were also implemented with
AI assistance, under direction and review.
