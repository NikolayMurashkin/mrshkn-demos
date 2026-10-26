import config from '@payload-config';
import { createSurveyRoute } from '@mrshkn/demo-core/survey-route';
import { DEMO } from '@/demo.config';

export const POST = createSurveyRoute({ config, demo: DEMO });
