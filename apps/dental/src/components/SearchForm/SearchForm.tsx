import { SEARCH_QUERY_MAX_LENGTH } from '@mrshkn/demo-core/consts';
import { SEARCH, SEARCH_HREF } from '@/consts';
import { Arrow } from '../Arrow';
import styles from './SearchForm.module.scss';

type SearchFormProps = {
  query: string;
};

/** Форма поиска отправляется обычным GET: работает без скрипта, адрес результата можно сохранить и переслать. */
export const SearchForm = ({ query }: SearchFormProps) => (
  <form
    className={styles.form}
    action={SEARCH_HREF}
    method="get"
    role="search"
  >
    <label
      className={styles.label}
      htmlFor="search-query"
    >
      {SEARCH.field}
    </label>
    <div className={styles.row}>
      <input
        className={styles.input}
        id="search-query"
        name="q"
        type="search"
        defaultValue={query}
        maxLength={SEARCH_QUERY_MAX_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
      />
      <button
        className={styles.submit}
        type="submit"
      >
        {SEARCH.submit}
        <Arrow />
      </button>
    </div>
  </form>
);
