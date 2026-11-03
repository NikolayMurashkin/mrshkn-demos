import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20261010_223750_menu from './20261010_223750_menu';
import * as migration_20261102_131655_photo from './20261102_131655_photo';
import * as migration_20261102_163818_photo_backfill from './20261102_163818_photo_backfill';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20261010_223750_menu.up,
    down: migration_20261010_223750_menu.down,
    name: '20261010_223750_menu',
  },
  {
    up: migration_20261102_131655_photo.up,
    down: migration_20261102_131655_photo.down,
    name: '20261102_131655_photo',
  },
  {
    up: migration_20261102_163818_photo_backfill.up,
    down: migration_20261102_163818_photo_backfill.down,
    name: '20261102_163818_photo_backfill'
  },
];
