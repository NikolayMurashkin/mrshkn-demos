import type { SanitizedConfig } from 'payload';

export type WaitlistReason = 'honeypot' | 'consent' | 'email';

export type WaitlistErrorKind = 'email' | 'consent' | 'rate' | 'failed';

export type WaitlistParseResult = { ok: true; email: string } | { ok: false; reason: WaitlistReason };

export type WaitlistRouteOptions = { config: Promise<SanitizedConfig> | SanitizedConfig };
