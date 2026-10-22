type ArrowProps = {
  /** Наискосок — «перейти» в углу карточки; прямо — в кнопке. */
  diagonal?: boolean;
};

export const Arrow = ({ diagonal = false }: ArrowProps) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={diagonal ? 'M7 17L17 7M8 7h9v9' : 'M5 12h14M13 6l6 6-6 6'} />
  </svg>
);
