import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261010_163511_auto_content from './20261010_163511_auto_content';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261010_163511_auto_content.up,
    down: migration_20261010_163511_auto_content.down,
    name: '20261010_163511_auto_content'
  },
];
