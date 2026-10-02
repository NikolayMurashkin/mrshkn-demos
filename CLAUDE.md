# CLAUDE.md — demos (отраслевые демо студии MRSHKN)

Монорепо отраслевых демо: демо — отдельное приложение на поддомене `<slug>.mrshkn.com`, общий пакет — то, что есть в любом демо. Решения студии — `../PLAN.md`, порядок работ и критерии приемки — `../ROADMAP.md` (фаза 2, блоки B18–B22), артборды направлений — `../design/*.dc.html`.
Демо сейчас: `template` (шаблон), `dental` — стоматология «Точно», направление Swiss.

## Стек

Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript, SCSS-модули, Payload 3 на Postgres в том же приложении. Yarn 4 workspaces через corepack (`nodeLinker: node-modules`), Node 24. Пакеты — ESM (`"type": "module"`): иначе CLI Payload грузит конфиг как CommonJS и не находит модули без расширений.

## Структура

```
packages/core/            @mrshkn/demo-core — общий пакет, исходники TS без сборки (transpilePackages)
  src/components/<Name>/  DemoFooter, BookingButton, LeadForm, CookieBanner, YandexReviews, DemoReviews, MapEmbed,
                          JsonLd, PrivacyPolicy
  src/cms.ts              createDemoCmsConfig: Payload с users и leads + коллекции демо и засев (onInit)
  src/cms/collections.ts  users, leads
  src/cms/reviews.ts      коллекция вымышленных отзывов (подключает демо), проверка подписи автора
  src/typograph.ts        типограф текстов CMS: nbsp после коротких слов и перед тире; абзацы
  src/map.ts              адрес виджета Яндекс Карт для карты по нажатию
  src/lead-route.ts       обработчик формы: лимит, разбор, запись в CMS, уведомление в Telegram
  src/lead/               разбор и текст заявки, лимитер, Telegram
  src/schema.ts           JSON-LD дела демо
  src/demo.ts, proxy.ts   адрес демо, noindex вне production (метаданные, заголовок, robots.txt)
  src/consts.ts, types.ts
apps/template/            шаблон каждого демо
  src/demo.config.ts      все, что отличает демо: slug, тексты, дело для schema.org, Mini App, отзывы
  src/app/(site)/         страницы демо; api/lead — обработчик формы
  src/app/(payload)/      админка и REST Payload — генерирует Payload, руками не править
  src/migrations/         миграции Payload (генерируются)
  src/styles/tokens.scss  токены --demo-* для компонентов ядра
apps/<slug>/              демо, развернутые из шаблона
apps/dental/              «Клиника»: src/cms/ — коллекции услуг и врачей, засев (seed/), запросы страниц;
                          src/components/ — части направления Swiss; src/consts.ts — лицензия, меню, часы;
                          lighthouse.json — страницы замера
scripts/                  demo-new (разворачивание), lighthouse (замер)
tests/unit/               Vitest: ядро, разворачивание, токены
tests/integration/        Vitest на Postgres: Payload целиком — обработчик формы, права, миграции
tests/e2e/                Playwright по шаблону
```

## Новое демо

`yarn demo:new <slug>`: копирует `apps/template` в `apps/<slug>` без сборок, зависимостей, отчетов, медиатеки и `.env`; переименовывает пакет в `@mrshkn/demo-<slug>` и поддомен в `demo.config.ts`; `yarn install` (новый workspace; на CI установка immutable по умолчанию → `--no-immutable`).

- Имя = поддомен: латиница в нижнем регистре, цифры, дефис, с буквы, 2–30 знаков. Отказ: занятые студией (`RESERVED_SLUGS` в `packages/core/src/consts.ts`) и существующие демо.
- Поддомен одноуровневый: wildcard-сертификат `*.mrshkn.com` покрывает один уровень (D24).
- Изменены строки, которые заменяет скрипт (`"@mrshkn/demo-template"` в `package.json`, `slug: 'template'` в `demo.config.ts`) → скрипт падает и удаляет недоделанную копию, а не разворачивает демо с чужим поддоменом.

Отраслевое демо меняет `demo.config.ts`, свои страницы в `src/app/(site)/`, токены и шрифты направления; свои коллекции — в `createDemoCmsConfig({ collections })`, затем новая миграция в своем приложении (`yarn workspace @mrshkn/demo-<slug> payload migrate:create <имя>`). В `.env.example` нового демо — своя база (`demos_<slug>`): две схемы в одной базе разработки push Payload превратит в вопрос в терминале о потере данных.

