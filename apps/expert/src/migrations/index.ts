import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261010_212515_expert_content from './20261010_212515_expert_content';
import * as migration_20261102_131652_photo from './20261102_131652_photo';
import * as migration_20261102_150811_reviews_articles from './20261102_150811_reviews_articles';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261010_212515_expert_content.up,
    down: migration_20261010_212515_expert_content.down,
    name: '20261010_212515_expert_content',
  },
  {
    up: migration_20261102_131652_photo.up,
    down: migration_20261102_131652_photo.down,
    name: '20261102_131652_photo',
  },
  {
    up: migration_20261102_150811_reviews_articles.up,
    down: migration_20261102_150811_reviews_articles.down,
    name: '20261102_150811_reviews_articles'
  },
];
