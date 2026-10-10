import { postgresAdapter } from '@payloadcms/db-postgres';
import { ru } from '@payloadcms/translations/languages/ru';
import path from 'node:path';
import { buildConfig, type CollectionConfig, type Config, type Payload } from 'payload';
import { Leads, Users } from './cms/collections';
import type { DemoConfig } from './types';

type ProdMigrations = NonNullable<Parameters<typeof postgresAdapter>[0]['prodMigrations']>;

type DemoCmsOptions = {
  /** Каталог `src` демо: там лежат `migrations/`, `payload-types.ts` и карта импортов админки. */
  dirname: string;
  demo: DemoConfig;
  migrations: ProdMigrations;
  /** Коллекции конкретного демо: врачи, меню, статьи. Пользователи и заявки есть у всех. */
  collections?: CollectionConfig[];
  /** Запускается после подключения к базе и миграций: демо засевает здесь свой вымышленный контент. */
  onInit?: (payload: Payload) => Promise<void>;
  /** Языки контента двуязычного демо; без них поля CMS одноязычные, как у шаблона. */
  localization?: Config['localization'];
};

export const createDemoCmsConfig = ({
  dirname,
  demo,
  migrations,
  collections = [],
  onInit,
  localization,
}: DemoCmsOptions) =>
  buildConfig({
    admin: {
      user: Users.slug,
      importMap: { baseDir: dirname },
      meta: { titleSuffix: ` · ${demo.title}, CMS` },
    },
    collections: [Users, Leads, ...collections],
    db: postgresAdapter({
      pool: { connectionString: process.env.DATABASE_URL },
      migrationDir: path.resolve(dirname, 'migrations'),
      // Только у баз, которые ведутся миграциями: стенд (флаг задан в образе) и e2e. Базу разработки
      // создает push режима разработки, и на ней Payload спросил бы в терминале, можно ли терять данные.
      prodMigrations: process.env.MIGRATE_ON_START === 'true' ? migrations : undefined,
    }),
    graphQL: { disable: true },
    i18n: { fallbackLanguage: 'ru', supportedLanguages: { ru } },
    ...(localization && { localization }),
    onInit,
    secret: process.env.PAYLOAD_SECRET ?? '',
    telemetry: false,
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  });