**Контент демо** — в git (`src/cms/seed/data.ts` у «Клиники»); в пустую базу — засевом из `onInit` в `createDemoCmsConfig`: на стенде, в разработке, под Lighthouse, без ручного импорта. Засев идет после миграций и трогает только пустые коллекции → правки из админки не перезаписываются.

Цепочка импортов `payload.config.ts` демо — только относительные пути: интеграционный тест миграций грузит конфиг каждого демо напрямую, а `@/` в тестах указывает на шаблон.

## Что есть в каждом демо

- **Подвал** «Демо-проект студии MRSHKN» со ссылкой на mrshkn.com (D15) — не настраивается; демо добавляет свое над подписью через `children`. До B49 корень mrshkn.com не отвечает → поддомены демо раньше не публикуются (D21).
- **Форма заявки** → `POST /api/lead`: лимит 10 заявок с адреса за 10 минут, поле-приманка, обязательное согласие на обработку данных. Заявка → коллекция `leads` (создать и править руками нельзя даже редактору); Telegram — если заданы `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_IDS`. Упал Telegram — заявка не теряется; не записалась в базу — 500.
- **Запись** — `BookingButton`: с `miniAppUrl` открывает Mini App «Запись» (B23/B24), без него ведет к форме.
- **Отзывы**, два случая:
  - дело с настоящей организацией на картах → официальный виджет Яндекс Карт (`YandexReviews` по `yandexOrgId`; без номера раздела нет);
  - вымышленное дело → вымышленные отзывы (D32): коллекция `reviews` из `cms/reviews.ts`, блок `DemoReviews` — только текст и подпись «Ирина С.» (подпись другого вида CMS не сохранит); без фото, оценок, названий площадок; в schema.org нет `Review` и `AggregateRating` — звезды несуществующего дела не должны попасть в выдачу. Сторожит `tests/unit/reviews.test.tsx`.
- **Карта** — `MapEmbed` по `business.geo`: до нажатия «Показать карту» ни одного запроса к Яндексу; по нажатию — виджет `yandex.ru/map-widget/v1` (ключ не нужен). С картой политика получает `withYandexMap`.
- **schema.org** — `buildBusinessJsonLd(DEMO)`: тип из `business.schemaType`, адрес, часы, `geo` — из данных демо; `<` в JSON-LD экранируется.
- **Cookie** — уведомление с одной cookie `cookie_notice`; сервер читает ее и вернувшемуся не рендерит уведомление → не мелькает после гидрации.
- **Политика** `/privacy` — общий текст ядра: оператор — студия, дело вымышлено. С `yandexOrgId` страница передает `withYandexReviews`, с картой — `withYandexMap` → абзац о виджете Яндекса (IP посетителя, cookie Яндекса). Черновик до B34/B36.
- **noindex** вне `DEMO_ENV=production`: meta robots, `X-Robots-Tag` на всех ответах (`proxy.ts`), `robots.txt` с `Disallow: /`.
- **Подсказки темы** Payload (Accept-CH, Critical-CH) — только на `/admin` (`next.config.ts`): `withPayload` вешает их на все адреса, а Critical-CH на странице заставляет Chrome повторить первый запрос.

Компоненты ядра берут цвета, радиусы, тени, шрифт только из токенов `--demo-*`. `tests/unit/tokens.test.ts` падает, если в SCSS ядра цвет литералом (hex, `rgb`/`hsl`, именованный), `font-family`, `border-radius` или `box-shadow` не через `var(`, или какое-то демо не задает токен, который ядро использует.

## Разработка

Postgres 18 из `docker-compose.yml` на `127.0.0.1:5435` (не 5432–5434: там базы других проектов): `docker compose -p mrshkn-demos up -d`. Базы: `demos` — разработка шаблона, `demos_<slug>` — разработка демо (`demos_dental`), `demos_test` — интеграционные, `demos_e2e` — Playwright по шаблону. Init-скрипт создает базы только на пустом томе → базу нового демо руками:
`docker exec mrshkn-demos-postgres-1 psql -U demos -d demos -c 'CREATE DATABASE demos_<slug>'`.
Переменные — `apps/<slug>/.env` по образцу `.env.example`. Сборке база не нужна: админка и REST рендерятся на запрос.

Порты: 3300 — `yarn dev` шаблона, 3301 — e2e, 3302 — Lighthouse, 3303 — образ руками, 3304 — `yarn dev` «Клиники», 3305 — ее ручные проверки на production-сборке. Playwright `reuseExistingServer` подхватит чужой сервер на 3301 → перед полным прогоном гасить (или `CI=1`).

