import type { ReactNode } from 'react';
import { Plate } from '@/components/Plate';

type PlateLayoutProps = {
  children: ReactNode;
};

/**
 * Страницы с плитой над подвалом — все, кроме записи, оплаты и квиза: запись — сама страница, а плита ведет на квиз
 * и запись.
 */
const PlateLayout = ({ children }: PlateLayoutProps) => (
  <>
    {children}
    <Plate />
  </>
);

export default PlateLayout;
