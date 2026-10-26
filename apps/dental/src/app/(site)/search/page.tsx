import { NBSP } from '@mrshkn/demo-core/consts';
import { normalizeQuery } from '@mrshkn/demo-core/search';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/PageIntro';
import { SearchForm } from '@/components/SearchForm';
import { SearchResults } from '@/components/SearchResults';
import { Section } from '@/components/Section';
import { searchContent } from '@/cms/queries';
import { SEARCH } from '@/consts';

type SearchPageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

export const metadata: Metadata = {
  title: SEARCH.title,
  description: `Поиск по${NBSP}врачам, услугам и${NBSP}сведениям о${NBSP}клинике.`,
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams;
  const query = normalizeQuery((Array.isArray(q) ? q[0] : q) ?? '');

  return (
    <>
      <PageIntro
        label={SEARCH.label}
        title={SEARCH.title}
      />
      <Section
        id="search"
        label={SEARCH.results}
      >
        <SearchForm query={query} />
        {query && <SearchResults results={await searchContent(query)} />}
      </Section>
    </>
  );
};

export default SearchPage;
