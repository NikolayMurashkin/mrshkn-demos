import { STUDIO_EMAIL, STUDIO_URL } from '../../consts';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang } from '../../types';
import styles from './PrivacyPolicy.module.scss';

type PrivacyPolicyProps = {
  /** На сайте есть виджет отзывов Яндекс Карт: его загружает Яндекс, и политика должна об этом сказать. */
  withYandexReviews: boolean;
  /** На сайте есть карта Яндекса, которая грузится по нажатию «Показать карту». */
  withYandexMap?: boolean;
  lang?: DemoLang;
};

/**
 * Общая для всех демо политика: дело в демо вымышлено, а заявки с формы получает студия. Текст — черновик
 * до пакета документов студии и вычитки юристом.
 */
export const PrivacyPolicy = ({ withYandexReviews, withYandexMap = false, lang = 'ru' }: PrivacyPolicyProps) => {
  const texts = CORE_TEXTS[lang].policy;

  return (
    <article className={styles.policy}>
      <h1>{texts.title}</h1>
      <p>{texts.intro}</p>
      <h2>{texts.operatorTitle}</h2>
      <p>
        {texts.operator} <a href={STUDIO_URL}>mrshkn.com</a>. {texts.contact}{' '}
        <a href={`mailto:${STUDIO_EMAIL}`}>{STUDIO_EMAIL}</a>.
      </p>
      <h2>{texts.dataTitle}</h2>
      <p>{texts.data}</p>
      <h2>{texts.purposeTitle}</h2>
      <p>{texts.purpose}</p>
      <h2>{texts.storageTitle}</h2>
      <p>{texts.storage}</p>
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
