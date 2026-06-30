# Advanced Home Loan Calculator

A premium, fully client-side home loan calculator for Indian borrowers — EMI, amortization
charts, a prepayment simulator, and an exportable amortization schedule, all computed instantly
in the browser. No backend, no data leaves the device.

**Live site:** https://abhay2703.github.io/home-loan-calculator/

## Status

This is **Phase 1** of the project: the core calculation engine, loan input form, results
dashboard, four interactive charts, a searchable/sortable/exportable amortization table, and the
prepayment simulator. Phase 2 will add refinance, rent-vs-buy, tax/affordability calculators,
scenario comparison, AI-style recommendations, and the educational section described in the
original spec.

## Tech stack

- [Next.js](https://nextjs.org) (App Router, static export) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (base-nova / Base UI)
- [Recharts](https://recharts.org) for charts, lazy-loaded with `next/dynamic`
- [Framer Motion](https://www.framer.com/motion/) for micro-animations
- [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) for the input form
- [Vitest](https://vitest.dev) for unit-testing the financial calculation engine
- `exceljs` / `jspdf` + `jspdf-autotable` for Excel/PDF export

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build (static export to `out/`) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run the calculation-engine unit tests once |
| `npm run test:watch` | Run unit tests in watch mode |

## Architecture

```
src/
  lib/
    calculations/        Pure, framework-free financial calculation engine
      emi.ts              EMI formula + binary-search solver for step-up/step-down EMIs
      amortization.ts      Month-by-month schedule builder (EMI types + prepayments)
      loan-basics.ts       Down payment derivation, processing fee, borrowing cost
      chart-data.ts         Monthly/yearly series shaping for the charts
      format.ts              en-IN currency/number/percent formatting
      schema.ts                Zod schema + defaults for the loan input form
      *.test.ts                  Vitest unit tests
    export/
      amortization-export.ts  CSV / Excel / PDF / print export
  components/
    calculator/
      calculator-context.tsx  React Hook Form instance + derived amortization schedules
      loan-input-form.tsx       Loan amount / rate / tenure / EMI type inputs
      results-cards.tsx           EMI / interest / payment / split summary cards
      prepayment-simulator.tsx      Recurring + lump-sum prepayments, before/after comparison
      amortization-table.tsx          Searchable/sortable schedule with export menu
      charts/                           Loan reduction, principal-vs-interest, pie, year-wise
```

The calculation engine in `src/lib/calculations` has no React or UI dependencies — it's pure
functions operating on plain types, fully covered by unit tests (`npm run test`). All EMI types
(normal, step-up, step-down, interest-only construction period) and prepayment strategies
(reduce-tenure vs. reduce-EMI, recurring and one-off lump sums) are implemented as a single
month-by-month amortization simulator rather than separate formulas per case, so behavior stays
consistent and reuse is high.

## Deployment

The site deploys to **GitHub Pages** via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
on every push to `main`: it runs the unit tests, builds a static export (`next build` with
`output: "export"`), and publishes `out/` through GitHub's official Pages actions.

`next.config.ts` sets `basePath`/`assetPrefix` to `/home-loan-calculator` only when the
`GITHUB_PAGES=true` environment variable is set (which the workflow sets), so local dev and
Vercel-style deployments are unaffected.

To enable Pages for this repo: **Settings → Pages → Source → GitHub Actions**.

## License

Built for Indian home loan borrowers. No warranty — verify figures against your lender's official
calculations before making financial decisions.
