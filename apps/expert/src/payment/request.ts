const firstOf = (value: string | null) => value?.split(',')[0]?.trim() || '';

/** Адрес для лимита: последний в `x-forwarded-for` — его дописывает наш прокси, первый присылает сам клиент. */
export const addressOf = (request: Request) =>
  request.headers
    .get('x-forwarded-for')
    ?.split(',')
    .map((address) => address.trim())
    .filter(Boolean)
    .at(-1) ||
  request.headers.get('x-real-ip') ||
  'unknown';

/**
 * Адрес демо, на который ЮKassa вернет после оплаты: за прокси Coolify — из `x-forwarded-host` и `x-forwarded-proto`,
 * локально — из `host` (в e2e `http://localhost:3309`), без заголовков — из адреса запроса.
 */
export const originOf = (request: Request) => {
  const url = new URL(request.url);
  const host = firstOf(request.headers.get('x-forwarded-host')) || firstOf(request.headers.get('host')) || url.host;
  const protocol = firstOf(request.headers.get('x-forwarded-proto')) || url.protocol.replace(/:$/, '');

  return `${protocol}://${host}`;
};
