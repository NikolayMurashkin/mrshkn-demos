import { Client } from 'pg';

/**
 * База приложения e2e создается до старта сервера, если ее нет: init-скрипт контейнера разработки создает базы
 * только на пустом томе, а на CI сервис Postgres знает лишь `demos_test`. Схему затем накатывают миграции.
 */
const url = new URL(process.env.DATABASE_URL ?? '');
const database = decodeURIComponent(url.pathname.slice(1));

if (!database.endsWith('_e2e')) {
  throw new Error(`e2e создает только свои базы, а ${database || 'пустое имя'} не кончается на _e2e`);
}

url.pathname = '/postgres';

const client = new Client({ connectionString: url.toString() });

await client.connect();

const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database]);

if (!rowCount) {
  await client.query(`CREATE DATABASE "${database.replaceAll('"', '""')}"`);
}

await client.end();
