import config from '@payload-config';
import { createWaitlistRoute } from '@/waitlist/route';

export const POST = createWaitlistRoute({ config });
