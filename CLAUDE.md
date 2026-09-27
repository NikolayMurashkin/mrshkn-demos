# CLAUDE.md — demos (отраслевые демо студии MRSHKN)

Монорепозиторий отраслевых демо: каждое демо — отдельное приложение на поддомене `<slug>.mrshkn.com`,
общий пакет дает то, что есть в любом демо. Решения по студии — `../PLAN.md`, порядок работ и критерии
приемки — `../ROADMAP.md` (фаза 2, блоки B18–B22), артборды направлений — `../design/*.dc.html`.

## Стек

Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript, SCSS-модули, Payload 3 на Postgres
в том же приложении. Yarn 4 workspaces через corepack (`nodeLinker: node-modules`), Node 24. Пакеты — ESM
(`"type": "module"`): иначе CLI Payload грузит конфиг как CommonJS и не находит модули без расширений.

## Структура

```
packages/core/            @mrshkn/demo-core — общий пакет, исходники TS без сборки (transpilePackages)
  src/components/<Name>/  DemoFooter, BookingButton, LeadForm, CookieBanner, YandexReviews, JsonLd, PrivacyPolicy
  src/cms.ts              createDemoCmsConfig: Payload с коллекциями users и leads + коллекции демо
  src/cms/collections.ts  users, leads
  src/lead-route.ts       обработчик формы: лимит, разбор, запись в CMS, уведомление в Telegram
  src/lead/               разбор и текст заявки, лимитер, Telegram
  src/schema.ts           JSON-LD дела демо
  src/demo.ts, proxy.ts   адрес демо, noindex вне production (метаданные, заголовок, robots.txt)
  src/consts.ts, types.ts
apps/template/            шаблон, из которого разворачивается каждое демо
  src/demo.config.ts      все, что отличает демо: slug, тексты, дело для schema.org, Mini App, отзывы
  src/app/(site)/         страницы демо; api/lead — обработчик формы
  src/app/(payload)/      админка и REST Payload — файлы генерирует Payload, руками не правятся
  src/migrations/         миграции Payload (генерируются)
  src/styles/tokens.scss  токены --demo-*, которые берут компоненты ядра
apps/<slug>/              демо, развернутые из шаблона
scripts/                  demo-new (разворачивание), lighthouse (замер)
tests/unit/               Vitest: ядро, разворачивание, токены
tests/integration/        Vitest на Postgres: Payload целиком — обработчик формы, права, миграции
tests/e2e/                Playwright по шаблону
```

## Новое демо

`yarn demo:new <slug>` копирует `apps/template` в `apps/<slug>` без сборок, зависимостей, отчетов, медиатеки
и `.env`, переименовывает пакет в `@mrshkn/demo-<slug>` и поддомен в `demo.config.ts`, затем делает
`yarn install` (новый workspace; на CI установка по умолчанию immutable, поэтому с `--no-immutable`).
Имя — поддомен: латиница в нижнем регистре, цифры и дефис, с буквы, 2–30 знаков; занятые студией имена
(`RESERVED_SLUGS` в `packages/core/src/consts.ts`) и существующие демо не проходят. Поддомен одноуровневый:
wildcard-сертификат `*.mrshkn.com` покрывает один уровень (D24). Если меняется то, что заменяет скрипт
(`"@mrshkn/demo-template"` в `package.json`, `slug: 'template'` в `demo.config.ts`), скрипт падает с ошибкой,
а не разворачивает демо с чужим поддоменом.

Отраслевое демо меняет `demo.config.ts`, свои страницы в `src/app/(site)/`, токены и шрифты направления
и добавляет свои коллекции в `createDemoCmsConfig({ collections })` — после этого новая миграция в своем
приложении (`yarn workspace @mrshkn/demo-<slug> payload migrate:create <имя>`).

## Что есть в каждом демо

- **Подвал** «Демо-проект студии MRSHKN» со ссылкой на mrshkn.com (D15) — не настраивается, демо добавляет
  свое содержимое над подписью через `children`. До B49 корень mrshkn.com не отвечает, поэтому поддомены демо
  не публикуются раньше (D21).
- **Форма заявки** → `POST /api/lead`: лимит 10 заявок с адреса за 10 минут, поле-приманка, согласие
  на обработку данных обязательно; заявка пишется в коллекцию `leads` (создать и править ее руками нельзя
  даже редактору), уведомление уходит в Telegram, если заданы `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_IDS`.
  Упавший Telegram заявку не теряет, незаписавшаяся в базу заявка — 500.
