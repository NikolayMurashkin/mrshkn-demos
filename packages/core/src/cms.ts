import { postgresAdapter } from '@payloadcms/db-postgres';
import { ru } from '@payloadcms/translations/languages/ru';
import path from 'node:path';
import { buildConfig, type CollectionConfig } from 'payload';
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
};

export const createDemoCmsConfig = ({ dirname, demo, migrations, collections = [] }: DemoCmsOptions) =>
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
    secret: process.env.PAYLOAD_SECRET ?? '',
    telemetry: false,
    typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  });
