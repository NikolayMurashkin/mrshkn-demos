# Английские тексты демо: что написано и что ждет вычитки

Английские тексты написаны и ждут вычитки Николая до публикации. Пустой раздел
«Ждет вычитки Николая» — условие публикации демо на английском: `auto.mrshkn.com` не включается, пока здесь есть строки.

## Ждет вычитки Николая

Написано 26.10.2026 (ядро, версия для слабовидящих и анкета «Клиники»). `auto` эти строки не показывает: панель
и значок подключает только `dental` (на русском), абзацы политики включаются пропсами `withLowVision`, `withSurvey`.

| Где                                                     | Что внутри и на что смотреть                                                                                                                       |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/texts.ts` → `lowVision.*`            | значок «Low vision version» / «Low vision», панель: «Font size» (имена кнопок — строкой ниже), цвета схем, «Images and photos», «Standard version» |
| `packages/core/src/texts.ts` → `policy.cookieLowVision` | абзац о двух cookie (уведомление и настройки версии для слабовидящих) — перевод русского абзаца                                                    |
| `packages/core/src/texts.ts` → `policy.survey`          | абзац об анонимной анкете и IP-адресе в памяти сервера около 10 минут                                                                              |
| `packages/core/src/texts.ts` → `lowVision.font.*.name`  | имя кнопки шрифта начинается с видимой подписи (WCAG 2.5.3): «A, standard font», «A+, large font», «A++, extra large font»                         |

Написано 02.11.2026 (демо «Концерт», `apps/event`). Тексты страницы — из тест-плана, утверждены Николаем вместе с русскими;
подписи кадров написал исполнитель.

| Где                                                     | Что внутри и на что смотреть                                                                                     |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/event/src/texts.ts` → `TEXTS.en`                  | страница концерта: Slow Tide, Pier 9 club, программа (6 pm … 9:30 pm), билеты (Balcony, Stalls, Front rows), FAQ |
| `apps/event/src/texts.ts` → `*.posterAlt`, `*.photoAlt` | описания кадров афиши, квартета и зала для скринридера                                                           |
| `apps/event/src/texts.ts` → `gallery.alts`              | описания шести кадров галереи «From past concerts»                                                               |
| `apps/event/src/demo.config.ts` → `DEMOS.en`            | адрес клуба для schema.org: «Oktyabrskaya St», Kaliningrad — без номера дома                                     |

Написано 03.11.2026 (демо «Концерт», тексты версий 3 и 4 — утверждены Николаем вместе с русскими; en версии 4 — перевод
сессии).

| Где                                                                    | Что внутри и на что смотреть                                                                                          |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `apps/event/src/texts.ts` → `en.hero.kicker`, `en.hero.lead`           | «Jazz in Kaliningrad · 12+»; лид «well-known jazz and its own music, Lights on the Water»                             |
| `apps/event/src/texts.ts` → `en.hero.plateNote`                        | «the buttons lead to all Kaliningrad events on Yandex Afisha»                                                         |
| `apps/event/src/texts.ts` → `en.program.items[3]`                      | «second set: Lights on the Water, music the quartet wrote itself»                                                     |
| `apps/event/src/texts.ts` → `en.venue.address`, `en.venue.addressNote` | адрес без номера дома; строка под ним «The address and the map pin are only an example: …»                            |
| `apps/event/src/texts.ts` → `en.tickets.items.front.text`              | место по номеру в первых рядах                                                                                        |
| `apps/event/src/texts.ts` → `en.tickets.note`                          | концерт вымышленный → кнопка открывает Калининград на Афише; на сайте настоящего — страницу концерта                  |
| `apps/event/src/texts.ts` → `en.faq.items[2].a`                        | возврат: за 10 дней и раньше — вся цена без сервисного сбора, позже — часть, меньше 3 дней — может ничего             |
| `apps/event/src/texts.ts` → `en.finale.note`                           | строка под кнопкой финальной плиты: «from ₽1,500 · the concert is fictional, so the button opens…»                    |
| `packages/core/src/texts.ts` → `en.policy.none.*`                      | политика сайта без форм (`event`, 05.11.2026): «no fields», данные не собираются, IP не записывается, свой абзац прав |

Строки ниже Николай вычитал 16.10.2026, перед публикацией `auto.mrshkn.com`.

## Вычитано Николаем 16.10.2026

Написано 10.10.2026 (демо «Автосервис», `apps/auto`):

| Где                                                                           | Что внутри и на что смотреть                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/texts.ts` → `footer.*`                                     | подпись подвала «Demo project by MRSHKN studio», ссылка «Privacy policy»                                                                                                                             |
| `packages/core/src/texts.ts` → `leadForm.*`                                   | форма заявки: поля, согласие, кнопка, статусы; поле связи в EN — «Phone or email», а не «ник в Telegram»                                                                                             |
| `packages/core/src/texts.ts` → `cookie.*`, `map.*`                            | уведомление о cookie, кнопка карты и подпись «The map is loaded from Yandex Maps»                                                                                                                    |
| `packages/core/src/texts.ts` → `policy.*`                                     | политика целиком: оператор, данные, цели, хранение («server in Russia» — как в русской), cookie, виджеты Яндекса, права; черновик до вычитки юристом, как и русская                                  |
| `packages/core/src/texts.ts` → `policy.waitlist.*`                            | политика демо со списком ожидания (`launch`, написано 12.10.2026): почта, цель «показать работу списка», хранение, пока работает демо                                                                |
| `apps/auto/src/texts.ts`                                                      | тексты страницы: шапка, «Where does it hurt?», заказ-наряд (Likely cause, Labor, Time, from), разделы Parts and prices, Book a visit, Reviews, Contacts, подпись «The shop and prices are fictional» |
| `apps/auto/src/texts.ts` → `hero.posterAlt`, `hero.sceneLabel`                | описание постера и подпись 3D-сцены для скринридера                                                                                                                                                  |
| `apps/auto/src/texts.ts` → `scene.*`, `explain.*`                             | подсказка и загрузка 3D-сцены, объяснялки подвески и цепи ГРМ (заголовки, ползунки, выводы, состояния цепи) — по контенту макета направления                                                         |
| `apps/auto/src/demo.config.ts` → `DEMOS.en`                                   | Phase Garage, Columbus, OH: заголовок и описание для поиска, адрес «1250 Camshaft Ave» (улица вымышлена), телефон нулями                                                                             |
| `apps/auto/src/cms/seed/data.ts` → `NODES[].content.en`, `SYMPTOMS[].text.en` | узлы, причины, сроки (h, min, days), симптомы — по контенту макета направления; цены в долларах рынка США, работа без запчастей                                                                      |
| `apps/auto/src/cms/seed/data.ts` → `REVIEWS[].en`                             | три вымышленных отзыва о вымышленном сервисе с подписями Daniel K., Emily R., Mary-Jane K.                                                                                                           |
