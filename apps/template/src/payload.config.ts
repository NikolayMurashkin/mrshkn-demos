import { createDemoCmsConfig } from '@mrshkn/demo-core/cms';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEMO } from './demo.config';
import { migrations } from './migrations';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default createDemoCmsConfig({ dirname, demo: DEMO, migrations });
