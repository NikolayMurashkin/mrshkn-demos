# MRSHKN demos

Industry demo sites of the MRSHKN studio. Each demo is a Next.js + Payload app on its own subdomain
(`<slug>.mrshkn.com`); `packages/core` holds what every demo shares: lead form, booking button, Yandex Maps
reviews widget, schema.org markup, cookie notice, privacy page and the "demo project of MRSHKN studio" footer.

```
docker compose -p mrshkn-demos up -d   # Postgres on 127.0.0.1:5435
cp apps/template/.env.example apps/template/.env
yarn install
yarn dev                               # template on http://localhost:3300
yarn demo:new dental                   # new demo in apps/dental
yarn test                              # types, lint, format, unit, integration, e2e
yarn test:lighthouse dental            # Lighthouse CI of a demo
```
