declare module '@payload-config' {
  import type { SanitizedConfig } from 'payload';

  const config: Promise<SanitizedConfig>;

  export default config;
}