`next dev` 16.3 сам пишет в приложение AGENTS.md и CLAUDE.md для ИИ-агентов; выключено в `next.config.ts` (`agentRules: false`), правила репозитория — здесь.

**Миграции.** В production Payload схему не накатывает — ее создают миграции `src/migrations/` каждого демо, при старте через `prodMigrations`, только с `MIGRATE_ON_START=true` (задан в образе и у e2e-сервера). `tests/integration/migrations.test.ts` перебирает все `apps/*`, сравнивает схему конфига демо со снимком его последней миграции: коллекция или поле без миграции роняют сьют.

## Команды

```
yarn dev                               шаблон на 3300
yarn demo:new <slug>                   новое демо
yarn test                              typecheck, lint, format:check, unit, integration, e2e
yarn test:lighthouse [slug]            сборка демо с DEMO_ENV=production и Lighthouse CI (по умолчанию template)
```

Lighthouse CI (`lighthouserc.cjs`):

- Страницы — из `apps/<slug>/lighthouse.json` (у «Клиники» главная, страница врача, страница услуги); без файла — главная и `/privacy`.
- Три прогона после одного прогревочного, `aggregationMethod: 'pessimistic'`: каждая категория (performance, accessibility, best practices, SEO) ≥ 0,9 в каждом прогоне.
- CI-матрица: `ci-probe` (демо, только что развернутое `yarn demo:new ci-probe`: так проверяется сама команда) и демо со своими страницами. У каждого своя база Postgres; схема — миграции при старте (`MIGRATE_ON_START`), контент — засев.
- Локально так же, на чистой базе: `DATABASE_URL=…/demos_dental_e2e PAYLOAD_SECRET=… MIGRATE_ON_START=true yarn test:lighthouse dental`.
- Шаг «CPU class and score of each run» пишет `benchmarkIndex` каждого прогона.

## Тесты: новых e2e не пишем (D37)

Решение Николая 27.09.2026 (D37 в `../PLAN.md`): e2e съедают много времени и токенов. e2e — все, что поднимает приложение и ходит в него браузером или по HTTP: Playwright из `tests/e2e/` и любые запросы к запущенному серверу. Действует в каждом блоке, начатом после решения, и в «Клинике» (с согласия Николая); блок, бывший в работе на момент D37, доводится по своим критериям, как записаны в `../ROADMAP.md`.

- **Авто-пункт ROADMAP** закрывается тем, что записано в критерии: unit/интеграционным тестом, Lighthouse CI, прогоном готовых спеков. Новый тест — только unit или интеграционный: чистые функции; компоненты, отрисованные в строку (`renderToStaticMarkup`, как `tests/unit/components.test.tsx`); обработчик маршрута, вызванный напрямую с `new Request(…)` (как `tests/integration/lead-route.test.ts`); Payload Local API на `demos_test`. Порядок прежний: критерий → тест, падает (RED) → код.
- **Новый файл в `tests/e2e/` или новый `test(…)` в готовом спеке** — нарушение D37 (кроме смоука нового потока, ниже), даже если критерий записан как e2e: такой критерий — вопрос к `/mrshkn-plan`, не повод писать спек. Новое демо своего спека не получает.
- **Смоук нового потока — единственное исключение (D37 изменен 01.10.2026).**
  - Новый обработчик или флоу, через который человек оставляет контакт, записывается или платит, → один e2e «счастливый путь», только если в критериях блока есть пункт «smoke e2e (D37, новый поток)».
  - Один тест на поток, локальная сборка в CI: от входа на страницу до записи в CMS или в локальном приемнике.
  - Telegram, MAX, почта, ЮKassa, Radario — заглушки по образцу `../site/tests/e2e/lead-sink.ts`: секретов и чужой сети в CI нет.
  - Отказы (нет согласия, ловушка, чужая подпись, повтор) смоук не проверяет — их закрывают интеграционные.
  - Кнопка или страница в уже покрытый путь — не новый поток: закрывается строкой в списке или пунктом «(Claude, <способ>)».
  - В `demos` смоук форм задан списком приложений: e2e поднимает не только шаблон, демо с формой заявки входит в список строкой (первыми — «Эксперт» и «Клиника»). Новый поток со своим флоу (запись с оплатой «Эксперта», waitlist «SaaS-лендинга») — свой смоук.
