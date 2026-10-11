import type { Metadata } from 'next';
import { Quiz } from '@/components/Quiz';
import { QUIZ_PAGE } from '@/consts';
import styles from '../content.module.scss';

export const metadata: Metadata = {
  title: QUIZ_PAGE.title,
  description: QUIZ_PAGE.lead,
};

const QuizPage = () => (
  <main className={styles.page}>
    <Quiz />
  </main>
);

export default QuizPage;
