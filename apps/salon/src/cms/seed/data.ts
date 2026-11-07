import type { Master, SeedReview, Service, ServiceCategory } from '../../types';

/**
 * Вымышленный салон: направления — константы кода (из них варианты полей CMS и якоря прайса), мастера, услуги
 * и отзывы засеваются в пустую базу при старте, дальше их правят в админке. Мастера и авторы отзывов вымышлены,
 * цены — правдоподобные «от» для Калининграда.
 */
export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { slug: 'manicure', name: 'Маникюр', text: 'Классический, аппаратный и комбинированный, покрытие гель-лаком.' },
  { slug: 'pedicure', name: 'Педикюр', text: 'Аппаратный педикюр, покрытие гель-лаком, уход за кожей стоп.' },
  { slug: 'brows', name: 'Брови', text: 'Форма под черты лица, окрашивание краской или хной, укладка.' },
  { slug: 'lashes', name: 'Ресницы', text: 'Ламинирование и наращивание — от натурального эффекта до объема.' },
  {
    slug: 'hair',
    name: 'Стрижки и окрашивание',
    text: 'Женские и мужские стрижки, окрашивание в один тон и сложные техники.',
  },
  { slug: 'makeup', name: 'Макияж', text: 'Дневной, вечерний и свадебный — с пробным макияжем заранее.' },
];

export const SERVICES: Service[] = [
  { slug: 'manicure-basic', name: 'Маникюр без покрытия', category: 'manicure', duration: '60 мин', price: 1300 },
  {
    slug: 'manicure-gel',
    name: 'Маникюр с покрытием гель-лаком',
    category: 'manicure',
    duration: '1 ч 45 мин',
    price: 2200,
  },
  { slug: 'nail-extension', name: 'Наращивание ногтей', category: 'manicure', duration: '2 ч 30 мин', price: 3500 },
  { slug: 'gel-removal', name: 'Снятие покрытия', category: 'manicure', duration: '20 мин', price: 400 },
  { slug: 'pedicure-basic', name: 'Педикюр без покрытия', category: 'pedicure', duration: '1 ч 15 мин', price: 1900 },
  { slug: 'pedicure-gel', name: 'Педикюр с покрытием гель-лаком', category: 'pedicure', duration: '2 ч', price: 2800 },
  { slug: 'brow-shape', name: 'Коррекция формы', category: 'brows', duration: '30 мин', price: 800 },
  { slug: 'brow-tint', name: 'Коррекция и окрашивание', category: 'brows', duration: '45 мин', price: 1200 },
  { slug: 'brow-lamination', name: 'Долговременная укладка', category: 'brows', duration: '60 мин', price: 1800 },
  { slug: 'lash-lamination', name: 'Ламинирование', category: 'lashes', duration: '60 мин', price: 2500 },
  { slug: 'lash-classic', name: 'Наращивание, классика', category: 'lashes', duration: '2 ч', price: 3000 },
  { slug: 'lash-2d', name: 'Наращивание, объем 2D', category: 'lashes', duration: '2 ч 30 мин', price: 3600 },
  { slug: 'haircut-women', name: 'Женская стрижка', category: 'hair', duration: '60 мин', price: 2000 },
  { slug: 'haircut-men', name: 'Мужская стрижка', category: 'hair', duration: '45 мин', price: 1400 },
  { slug: 'color-single', name: 'Окрашивание в один тон', category: 'hair', duration: '2 ч', price: 4500 },
  { slug: 'color-complex', name: 'Сложное окрашивание', category: 'hair', duration: '4 ч', price: 8000 },
  { slug: 'makeup-day', name: 'Дневной макияж', category: 'makeup', duration: '45 мин', price: 2500 },
  { slug: 'makeup-evening', name: 'Вечерний макияж', category: 'makeup', duration: '60 мин', price: 3500 },
  {
    slug: 'makeup-wedding',
    name: 'Свадебный макияж с пробным',
    category: 'makeup',
    duration: '2 ч 30 мин',
    price: 6000,
  },
];

export const MASTERS: Master[] = [
  {
    slug: 'alina',
    name: 'Алина Ветрова',
    nameDative: 'Алине',
    role: 'мастер маникюра и педикюра',
    years: 9,
    categories: ['manicure', 'pedicure'],
    photo: 'master-alina',
    about:
      'Девять лет в маникюре. Любит спокойные нюдовые оттенки и аккуратную форму, которая держится три-четыре недели. Перед покрытием всегда спрашивает, как вы носите ногти: от этого зависит форма и длина.',
  },
  {
    slug: 'daria',
    name: 'Дарья Соколова',
    nameDative: 'Дарье',
    role: 'бровист и лэшмейкер',
    years: 6,
    categories: ['brows', 'lashes'],
    photo: 'master-daria',
    about:
      'Подбирает форму бровей по чертам лица, а не по моде. Ресницы наращивает так, чтобы через месяц не было заломов.',
  },
  {
    slug: 'marina',
    name: 'Марина Лебедева',
    nameDative: 'Марине',
    role: 'парикмахер-колорист',
    years: 12,
    categories: ['hair'],
    photo: 'master-marina',
    about:
      'Двенадцать лет в окрашивании. Перед сменой цвета делает пробную прядь и честно говорит, если волосам нужен отдых.',
  },
  {
    slug: 'eva',
    name: 'Ева Ким',
    nameDative: 'Еве',
    role: 'визажист',
    years: 7,
    categories: ['makeup'],
    photo: 'master-eva',
    about: 'Вечерний и свадебный макияж, который выдерживает долгий день и вспышку фотографа.',
  },
  {
    slug: 'olga',
    name: 'Ольга Фролова',
    nameDative: 'Ольге',
    role: 'мастер маникюра',
    years: 4,
    categories: ['manicure'],
    photo: 'master-olga',
    about: 'Аппаратный маникюр и дизайн: френч, втирка, рисунки от руки.',
  },
];

export const REVIEWS: SeedReview[] = [
  {
    text: 'Пришла снять старое покрытие и ушла с идеальным маникюром. Алина подсказала форму, о которой я сама бы не подумала. Держится уже третью неделю.',
    author: 'Ксения Р.',
    subject: 'маникюр',
    master: 'alina',
  },
  {
    text: 'Брови давно не были такими ровными. Дарья все объяснила и не стала делать модную широкую форму — мне она правда не идет.',
    author: 'Олеся М.',
    subject: 'брови',
    master: 'daria',
  },
  {
    text: 'Хотела сменить цвет волос осторожно, без резких перемен. Марина сделала пробную прядь, и только потом мы взялись за всю длину.',
    author: 'Татьяна В.',
    subject: 'окрашивание',
    master: 'marina',
  },
  {
    text: 'Записалась онлайн за минуту, в десять вечера. Утром пришло напоминание, а в салоне меня уже ждали.',
    author: 'Анна Б.',
    subject: 'педикюр',
    master: 'alina',
  },
  {
    text: 'Макияж на свадьбу продержался весь день, на фото кожа без блеска. Пробный макияж за неделю до праздника снял все волнения.',
    author: 'Виктория Л.',
    subject: 'свадебный макияж',
    master: 'eva',
  },
  {
    text: 'Ламинирование ресниц делаю здесь уже полгода. Чисто, уютно, мастер не опаздывает, и цена совпадает с той, что на сайте.',
    author: 'Мария К.',
    subject: 'ресницы',
    master: 'daria',
  },
];