- **Запись** — `BookingButton`: с `miniAppUrl` открывает Mini App «Запись» (B23/B24), без него ведет к форме.
- **Отзывы** — официальный виджет Яндекс Карт по `yandexOrgId`; без номера раздела нет. Своих отзывов демо
  не пишет (D14): у вымышленного дела организации на картах нет.
- **schema.org** — `buildBusinessJsonLd(DEMO)`, тип из `business.schemaType`; `<` в JSON-LD экранируется.
- **Cookie** — уведомление с одной cookie `cookie_notice`; сервер читает ее и не рендерит уведомление
  вернувшемуся человеку, поэтому оно не мелькает после гидрации.
- **Политика** `/privacy` — общий текст ядра: оператор — студия, дело вымышлено. Черновик до B34/B36.
- **noindex** вне `DEMO_ENV=production`: meta robots, заголовок `X-Robots-Tag` на всех ответах (`proxy.ts`)
  и `robots.txt` с `Disallow: /`.
- **Подсказки темы** Payload (Accept-CH, Critical-CH) оставлены только `/admin`: `withPayload` вешает их на все
  адреса, а Critical-CH на странице заставляет Chrome повторить первый запрос (`next.config.ts`).

Компоненты ядра берут цвета, радиусы, тени и шрифт только из токенов `--demo-*`; `tests/unit/tokens.test.ts`
падает, если в SCSS ядра литерал или если какое-то демо не задает токен, который ядро использует.

## Разработка

Postgres 18 из `docker-compose.yml` на `127.0.0.1:5435` (порт не 5432–5434: там базы других проектов),
базы `demos` (разработка), `demos_test` (интеграционные), `demos_e2e` (Playwright):
`docker compose -p mrshkn-demos up -d`. Переменные — `apps/<slug>/.env` по образцу `.env.example`.
Сборке база не нужна: админка и REST рендерятся на запрос.

Порты: 3300 — `yarn dev` шаблона, 3301 — e2e, 3302 — Lighthouse. Playwright `reuseExistingServer` подхватит
чужой сервер на 3301, поэтому перед полным прогоном его гасить (или `CI=1`).

**Миграции.** В production Payload схему не накатывает, ее создают миграции `src/migrations/` каждого демо.
Их запускает при старте `prodMigrations`, но только с `MIGRATE_ON_START=true` — флаг задан в образе и у e2e-сервера.
`tests/integration/migrations.test.ts` сравнивает схему конфига шаблона со снимком последней миграции.

## Команды

```
yarn dev                               шаблон на 3300
yarn demo:new <slug>                   новое демо
yarn test                              typecheck, lint, format:check, unit, integration, e2e
yarn test:lighthouse [slug]            сборка демо с DEMO_ENV=production и Lighthouse CI (по умолчанию template)
```

Lighthouse CI (`lighthouserc.cjs`): главная и `/privacy`, по три прогона после одного прогревочного,
`aggregationMethod: 'pessimistic'` — каждая категория (performance, accessibility, best practices, SEO) ≥ 0,9
в каждом прогоне. На CI меряется не шаблон, а демо, только что развернутое `yarn demo:new ci-probe`: так
проверяется сама команда. Шаг «CPU class and score of each run» пишет `benchmarkIndex` каждого прогона.

Новый критерий из ROADMAP сначала становится тестом, потом кодом.

## Деплой

Образ один на все демо: `docker build --build-arg APP=<slug> .` собирает `apps/<slug>` в standalone и запускает
`node apps/<slug>/server.js` на 3000 с `MIGRATE_ON_START=true`. Переменные при работе: `DATABASE_URL`,
`PAYLOAD_SECRET`, `DEMO_ENV` (пусто — noindex), при желании `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`.
Сертификат — общий wildcard `*.mrshkn.com` из Coolify; свой сертификат на имя демо не заводить: имя попало бы
в журнал Certificate Transparency (D24). Порядок работы с сервером — `../docs/ops/coolify.md`.

## Конвенции

- Компоненты — стрелочные функции; тип пропсов `ComponentNameProps` через `type`.
- Константы и типы — в `consts.ts` и `types.ts`, не в файле компонента.
- SCSS без комментариев; медиазапросы только `max-width`; `hyphens: none`.
- Текст из CMS не вылезает из контейнера: `overflow-wrap: anywhere`, `min-width: 0`.
- Prettier: 120 символов, одинарные кавычки, точка с запятой, один атрибут на строку.
- Буква «е» вместо «ё»; после «в», «к», «с», «на», «и» — неразрывный пробел (`&nbsp;` в JSX, ` ` в строках).
- Честность (D14, D15): в демо нет реальных чужих названий, выдуманных отзывов, стоковых «сотрудников»
  и выдуманных бизнес-метрик.
