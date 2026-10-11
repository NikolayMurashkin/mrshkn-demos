import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261010_212515_expert_content from './20261010_212515_expert_content';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261010_212515_expert_content.up,
    down: migration_20261010_212515_expert_content.down,
    name: '20261010_212515_expert_content'
  },
];
