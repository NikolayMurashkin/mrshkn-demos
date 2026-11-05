import { demoRobots } from '@mrshkn/demo-core/proxy';
import type { MetadataRoute } from 'next';

// без этого robots.txt собрался бы один раз при сборке, и окружение стенда на него бы не влияло
export const dynamic = 'force-dynamic';

const robots = (): MetadataRoute.Robots => demoRobots();

export default robots;
