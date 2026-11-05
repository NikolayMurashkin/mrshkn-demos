type ArrowOutProps = {
  className?: string;
};

/** Стрелка ↗ ссылки на чужой сайт: страница откроется в новой вкладке. */
export const ArrowOut = ({ className }: ArrowOutProps) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);
