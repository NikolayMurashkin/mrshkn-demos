export type NavItem = {
  href: string;
  label: string;
};

export type AboutSection = {
  id: string;
  title: string;
  /** Нумерованный список: шаги работы идут по порядку. */
  numbered?: boolean;
  items: string[];
};

type QuizOption = {
  id: string;
  text: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  options: QuizOption[];
};

export type QuizAnswers = Record<string, string>;

export type QuizResult = {
  id: string;
  title: string;
  text: string;
  /** Запись: `/booking?format=<slug>`. */
  href: string;
  cta: string;
  /** Кризисный ответ: первым — телефон, запись — вторым действием. */
  urgent?: boolean;
  phone?: string;
};

/** Обязательное поле формы записи: у каждого своя ошибка под полем. */
export type BookingField = 'format' | 'name' | 'contact' | 'when' | 'consent';
