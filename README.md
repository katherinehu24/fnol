# NorthBay Mutual — Adjuster Workbench

Production-style workflow prototype for an Auto PD FNOL intake deployment, embedded into Guidewire ClaimCenter.

This is a deployable Next.js application built for a workshop with NorthBay Mutual claims operations. It is not a dashboard. It is an adjuster-facing workflow surface with supporting operational and governance views.

## Surfaces

- **Adjuster Workbench** (`/workbench`) — claim queue, pre-assembled intake package, routing recommendation with rationale and confidence, override and escalation controls, audit trail.
- **Operations** (`/operations`) — Maria Chen's view: workflow telemetry, queue state, bottleneck detection, exception list, adjuster load, deployment narrative.
- **Governance** (`/governance`) — Priya Raman / David Okafor's view: override log, threshold configuration, escalation paths, integration map, audit posture.

## Demo flow

1. Land on `/workbench`. Select **CLM-2026-0451829** (rear-end, clear liability) — high-confidence ready-to-assign.
2. Walk through the pre-assembled package: claimant, policy, police-report extract, coverage map, photos, audit trail.
3. Confirm assignment — audit trail updates with a human-confirmed event.
4. Select **CLM-2026-0451814** — missing-documents exception. Show outbound recovery action.
5. Select **CLM-2026-0451780** — SIU escalation. Show indicators, halt-reserve posture, override-with-justification.
6. Switch to **Operations** — cycle-time reduction, backlog, bottleneck, adjuster load.
7. Switch to **Governance** — override log, threshold config (Compliance-owned), integration map.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build for production

```bash
npm run build
npm start
```

## Deploy to Vercel

```bash
npx vercel
# or push to a Git remote and import in the Vercel dashboard
```

Standard Next.js 14 App Router — no special configuration required.

## Architecture

- **Next.js 14** App Router + TypeScript + Tailwind.
- **Zustand** for in-page demo state (assignment confirmation, override events, audit trail mutations).
- **All data mocked** in `lib/data.ts`. No backend. The interactions that mutate state (confirm, override, escalate, request documents) are demo-only and reset on page reload.
- **Deterministic timestamps** anchored to `2026-05-21T14:32:00-04:00` for stable screenshots.

## Project structure

```
app/
  layout.tsx                Shell + global metadata
  page.tsx                  Redirects to /workbench
  workbench/page.tsx        Primary surface
  operations/page.tsx       Maria Chen — operational telemetry
  governance/page.tsx       Priya / David — audit + thresholds
components/
  Shell.tsx                 Top bar + tab navigation
  ui/primitives.tsx         Panel, Pill, Stat, ConfidenceBar, etc.
  workbench/                Queue, ClaimDetail, RoutingPanel, etc.
lib/
  types.ts                  Domain types
  data.ts                   Mock claims, adjusters, metrics, overrides, integrations
  store.ts                  Zustand store
  format.ts                 Time/money helpers
```

## What this prototype proves

- **Workflow-shaped, not dashboard-shaped.** The adjuster works claims from this surface; the rest of the app exists to make that surface defensible to Operations and Compliance.
- **Pre-assembled package.** Claim arrives with documents extracted, coverage mapped, routing recommended — adjuster's job is judgment, not assembly.
- **Human-in-the-loop, visibly.** Every override requires justification. Every action is logged with actor, timestamp, and decision class.
- **Production-safe posture.** No shadow systems, no silent reroutes, ClaimCenter remains the system of record, thresholds owned by Compliance.
