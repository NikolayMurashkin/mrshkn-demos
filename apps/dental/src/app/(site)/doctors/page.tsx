import type { Metadata } from 'next';
import { DoctorCards } from '@/components/DoctorCards';
import { PageIntro } from '@/components/PageIntro';
import { Section } from '@/components/Section';
import { getDoctors } from '@/cms/queries';

export const metadata: Metadata = {
  title: 'Врачи',
  description: 'Врачи стоматологии: терапевт, хирурги, ортопед, ортодонт, детский стоматолог и гигиенист.',
};

const DoctorsPage = async () => {
  const doctors = await getDoctors();

  return (
    <>
      <PageIntro
        label="Врачи"
        title="Врачи клиники"
        lead="У&nbsp;каждого врача свое направление. На&nbsp;странице врача&nbsp;— что он&nbsp;лечит, где учился и&nbsp;с&nbsp;какого года работает."
      />
      <Section
        id="doctors"
        label="Список"
        wide
      >
        <DoctorCards doctors={doctors} />
      </Section>
    </>
  );
};

export default DoctorsPage;
