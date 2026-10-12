import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261012_082137_waitlist from './20261012_082137_waitlist';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261012_082137_waitlist.up,
    down: migration_20261012_082137_waitlist.down,
    name: '20261012_082137_waitlist'
  },
];
