import { NBSP } from '@mrshkn/demo-core/consts';
import type { Metadata } from 'next';
import { PageIntro } from '@/components/PageIntro';
import { Section } from '@/components/Section';
import { SurveyForm } from '@/components/SurveyForm';
import { SURVEY } from '@/consts';

export const metadata: Metadata = {
  title: SURVEY.title,
  description: `Анонимная анкета: оцените сведения на${NBSP}сайте, удобство, доступность и${NBSP}вежливость сотрудников клиники.`,
};

const SurveyPage = () => (
  <>
    <PageIntro
      label={SURVEY.label}
      title={SURVEY.title}
      lead={SURVEY.lead}
    />
    <Section
      id="survey"
      label={SURVEY.formLabel}
    >
      <SurveyForm />
    </Section>
  </>
);

export default SurveyPage;