- **Готовые спеки остаются** в `yarn test` и на CI: `tests/e2e/template.spec.ts` проверяет шаблон. Код их сломал → чинить код; ожидание меняется, только если поведение поменялось по критерию блока. Удалять, скипать, ослаблять тест нельзя.
- **Параметрических спеков** (новая страница — строка в списке, а не новый тест) в `demos` нет: список `['/', '/privacy']` в спеке шаблона — страницы самого шаблона, новые демо его не расширяют. Проверка по всем демо сразу — интеграционный тест миграций, сам берет каждое `apps/*`.
- **Пункт «(Claude, <способ>)»** — «(Claude, браузер)», «(Claude, curl)», «(Claude, разовый скрипт)», «(Claude, CLI)» и подобные — Claude проверяет и закрывает сам, без подтверждения Николая; спек после проверки в репозитории не остается.
  - «(Claude, браузер)» — страница целиком в браузере (Playwright MCP, chrome-devtools MCP) или разовым скриптом вне репозитория, на сборке из пункта (dev, локальная production-сборка, stage).
  - Свидетельство в `../ROADMAP.md` — одна строка: команда или адрес и сборка, для браузера — ширины и темы, что увидено или измерено, дата; дефект — что нашлось и чем исправлено.
- Lighthouse CI остается (D4, D28, D29).

## Деплой

Образ один на все демо: `docker build --build-arg APP=<slug> .` собирает `apps/<slug>` в standalone, запускает `node apps/<slug>/server.js` на 3000 с `MIGRATE_ON_START=true`. Переменные при работе: `DATABASE_URL`, `PAYLOAD_SECRET`, `DEMO_ENV` (пусто — noindex), опционально `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`.
Сервер образы не собирает (D41). Пуш в `main` → джобы `apps` и `image` в `ci.yml`: после зеленого `checks` (Lighthouse не ждут) по образу на каждую папку `apps/<slug>` — `ghcr.io/nikolaymurashkin/mrshkn-demo-<slug>:<sha коммита>` (пакеты приватные). Демо со стендом выкатывается: slug → UUID приложения Coolify в переменной репозитория `COOLIFY_APPS` (JSON), джоб ставит приложению тег коммита через API (секрет `COOLIFY_TOKEN`) и ждет `finished`. Демо без строки в `COOLIFY_APPS` только собирается.
Сертификат — общий wildcard `*.mrshkn.com` из Coolify; свой на имя демо не заводить: имя попадет в журнал Certificate Transparency (D24). Работа с сервером — `../docs/ops/coolify.md`, для демо — раздел «Отраслевое демо из `mrshkn-demos`» (приложение Docker Image, `COOLIFY_APPS`, `DEMO_ENV`, имена секретов).

Тесты и Lighthouse CI поднимают демо через `next start` (лог `"next start" does not work with "output: standalone"` безвреден), т.е. сьют проверяет `next start`, а не `node apps/<slug>/server.js` из образа. Поэтому правку `Dockerfile` или `next.config.ts` проверять сборкой и запуском образа руками:
`docker build --build-arg APP=template -t mrshkn-demo-template:local .`, затем
`docker run --rm -p 3303:3000 -e DATABASE_URL=postgres://demos:demos@host.docker.internal:5435/demos
-e PAYLOAD_SECRET=local mrshkn-demo-template:local`.

## Конвенции

- Компоненты — стрелочные функции; тип пропсов `ComponentNameProps` через `type`.
- Константы и типы — в `consts.ts` и `types.ts`, не в файле компонента.
- SCSS без комментариев; медиазапросы только `max-width`; `hyphens: none`.
- Текст из CMS не вылезает из контейнера: `overflow-wrap: anywhere`, `min-width: 0`.
- Prettier: 120 символов, одинарные кавычки, точка с запятой, один атрибут на строку.
- «е» вместо «ё»; после «в», «к», «с», «на», «и» — неразрывный пробел (`&nbsp;` в JSX, ` ` в строках).
- Честность (D14, D15, D32): в демо нет реальных чужих названий, стоковых «сотрудников», выдуманных бизнес-метрик. Отзывы о вымышленном деле вымышлены (D32) и подписаны только общим подвалом демо — по правилам `DemoReviews` выше; у студии, в кейсах и рекламе — только настоящие. Номера лицензий и реквизиты вымышленного дела — нулями в формате реестра, чтобы не совпасть с настоящими.
- Тексты из CMS проходят `typograph` при отрисовке: в базе неразрывных пробелов нет.
