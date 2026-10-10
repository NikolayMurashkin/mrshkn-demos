import { createReviews } from '@mrshkn/demo-core/cms/reviews';
import { Nodes } from './Nodes';
import { Symptoms } from './Symptoms';

export const COLLECTIONS = [Nodes, Symptoms, createReviews({ localized: true })];
