import config from '@payload-config';
import { createBookingRoute } from '@/payment/booking-route';

export const POST = createBookingRoute({ config });
