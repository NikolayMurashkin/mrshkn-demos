import config from '@payload-config';
import { createLeadRoute } from '@mrshkn/demo-core/lead-route';
import { DEMO } from '@/demo.config';

export const POST = createLeadRoute({ config, demo: DEMO });
