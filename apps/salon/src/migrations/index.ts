import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261107_093006_salon from './20261107_093006_salon';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261107_093006_salon.up,
    down: migration_20261107_093006_salon.down,
    name: '20261107_093006_salon'
  },
];
