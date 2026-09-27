import { LeadForm } from '@mrshkn/demo-core/components/LeadForm';
import { LEAD_FORM_ID, POLICY_HREF } from '@mrshkn/demo-core/consts';
import { DEMO } from '@/demo.config';
import { phoneHref } from '@/lib/format';
import { Section } from '../Section';
import styles from './BookingSection.module.scss';

/** Форма записи внизу каждой страницы: заявка запоминает страницу, с которой пришла, — врача или услугу. */
export const BookingSection = () => {
  const { telephone } = DEMO.business;

  return (
    <Section
      id={LEAD_FORM_ID}
      label="Запись"
      title="Запись на&nbsp;прием"
    >
      <p className={styles.lead}>
        Оставьте имя и&nbsp;телефон&nbsp;— администратор перезвонит в&nbsp;часы работы клиники и&nbsp;подберет удобное
        время.
        {telephone && (
          <>
            {' '}
            Или позвоните:{' '}
            <a
              className={styles.phone}
              href={phoneHref(telephone)}
            >
              {telephone}
            </a>
            .
          </>
        )}
      </p>
      <LeadForm policyHref={POLICY_HREF} />
    </Section>
  );
};
