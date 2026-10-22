import type { MenuItem, MenuOption } from '../../types';

/**
 * Вымышленное меню кофейни. Категории и признаки — константы кода: из них же варианты полей CMS и сверка slug
 * в адресе фильтра. Позиции засеваются в пустую базу при старте, дальше их правят в админке.
 */
export const MENU_CATEGORIES: MenuOption[] = [
  { slug: 'coffee', name: 'Кофе' },
  { slug: 'tea', name: 'Чай и не кофе' },
  { slug: 'bakery', name: 'Выпечка' },
  { slug: 'breakfast', name: 'Завтраки' },
];

export const MENU_TAGS: MenuOption[] = [
  { slug: 'oat', name: 'На растительном молоке' },
  { slug: 'no-sugar', name: 'Без сахара' },
  { slug: 'vegan', name: 'Веганское' },
  { slug: 'decaf', name: 'Без кофеина' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    slug: 'espresso',
    name: 'Эспрессо',
    description: '60 мл, двойной',
    price: 160,
    category: 'coffee',
    tags: ['no-sugar'],
  },
  { slug: 'americano', name: 'Американо', description: '300 мл', price: 190, category: 'coffee', tags: ['no-sugar'] },
  { slug: 'cappuccino', name: 'Капучино', description: '250 мл', price: 260, category: 'coffee', tags: [] },
  {
    slug: 'flat-white',
    name: 'Флэт уайт',
    description: '200 мл, двойной эспрессо',
    price: 290,
    category: 'coffee',
    tags: [],
  },
  {
    slug: 'oat-latte',
    name: 'Латте на овсяном',
    description: 'овсяное молоко, 300 мл',
    price: 300,
    category: 'coffee',
    tags: ['oat', 'vegan'],
  },
  {
    slug: 'raf',
    name: 'Раф ванильный',
    description: 'сливки и ванильный сахар, 300 мл',
    price: 330,
    category: 'coffee',
    tags: [],
  },
  {
    slug: 'decaf-cappuccino',
    name: 'Капучино без кофеина',
    description: '250 мл',
    price: 280,
    category: 'coffee',
    tags: ['decaf'],
  },
  {
    slug: 'sencha',
    name: 'Сенча',
    description: 'зеленый чай, чайник 400 мл',
    price: 220,
    category: 'tea',
    tags: ['no-sugar', 'vegan'],
  },
  {
    slug: 'matcha-latte',
    name: 'Матча-латте на овсяном',
    description: 'овсяное молоко, 300 мл',
    price: 340,
    category: 'tea',
    tags: ['oat', 'vegan'],
  },
  { slug: 'cocoa', name: 'Какао', description: 'молоко, 300 мл', price: 250, category: 'tea', tags: ['decaf'] },
  {
    slug: 'ginger-tea',
    name: 'Имбирный чай с облепихой',
    description: 'имбирь, облепиха, апельсин, 400 мл',
    price: 240,
    category: 'tea',
    tags: ['vegan', 'decaf'],
  },
  {
    slug: 'croissant',
    name: 'Круассан',
    description: 'на сливочном масле',
    price: 190,
    category: 'bakery',
    tags: [],
  },
  {
    slug: 'cinnamon-bun',
    name: 'Булочка с корицей',
    description: 'корица и сливочный крем',
    price: 230,
    category: 'bakery',
    tags: [],
  },
  {
    slug: 'date-cookie',
    name: 'Печенье с финиками',
    description: 'финики и овсяная мука',
    price: 160,
    category: 'bakery',
    tags: ['vegan', 'no-sugar'],
  },
  {
    slug: 'syrniki',
    name: 'Сырники со сметаной',
    description: 'три штуки, сметана и ягоды',
    price: 390,
    category: 'breakfast',
    tags: [],
  },
  {
    slug: 'granola',
    name: 'Гранола с ягодами на овсяном',
    description: 'овсяный йогурт и ягоды',
    price: 360,
    category: 'breakfast',
    tags: ['oat', 'vegan'],
  },
];
