import { NBSP, STUDIO_NAME } from './consts';
import type { DemoLang } from './types';

export type CoreTexts = {
  footer: {
    /** Подпись «Демо-проект студии»: текст до ссылки и сама ссылка на сайт студии. */
    mark: string;
    studio: string;
    policy: string;
  };
  leadForm: {
    name: string;
    contact: string;
    comment: string;
    consent: string;
    consentLink: string;
    submit: string;
    sending: string;
    sent: string;
    invalid: string;
    failed: string;
  };
  cookie: {
    label: string;
    text: string;
    link: string;
    close: string;
  };
  map: {
    show: string;
    note: string;
  };
  policy: {
    title: string;
    intro: string;
    operatorTitle: string;
    operator: string;
    contact: string;
    dataTitle: string;
    data: string;
    purposeTitle: string;
    purpose: string;
    storageTitle: string;
    storage: string;
    cookieTitle: string;
    cookie: string;
    yandexReviews: string;
    yandexMap: string;
    rightsTitle: string;
    rightsBefore: string;
    rightsAfter: string;
  };
};

/**
 * Тексты компонентов ядра. Русские — с неразрывными пробелами после коротких слов и перед тире; английские
 * написаны для международного посетителя и ждут вычитки в `TRANSLATION-TODO.md`.
 */
export const CORE_TEXTS: Record<DemoLang, CoreTexts> = {
  ru: {
    footer: {
      mark: 'Демо-проект',
      studio: `студии ${STUDIO_NAME}`,
      policy: 'Политика обработки данных',
    },
    leadForm: {
      name: 'Имя',
      contact: `Телефон или ник в${NBSP}Telegram`,
      comment: 'Комментарий',
      consent: `Соглашаюсь на${NBSP}обработку персональных данных по${NBSP}`,
      consentLink: 'политике',
      submit: 'Отправить заявку',
      sending: 'Отправляем…',
      sent: `Заявка отправлена. Это демо-сайт: ответит студия ${STUDIO_NAME}.`,
      invalid: `Проверьте имя, способ связи и${NBSP}согласие на${NBSP}обработку данных.`,
      failed: `Не${NBSP}получилось отправить заявку. Попробуйте еще раз через минуту.`,
    },
    cookie: {
      label: 'Уведомление о cookie',
      text: `Мы используем cookie, чтобы сайт работал. Подробнее${NBSP}— в${NBSP}`,
      link: 'политике обработки данных',
      close: 'Понятно',
    },
    map: {
      show: 'Показать карту',
      note: 'Карту загрузят Яндекс Карты',
    },
    policy: {
      title: 'Политика обработки персональных данных',
      intro: `Это демо-сайт студии ${STUDIO_NAME}: дело, о${NBSP}котором он${NBSP}рассказывает, вымышлено. Заявки с${NBSP}этого сайта получает студия.`,
      operatorTitle: 'Оператор',
      operator: `Студия ${STUDIO_NAME},`,
      contact: `Связь${NBSP}—`,
      dataTitle: 'Какие данные собираются',
      data: `Из${NBSP}формы заявки${NBSP}— имя, телефон или ник в${NBSP}Telegram и${NBSP}комментарий, если вы${NBSP}его оставили. Сервер видит IP-адрес и${NBSP}по${NBSP}нему ограничивает частоту заявок; в${NBSP}базе адрес не${NBSP}хранится.`,
      purposeTitle: 'Зачем',
      purpose: `Чтобы ответить на${NBSP}заявку. Рассылок нет. Уведомление о${NBSP}заявке с${NBSP}именем и${NBSP}способом связи приходит студии в${NBSP}Telegram.`,
      storageTitle: 'Где хранятся',
      storage: `На${NBSP}сервере студии в${NBSP}России. Заявка хранится, пока нужна для ответа, и${NBSP}удаляется по${NBSP}вашей просьбе.`,
      cookieTitle: 'Cookie',
      cookie: `Сайт ставит одну cookie: она запоминает, что вы${NBSP}закрыли уведомление о${NBSP}cookie. Тем, кто входит в${NBSP}панель управления сайтом, ставится еще cookie входа. Аналитики и${NBSP}рекламных счетчиков на${NBSP}сайте нет.`,
      yandexReviews: `Отзывы на${NBSP}странице показывает виджет Яндекс Карт. Его загружает Яндекс: он получает ваш IP-адрес и${NBSP}может ставить свои cookie по${NBSP}собственным правилам.`,
      yandexMap: `Карту на${NBSP}странице показывают Яндекс Карты, и${NBSP}загружается она, только когда вы${NBSP}нажмете «Показать карту». После этого Яндекс получает ваш IP-адрес, может ставить свои cookie, показывать внутри карты рекламу и${NBSP}собирать статистику по${NBSP}собственным правилам.`,
      rightsTitle: 'Ваши права',
      rightsBefore: `Напишите на${NBSP}`,
      rightsAfter: `${NBSP}— расскажем, какие данные о${NBSP}вас хранятся, исправим или удалим их.`,
    },
  },
  en: {
    footer: {
      mark: 'Demo project by',
      studio: `${STUDIO_NAME} studio`,
      policy: 'Privacy policy',
    },
    leadForm: {
      name: 'Name',
      contact: 'Phone or email',
      comment: 'Comment',
      consent: 'I agree to the processing of my personal data under the ',
      consentLink: 'privacy policy',
      submit: 'Send request',
      sending: 'Sending…',
      sent: `Request sent. This is a demo site, so ${STUDIO_NAME} studio will get back to you.`,
      invalid: 'Please check your name, contact details and consent to data processing.',
      failed: 'We couldn’t send your request. Please try again in a minute.',
    },
    cookie: {
      label: 'Cookie notice',
      text: 'We use a cookie to make the site work. Learn more in our ',
      link: 'privacy policy',
      close: 'Got it',
    },
    map: {
      show: 'Show map',
      note: 'The map is loaded from Yandex Maps',
    },
    policy: {
      title: 'Privacy policy',
      intro: `This is a demo site by ${STUDIO_NAME} studio: the business it describes is fictional. Requests sent through this site go to the studio.`,
      operatorTitle: 'Who handles your data',
      operator: `${STUDIO_NAME} studio,`,
      contact: 'Contact:',
      dataTitle: 'What we collect',
      data: 'From the request form: your name, phone number or email, and a comment if you leave one. The server sees your IP address and uses it to limit how often requests can be sent; the address is not stored.',
      purposeTitle: 'Why',
      purpose:
        'To reply to your request. No newsletters. The studio gets a notification with your name and contact details in Telegram.',
      storageTitle: 'Where it’s stored',
      storage:
        'On the studio’s server in Russia. A request is kept as long as we need it to reply and is deleted on your request.',
      cookieTitle: 'Cookies',
      cookie:
        'The site sets one cookie: it remembers that you closed the cookie notice. People who sign in to the site’s admin panel also get a sign-in cookie. There are no analytics or advertising trackers on the site.',
      yandexReviews:
        'Reviews on this page are shown by a Yandex Maps widget. It is loaded from Yandex, which receives your IP address and may set its own cookies under its own rules.',
      yandexMap:
        'The map on this page is provided by Yandex Maps and loads only after you click “Show map”. Yandex then receives your IP address and may set its own cookies, show ads inside the map and collect statistics under its own rules.',
      rightsTitle: 'Your rights',
      rightsBefore: 'Email ',
      rightsAfter: ' and we’ll tell you what data we hold about you, and correct or delete it.',
    },
  },
};
