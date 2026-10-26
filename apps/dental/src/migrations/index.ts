import * as migration_20260926_195027_initial from './20260926_195027_initial';
import * as migration_20260927_114253_clinic_content from './20260927_114253_clinic_content';
import * as migration_20261026_125503_doctor_documents_surveys from './20261026_125503_doctor_documents_surveys';

export const migrations = [
  {
    up: migration_20260926_195027_initial.up,
    down: migration_20260926_195027_initial.down,
    name: '20260926_195027_initial',
  },
  {
    up: migration_20260927_114253_clinic_content.up,
    down: migration_20260927_114253_clinic_content.down,
    name: '20260927_114253_clinic_content',
  },
  {
    up: migration_20261026_125503_doctor_documents_surveys.up,
    down: migration_20261026_125503_doctor_documents_surveys.down,
    name: '20261026_125503_doctor_documents_surveys'
  },
];
