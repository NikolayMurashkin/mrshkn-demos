/** @vitest-environment happy-dom */
import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { CookieBanner } from '@mrshkn/demo-core/components/CookieBanner';
import { DemoFooter } from '@mrshkn/demo-core/components/DemoFooter';
import { JsonLd } from '@mrshkn/demo-core/components/JsonLd';
import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { YandexReviews } from '@mrshkn/demo-core/components/YandexReviews';
import { HONEYPOT_FIELD, LEAD_FORM_ID, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

const parse = (markup: string) => {
  const document = new DOMParser().parseFromString(`<body>${markup}</body>`, 'text/html');

  return document.body;
};

describe('подвал демо', () => {
  it('подписан «Демо-проект студии MRSHKN» со ссылкой на mrshkn.com', () => {
    const footer = parse(renderToStaticMarkup(<DemoFooter policyHref={POLICY_HREF} />)).querySelector('footer');

    expect(footer?.textContent?.replace(/\s+/g, ' ')).toContain('Демо-проект студии MRSHKN');
    expect(footer?.querySelector('a[href="https://mrshkn.com"]')?.textContent).toContain('MRSHKN');
  });

  it('ведет на политику обработки данных', () => {
    const footer = parse(renderToStaticMarkup(<DemoFooter policyHref={POLICY_HREF} />));

    expect(footer.querySelector(`a[href="${POLICY_HREF}"]`)).not.toBeNull();
  });

  it('показывает свое содержимое демо над подписью', () => {
    const footer = parse(
      renderToStaticMarkup(
        <DemoFooter policyHref={POLICY_HREF}>
          <p>Адрес клиники</p>
        </DemoFooter>,
      ),
    );

    expect(footer.textContent).toContain('Адрес клиники');
  });
});

describe('кнопка записи', () => {
  it('без Mini App ведет к форме заявки на той же странице', () => {
    const link = parse(
      renderToStaticMarkup(<BookingButton formHref={`#${LEAD_FORM_ID}`}>Записаться</BookingButton>),
    ).querySelector('a');

    expect(link?.getAttribute('href')).toBe(`#${LEAD_FORM_ID}`);
    expect(link?.hasAttribute('target')).toBe(false);
  });

  it('с Mini App открывает deep-link в новой вкладке', () => {
    const url = 'https://t.me/demo_booking_bot?startapp=dental';
    const link = parse(
      renderToStaticMarkup(
        <BookingButton
          formHref={`#${LEAD_FORM_ID}`}
          miniAppUrl={url}
        >
          Записаться
        </BookingButton>,
      ),
    ).querySelector('a');

    expect(link?.getAttribute('href')).toBe(url);
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
  });
});

describe('отзывы с Яндекс Карт', () => {
  it('без организации раздела нет', () => {
    expect(renderToStaticMarkup(<YandexReviews title="Отзывы" />)).toBe('');
  });

  it('с организацией встраивает официальный виджет и ведет на все отзывы', () => {
    const section = parse(
      renderToStaticMarkup(
        <YandexReviews
          orgId="1234567890"
          title="Отзывы"
        />,
      ),
    );
    const frame = section.querySelector('iframe');

    expect(frame?.getAttribute('src')).toBe('https://yandex.ru/maps-reviews-widget/1234567890?comments');
    expect(frame?.getAttribute('loading')).toBe('lazy');
    expect(frame?.getAttribute('title')).toBeTruthy();
    expect(section.querySelector('a[href="https://yandex.ru/maps/org/1234567890/reviews/"]')).not.toBeNull();
  });

  it('номер организации не из цифр — ошибка конфигурации, а не молча пустой раздел', () => {
    expect(() =>
      renderToStaticMarkup(
        <YandexReviews
          orgId="1234?x=<script>"
          title="Отзывы"
        />,
      ),
    ).toThrow(/yandexOrgId/);
  });
});

describe('разметка schema.org', () => {
  it('кладет JSON-LD в script и экранирует закрывающий тег', () => {
    const markup = renderToStaticMarkup(<JsonLd data={{ '@type': 'LocalBusiness', name: '</script><b>x</b>' }} />);
    const script = parse(markup).querySelector('script[type="application/ld+json"]');

    expect(markup).not.toContain('</script><b>');
    expect(JSON.parse(script?.textContent ?? '')).toEqual({ '@type': 'LocalBusiness', name: '</script><b>x</b>' });
  });
});

describe('уведомление о cookie', () => {
  it('показывается, пока человек его не закрыл, и ведет на политику', () => {
    const region = parse(
      renderToStaticMarkup(
        <CookieBanner
          initiallyVisible
          policyHref={POLICY_HREF}
        />,
      ),
    );

    expect(region.querySelector(`a[href="${POLICY_HREF}"]`)).not.toBeNull();
    expect(region.querySelector('button')?.textContent).toBeTruthy();
  });

  it('после закрытия не показывается', () => {
    expect(
      renderToStaticMarkup(
        <CookieBanner
          initiallyVisible={false}
          policyHref={POLICY_HREF}
        />,
      ),
    ).toBe('');
  });
});

describe('форма заявки', () => {
  const form = () => parse(renderToStaticMarkup(<LeadForm policyHref={POLICY_HREF} />)).querySelector('form');

  it('спрашивает имя и способ связи, комментарий необязателен', () => {
    expect(form()?.querySelector('input[name="name"]')?.hasAttribute('required')).toBe(true);
    expect(form()?.querySelector('input[name="contact"]')?.hasAttribute('required')).toBe(true);
    expect(form()?.querySelector('textarea[name="comment"]')?.hasAttribute('required')).toBe(false);
  });

  it('без согласия на обработку данных не отправляется, согласие ведет на политику', () => {
    const consent = form()?.querySelector('input[name="consent"]');

    expect(consent?.getAttribute('type')).toBe('checkbox');
    expect(consent?.hasAttribute('required')).toBe(true);
    expect(form()?.querySelector(`a[href="${POLICY_HREF}"]`)).not.toBeNull();
  });

  it('у каждого поля есть подпись', () => {
    const fields = [...(form()?.querySelectorAll('input:not([type="hidden"]), textarea') ?? [])].filter(
      (field) => field.getAttribute('name') !== HONEYPOT_FIELD,
    );

    expect(fields.map((field) => field.getAttribute('name'))).toEqual(['name', 'contact', 'comment', 'consent']);

    for (const field of fields) {
      const id = field.getAttribute('id');

      expect(id, field.getAttribute('name') ?? '').toBeTruthy();
      expect(form()?.querySelector(`label[for="${id}"]`), field.getAttribute('name') ?? '').not.toBeNull();
    }
  });

  it('поле-приманка скрыто от человека и от скринридера', () => {
    const trap = form()?.querySelector(`input[name="${HONEYPOT_FIELD}"]`);

    expect(trap?.getAttribute('tabindex')).toBe('-1');
    expect(trap?.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
