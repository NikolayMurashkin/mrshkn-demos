/** @vitest-environment happy-dom */
import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const TG = 'https://t.me/demo_booking_bot';

const MAX = 'https://max.ru/demo_booking_bot?startapp';

const FORM_HREF = `#${LEAD_FORM_ID}`;

const TG_LABEL = 'Записаться в Telegram';

const MAX_LABEL = 'Записаться в MAX';

/** Ссылки кнопки — соседи верхнего уровня: hero и головка страницы стилизуют `.actions > a`, обертка сломала бы раскладку. */
const render = (element: ReactElement) => {
  const root = new DOMParser().parseFromString(`<body>${renderToStaticMarkup(element)}</body>`, 'text/html').body;

  return {
    anchors: [...root.querySelectorAll('a')],
    topLevel: [...root.children].filter((child) => child.tagName === 'A'),
  };
};

/** `rel` — набором токенов: порядок и лишние пробелы не важны, лишний или недостающий токен важен. */
const relOf = (anchor: Element | undefined) =>
  new Set((anchor?.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));

const SAFE_REL = new Set(['noopener', 'noreferrer']);

/** Вторая ссылка — Mini App в MAX: этот адрес, новая вкладка, без доступа к окну сайта, подпись из `maxLabel`. */
const expectMaxLink = (anchor: Element | undefined) => {
  expect(anchor?.getAttribute('href')).toBe(MAX);
  expect(anchor?.getAttribute('target')).toBe('_blank');
  expect(relOf(anchor)).toEqual(SAFE_REL);
  expect(anchor?.textContent).toBe(MAX_LABEL);
};

describe('кнопка записи: вторая ссылка — Mini App в MAX', () => {
  it('M1: с Telegram и MAX — две ссылки верхнего уровня, вторая ведет в MAX в новой вкладке', () => {
    const { anchors, topLevel } = render(
      <BookingButton
        formHref={FORM_HREF}
        miniAppUrl={TG}
        maxAppUrl={MAX}
        maxLabel={MAX_LABEL}
      >
        {TG_LABEL}
      </BookingButton>,
    );

    expect(anchors).toHaveLength(2);
    expect(topLevel, 'обе ссылки — прямые дети корня, без обертки').toHaveLength(2);

    const [telegram, max] = anchors;

    expect(telegram?.getAttribute('href')).toBe(TG);
    expect(telegram?.getAttribute('target')).toBe('_blank');
    expectMaxLink(max);
  });

  it('M2: с MAX без Telegram — первая ссылка ведет к форме на странице, вторая — в MAX', () => {
    const { anchors } = render(
      <BookingButton
        formHref={FORM_HREF}
        maxAppUrl={MAX}
        maxLabel={MAX_LABEL}
      >
        {TG_LABEL}
      </BookingButton>,
    );

    expect(anchors).toHaveLength(2);

    const [form, max] = anchors;

    expect(form?.getAttribute('href')).toBe(FORM_HREF);
    expect(form?.hasAttribute('target')).toBe(false);
    expectMaxLink(max);
  });

  it('M3: только Telegram — одна ссылка в Telegram, ссылок на max.ru нет', () => {
    const { anchors } = render(
      <BookingButton
        formHref={FORM_HREF}
        miniAppUrl={TG}
      >
        {TG_LABEL}
      </BookingButton>,
    );

    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.getAttribute('href')).toBe(TG);
    expect(anchors[0]?.getAttribute('target')).toBe('_blank');
    expect(relOf(anchors[0])).toEqual(SAFE_REL);
    expect(anchors.filter((anchor) => anchor.getAttribute('href')?.startsWith('https://max.ru'))).toEqual([]);
  });

  it('M4: без Telegram и MAX — одна ссылка к форме на странице, без новой вкладки', () => {
    const { anchors } = render(<BookingButton formHref={FORM_HREF}>{TG_LABEL}</BookingButton>);

    expect(anchors).toHaveLength(1);
    expect(anchors[0]?.getAttribute('href')).toBe(FORM_HREF);
    expect(anchors[0]?.hasAttribute('target')).toBe(false);
  });
});
