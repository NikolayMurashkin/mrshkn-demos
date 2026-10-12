export const WAITLIST_ENDPOINT = '/api/waitlist';

/** Предел длины адреса почты по RFC 5321: длиннее почтовый сервер не примет. */
export const WAITLIST_EMAIL_MAX_LENGTH = 254;

/** Одна `@`, обе части непустые, в домене точка, пробелов нет: проверка вида, а не существования ящика. */
export const WAITLIST_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
