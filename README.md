# MRSHKN demos

Industry demo sites of the MRSHKN studio. Each demo is a Next.js + Payload app on its own subdomain
(`<slug>.mrshkn.com`); `packages/core` holds what every demo shares: lead form, booking button, reviews (the Yandex
Maps widget for a real business or text-only reviews for a fictional one), click-to-load map, schema.org markup,
cookie notice, privacy page and the "demo project of MRSHKN studio" footer.

Demos: `apps/template` — the template every demo starts from; `apps/dental` — a fictional dental clinic in the Swiss
direction (doctors, services with prices, price list, reviews, license, booking, map).

```
docker compose -p mrshkn-demos up -d   # Postgres on 127.0.0.1:5435
cp apps/template/.env.example apps/template/.env
yarn install
yarn dev                               # template on http://localhost:3300
yarn workspace @mrshkn/demo-dental dev -p 3304
yarn demo:new expert                   # new demo in apps/expert
yarn test                              # types, lint, format, unit, integration, e2e
yarn test:lighthouse dental            # Lighthouse CI of a demo
```
