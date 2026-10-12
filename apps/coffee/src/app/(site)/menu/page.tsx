import config from '@payload-config';
import type { Metadata } from 'next';
import { getPayload } from 'payload';
import { getMenuItems } from '@/cms/queries';
import { MENU_CATEGORIES, MENU_TAGS } from '@/cms/seed/data';
import { MenuScreen } from '@/components/MenuScreen';
import type { SearchParams } from '@/types';

type MenuPageProps = {
  searchParams: Promise<SearchParams>;
};

export const metadata: Metadata = {
  title: 'Меню',
  description: 'Кофе, чай, выпечка и завтраки с ценами. Фильтр по категориям и признакам: без сахара, без кофеина.',
};

const MenuPage = async ({ searchParams }: MenuPageProps) => {
  const payload = await getPayload({ config });
  const [items, params] = await Promise.all([getMenuItems(payload), searchParams]);

  return (
    <MenuScreen
      items={items}
      categories={MENU_CATEGORIES}
      tags={MENU_TAGS}
      searchParams={params}
    />
  );
};

export default MenuPage;
