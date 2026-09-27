import { demoUrl, isIndexable, robotsMetadata } from '@mrshkn/demo-core/demo';
import { describe, expect, it } from 'vitest';

describe('окружение демо', () => {
  it('демо живет на одноуровневом поддомене студии', () => {
    expect(demoUrl('dental')).toBe('https://dental.mrshkn.com');
  });

  it.each([undefined, '', 'stand', 'preview', 'Production'])('окружение «%s» закрыто от поиска', (value) => {
    expect(isIndexable(value)).toBe(false);
    expect(robotsMetadata(isIndexable(value))).toEqual({ index: false, follow: false });
  });

  it('открыто поиску только в production', () => {
    expect(isIndexable('production')).toBe(true);
    expect(robotsMetadata(true)).toBeUndefined();
  });
});
