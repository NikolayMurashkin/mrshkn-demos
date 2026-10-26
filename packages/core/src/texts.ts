import { NBSP, STUDIO_NAME } from './consts';
import type { DemoLang } from './types';

export type CoreTexts = {
  footer: {
    /** Подпись «Демо-проект студии»: текст до ссылки и сама ссылка на сайт студии. */
    mark: string;
    /** Содержит `STUDIO_NAME`: подвал выводит имя отдельным `<span translate="no">`, чтобы переводчик браузера его не трогал. */
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
  lowVision: {
    /** Имя значка для скринридера и подсказка. */
    toggle: string;
    /** Видимая подпись рядом со значком. */
    toggleShort: string;
    panel: string;
    fontGroup: string;
    font: Record<'100' | '150' | '200', { label: string; name: string }>;
    schemeGroup: string;
    scheme: Record<'black-on-white' | 'white-on-black' | 'blue-on-lightblue', string>;
    imagesGroup: string;
    images: Record<'on' | 'off', string>;
    exit: string;
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
    /** Абзац о cookie у сайта с версией для слабовидящих: вторая cookie хранит ее настройки. */
    cookieLowVision: string;
    /** Абзац об анкете оценки качества: без имени и контакта, IP — только в памяти сервера. */
    survey: string;
    yandexReviews: string;
    yandexMap: string;
    rightsTitle: string;
    rightsBefore: string;
    rightsAfter: string;
    /** Абзацы политики сайта со списком ожидания: вместо формы заявки — только почта. */
    waitlist: {
      intro: string;
      data: string;
      purpose: string;
      storage: string;
    };
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
    lowVision: {
      toggle: 'Версия для слабовидящих',
      toggleShort: 'Для слабовидящих',
      panel: 'Настройки версии для слабовидящих',
      fontGroup: 'Размер шрифта',
      font: {
        '100': { label: 'A', name: 'A, обычный шрифт' },
        '150': { label: 'A+', name: 'A+, крупный шрифт' },
        '200': { label: 'A++', name: 'A++, очень крупный шрифт' },
      },
      schemeGroup: `Цвета текста и${NBSP}фона`,
      scheme: {
        'black-on-white': `Черным по${NBSP}белому`,
        'white-on-black': `Белым по${NBSP}черному`,
        'blue-on-lightblue': `Синим по${NBSP}голубому`,
      },
      imagesGroup: `Картинки и${NBSP}фото`,
      images: { on: 'Показать', off: 'Скрыть' },
      exit: 'Обычный вид сайта',
    },
    policy: {
      title: 'Политика обработки персональных данных',
      intro: `Это демо-сайт студии ${STUDIO_NAME}: дело, о${NBSP}котором он${NBSP}рассказывает, вымышлено. Заявки с${NBSP}этого сайта получает студия.`,
      operatorTitle: 'Оператор',
      operator: `Мурашкина Вероника Викторовна, плательщик налога на${NBSP}профессиональный доход, ИНН${NBSP}421815967902 (студия ${STUDIO_NAME}),`,
      contact: `Связь${NBSP}—`,
      dataTitle: 'Какие данные собираются',
      data: `Из${NBSP}формы заявки${NBSP}— имя, телефон или ник в${NBSP}Telegram и${NBSP}комментарий, если вы${NBSP}его оставили. Сервер видит IP-адрес и${NBSP}по${NBSP}нему ограничивает частоту заявок; в${NBSP}базе адрес не${NBSP}хранится.`,
      purposeTitle: 'Зачем',
      purpose: `Чтобы ответить на${NBSP}заявку. Рассылок нет. Уведомление о${NBSP}заявке с${NBSP}именем и${NBSP}способом связи приходит студии в${NBSP}Telegram.`,
      storageTitle: 'Где хранятся',
      storage: `На${NBSP}сервере студии в${NBSP}России. Заявка хранится, пока нужна для ответа, и${NBSP}удаляется по${NBSP}вашей просьбе.`,
      cookieTitle: 'Cookie',
      cookie: `Сайт ставит одну cookie: она запоминает, что вы${NBSP}закрыли уведомление о${NBSP}cookie. Тем, кто входит в${NBSP}панель управления сайтом, ставится еще cookie входа. Аналитики и${NBSP}рекламных счетчиков на${NBSP}сайте нет.`,
      cookieLowVision: `Cookie${NBSP}— это маленькие файлы-заметки, которые сайт сохраняет в${NBSP}вашем браузере. Наш сайт сохраняет не${NBSP}больше двух. Первая запоминает, что вы закрыли сообщение о${NBSP}cookie, чтобы оно не${NBSP}появлялось снова. Вторая запоминает настройки версии для слабовидящих (размер шрифта, цвета), если вы ее включали. Тем, кто ведет сайт и${NBSP}входит в${NBSP}панель управления сайтом, ставится еще одна cookie, чтобы не${NBSP}вводить пароль на${NBSP}каждой странице. Программ, которые следят за${NBSP}посетителями для статистики или рекламы, на${NBSP}сайте нет.`,
      survey: `В${NBSP}анкете мы не${NBSP}спрашиваем имя, телефон и${NBSP}почту. Сохраняются только ваши оценки и${NBSP}комментарий. Еще сайт видит IP-адрес${NBSP}— сетевой номер вашего устройства или интернет-подключения. По${NBSP}нему сайт не${NBSP}дает отправить слишком много анкет подряд. IP-адрес хранится только в${NBSP}памяти сервера около 10${NBSP}минут, потом стирается; в${NBSP}базу он не${NBSP}записывается и${NBSP}вместе с${NBSP}анкетой не${NBSP}сохраняется.`,
      yandexReviews: `Отзывы на${NBSP}странице показывает виджет Яндекс Карт. Его загружает Яндекс: он получает ваш IP-адрес и${NBSP}может ставить свои cookie по${NBSP}собственным правилам.`,
      yandexMap: `Карту на${NBSP}странице показывают Яндекс Карты, и${NBSP}загружается она, только когда вы${NBSP}нажмете «Показать карту». После этого Яндекс получает ваш IP-адрес, может ставить свои cookie, показывать внутри карты рекламу и${NBSP}собирать статистику по${NBSP}собственным правилам.`,
      rightsTitle: 'Ваши права',
      rightsBefore: `Напишите на${NBSP}`,
      rightsAfter: `${NBSP}— расскажем, какие данные о${NBSP}вас хранятся, исправим или удалим их.`,
      waitlist: {
        intro: `Это демо-сайт студии ${STUDIO_NAME}: сервис, о${NBSP}котором он${NBSP}рассказывает, вымышлен. Адреса из${NBSP}списка ожидания хранит студия.`,
        data: `Из${NBSP}формы списка ожидания${NBSP}— только адрес почты. Сервер видит IP-адрес и${NBSP}по${NBSP}нему ограничивает частоту отправок; в${NBSP}базе IP-адрес не${NBSP}хранится.`,
        purpose: `Чтобы показать, как работает список ожидания. Сервис вымышлен, поэтому писем на${NBSP}этот адрес не${NBSP}будет. Рассылок нет.`,
        storage: `На${NBSP}сервере студии в${NBSP}России. Адрес хранится, пока работает демо-сайт, и${NBSP}удаляется по${NBSP}вашей просьбе.`,
      },
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
    lowVision: {
      toggle: 'Low vision version',
      toggleShort: 'Low vision',
      panel: 'Low vision settings',
      fontGroup: 'Font size',
      font: {
        '100': { label: 'A', name: 'A, standard font' },
        '150': { label: 'A+', name: 'A+, large font' },
        '200': { label: 'A++', name: 'A++, extra large font' },
      },
      schemeGroup: 'Text and background colors',
      scheme: {
        'black-on-white': 'Black on white',
        'white-on-black': 'White on black',
        'blue-on-lightblue': 'Blue on light blue',
      },
      imagesGroup: 'Images and photos',
      images: { on: 'Show', off: 'Hide' },
      exit: 'Standard version',
    },
    policy: {
      title: 'Privacy policy',
      intro: `This is a demo site by ${STUDIO_NAME} studio: the business it describes is fictional. Requests sent through this site go to the studio.`,
      operatorTitle: 'Who handles your data',
      operator: `Veronika Viktorovna Murashkina, a self-employed professional in Russia trading as ${STUDIO_NAME} studio (taxpayer ID 421815967902),`,
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
      cookieLowVision:
        'Cookies are small note files that a site saves in your browser. Our site saves no more than two. The first remembers that you closed the cookie notice, so it does not appear again. The second remembers your low vision settings (font size, colors) if you turned that version on. People who run the site and sign in to its admin panel also get one more cookie, so they do not have to enter a password on every page. There are no programs on the site that track visitors for statistics or advertising.',
      survey:
        'The survey does not ask for your name, phone number or email. Only your ratings and comment are saved. The site also sees your IP address, the network number of your device or internet connection, and uses it to stop too many surveys being sent in a row. The IP address is kept only in the server’s memory for about 10 minutes and then erased; it is not written to the database and is not saved with the survey.',
      yandexReviews:
        'Reviews on this page are shown by a Yandex Maps widget. It is loaded from Yandex, which receives your IP address and may set its own cookies under its own rules.',
      yandexMap:
        'The map on this page is provided by Yandex Maps and loads only after you click “Show map”. Yandex then receives your IP address and may set its own cookies, show ads inside the map and collect statistics under its own rules.',
      rightsTitle: 'Your rights',
      rightsBefore: 'Email ',
      rightsAfter: ' and we’ll tell you what data we hold about you, and correct or delete it.',
      waitlist: {
        intro: `This is a demo site by ${STUDIO_NAME} studio: the service it describes is fictional. Email addresses from the waitlist are kept by the studio.`,
        data: 'From the waitlist form: your email address only. The server sees your IP address and uses it to limit how often the form can be sent; the IP address is not stored.',
        purpose:
          'To show how a waitlist works. The service is fictional, so no emails will be sent to this address. No newsletters.',
        storage:
          'On the studio’s server in Russia. The address is kept while the demo site is online and is deleted on your request.',
      },
    },
  },
};
