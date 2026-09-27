import { buildBusinessJsonLd } from '@mrshkn/demo-core/schema';
import { describe, expect, it } from 'vitest';
import { DEMO } from '../../apps/dental/src/demo.config';

/** Часы в формате schema.org: день или диапазон дней, пробел, время с и по. */
const OPENING_HOURS = /^(Mo|Tu|We|Th|Fr|Sa|Su)(-(Mo|Tu|We|Th|Fr|Sa|Su))? \d{2}:\d{2}-\d{2}:\d{2}$/;

describe('демо «Клиника»: разметка schema.org', () => {
  it('JSON-LD клиники — Dentist или MedicalClinic на поддомене демо', () => {
    const data = buildBusinessJsonLd(DEMO);

    expect(['Dentist', 'MedicalClinic']).toContain(data['@type']);
    expect(data.url).toBe('https://dental.mrshkn.com');
    expect(data.name).toBe(DEMO.business.name);
  });

  it('содержит адрес клиники из данных демо', () => {
    const { address } = DEMO.business;

    expect(address?.streetAddress).toBeTruthy();
    expect(address?.addressLocality).toBeTruthy();
    expect(buildBusinessJsonLd(DEMO).address).toEqual({ '@type': 'PostalAddress', ...address });
  });

  it('содержит часы работы в формате schema.org', () => {
    const { openingHours } = buildBusinessJsonLd(DEMO) as { openingHours?: string[] };

    expect(openingHours?.length).toBeGreaterThan(0);
    expect(openingHours).toEqual(DEMO.business.openingHours);

    for (const hours of openingHours ?? []) {
      expect(hours).toMatch(OPENING_HOURS);
    }
  });
});
