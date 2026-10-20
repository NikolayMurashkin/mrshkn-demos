import config from '@payload-config';
import { getPayload } from 'payload';

/**
 * Миграции (`MIGRATE_ON_START`) применяются до первого посетителя, задачи по расписанию идут без запросов — их cron
 * Payload запускает только при `cron: true`. Подъем упал — выход с ненулевым кодом: хостинг не пустит трафик
 * на контейнер без базы и оставит прежний.
 */
export const startPayload = async () => {
  try {
    await getPayload({ config, cron: true });
  } catch (error) {
    console.error('Payload не поднялся при старте демо:', error);
    process.exit(1);
  }
};
