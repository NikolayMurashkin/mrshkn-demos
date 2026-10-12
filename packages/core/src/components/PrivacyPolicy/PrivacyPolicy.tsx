import { STUDIO_EMAIL, STUDIO_URL } from '../../consts';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang, PolicyForm } from '../../types';
import styles from './PrivacyPolicy.module.scss';

type PrivacyPolicyProps = {
  /** На сайте есть виджет отзывов Яндекс Карт: его загружает Яндекс, и политика должна об этом сказать. */
  withYandexReviews: boolean;
  /** На сайте есть карта Яндекса, которая грузится по нажатию «Показать карту». */
  withYandexMap?: boolean;
  /** Какая форма сайта собирает данные: заявка (имя и способ связи) или список ожидания (только почта). */
  form?: PolicyForm;
  lang?: DemoLang;
};

/**
 * Общая для всех демо политика: дело в демо вымышлено, а данные с формы сайта — заявки или адреса списка
 * ожидания — получает студия. Абзацы о данных, цели и хранении зависят от формы. Текст — черновик до пакета
 * документов студии и вычитки юристом.
 */
export const PrivacyPolicy = ({
  withYandexReviews,
  withYandexMap = false,
  form = 'lead',
  lang = 'ru',
}: PrivacyPolicyProps) => {
  const texts = CORE_TEXTS[lang].policy;
  const formTexts = form === 'waitlist' ? texts.waitlist : texts;

  return (
    <article className={styles.policy}>
      <h1>{texts.title}</h1>
      <p>{formTexts.intro}</p>
      <h2>{texts.operatorTitle}</h2>
      <p>
        {texts.operator} <a href={STUDIO_URL}>mrshkn.com</a>. {texts.contact}{' '}
        <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>.
      </p>
      <h2>{texts.dataTitle}</h2>
      <p>{formTexts.data}</p>
      <h2>{texts.purposeTitle}</h2>
      <p>{formTexts.purpose}</p>
      <h2>{texts.storageTitle}</h2>
      <p>{formTexts.storage}</p>
      <h2>{texts.cookieTitle}</h2>
      <p>{texts.cookie}</p>
      {withYandexReviews && <p>{texts.yandexReviews}</p>}
      {withYandexMap && <p>{texts.yandexMap}</p>}
      <h2>{texts.rightsTitle}</h2>
      <p>
        {texts.rightsBefore}
        <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>
        {texts.rightsAfter}
      </p>
    </article>
  );
};
