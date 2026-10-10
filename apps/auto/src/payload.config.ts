import { createDemoCmsConfig } from '@mrshkn/demo-core/cms';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { COLLECTIONS } from './cms/collections';
import { LOCALIZATION } from './cms/consts';
import { seedAuto } from './cms/seed/seed';
import { DEMO } from './demo.config';
import { migrations } from './migrations';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default createDemoCmsConfig({
  dirname,
  demo: DEMO,
  migrations,
  collections: COLLECTIONS,
  localization: LOCALIZATION,
  onInit: seedAuto,
});
