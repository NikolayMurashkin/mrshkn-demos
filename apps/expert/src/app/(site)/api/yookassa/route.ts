import config from '@payload-config';
import { createYookassaWebhookRoute } from '@/payment/webhook-route';

export const POST = createYookassaWebhookRoute({ config });
