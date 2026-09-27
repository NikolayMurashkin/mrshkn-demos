import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20260927_114253_clinic_content from './20260927_114253_clinic_content';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20260927_114253_clinic_content.up,
    down: migration_20260927_114253_clinic_content.down,
    name: '20260927_114253_clinic_content'
  },
];
