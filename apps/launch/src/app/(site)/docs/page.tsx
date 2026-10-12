import { permanentRedirect } from 'next/navigation';
import { DOC_PAGES } from '@/consts';
import { docHref } from '@/lib/docs';

/** Своей страницы у документации нет: адрес раздела целиком ведет в первый раздел. */
const DocsPage = () => permanentRedirect(docHref(DOC_PAGES[0].slug));

export default DocsPage;
