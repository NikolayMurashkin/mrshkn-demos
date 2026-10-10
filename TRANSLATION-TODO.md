# Английские тексты демо: что написано и что ждет вычитки

Английские тексты написаны и ждут вычитки Николая до публикации. Пустой раздел
«Ждет вычитки Николая» — условие публикации демо на английском: `auto.mrshkn.com` не включается, пока здесь есть строки.

## Ждет вычитки Николая

Написано 10.10.2026 (демо «Автосервис», `apps/auto`), носителем языка не проверялось:

| Где                                                                           | Что внутри и на что смотреть                                                                                                                                                                         |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/core/src/texts.ts` → `footer.*`                                     | подпись подвала «Demo project by MRSHKN studio», ссылка «Privacy policy»                                                                                                                             |
| `packages/core/src/texts.ts` → `leadForm.*`                                   | форма заявки: поля, согласие, кнопка, статусы; поле связи в EN — «Phone or email», а не «ник в Telegram»                                                                                             |
| `packages/core/src/texts.ts` → `cookie.*`, `map.*`                            | уведомление о cookie, кнопка карты и подпись «The map is loaded from Yandex Maps»                                                                                                                    |
| `packages/core/src/texts.ts` → `policy.*`                                     | политика целиком: оператор, данные, цели, хранение («server in Russia» — как в русской), cookie, виджеты Яндекса, права; черновик до вычитки юристом, как и русская                                  |
| `apps/auto/src/texts.ts`                                                      | тексты страницы: шапка, «Where does it hurt?», заказ-наряд (Likely cause, Labor, Time, from), разделы Parts and prices, Book a visit, Reviews, Contacts, подпись «The shop and prices are fictional» |
| `apps/auto/src/texts.ts` → `hero.posterAlt`                                   | описание постера для скринридера                                                                                                                                                                     |
| `apps/auto/src/demo.config.ts` → `DEMOS.en`                                   | Phase Garage, Columbus, OH: заголовок и описание для поиска, адрес «1250 Camshaft Ave» (улица вымышлена), телефон нулями                                                                             |
| `apps/auto/src/cms/seed/data.ts` → `NODES[].content.en`, `SYMPTOMS[].text.en` | узлы, причины, сроки (h, min, days), симптомы — по контенту макета направления; цены в долларах рынка США, работа без запчастей                                                                      |
| `apps/auto/src/cms/seed/data.ts` → `REVIEWS[].en`                             | три вымышленных отзыва о вымышленном сервисе с подписями Daniel K., Emily R., Mary-Jane K.                                                                                                           |
