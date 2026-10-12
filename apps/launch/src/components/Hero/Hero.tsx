import { NBSP } from '@mrshkn/demo-core/consts';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Command } from '@/components/Command';
import { Window } from '@/components/Window';
import { HERO, STAGE_WIDTH } from '@/consts';
import styles from './Hero.module.scss';

/** Первый экран: команда раскатки печатается, затем строки лога появляются по одной — единственная сцена страницы. */
export const Hero = () => (
  <section
    className={styles.hero}
    aria-labelledby="hero-title"
  >
    <div
      className={styles.grid}
      aria-hidden="true"
    />
    <div className={styles.content}>
      <p
        className={styles.prompt}
        translate="no"
      >
        <span className={styles.sign}>$</span>{' '}
        <span
          className={styles.command}
          style={{ '--chars': HERO.prompt.length } as CSSProperties}
        >
          <Command command={HERO.prompt} />
        </span>
      </p>
      <h1
        className={styles.title}
        id="hero-title"
      >
        {HERO.title}
        <span className={styles.dot}>.</span>
      </h1>
      <p className={styles.lead}>{HERO.lead}</p>
      <div className={styles.actions}>
        <Link
          className={styles.primary}
          href={HERO.primary.href}
          prefetch={false}
        >
          {HERO.primary.label}
        </Link>
        <Link
          className={styles.secondary}
          href={HERO.secondary.href}
          prefetch={false}
        >
          {HERO.secondary.label}
        </Link>
      </div>
    </div>
    <Window
      className={styles.log}
      title={HERO.logTitle}
    >
      <ol className={styles.lines}>
        {HERO.log.map((line, index) => (
          <li
            key={line.key}
            className={styles.line}
            style={{ '--i': index } as CSSProperties}
          >
            <span
              className={styles.num}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            {line.stage && <span className={styles.stage}>[{line.stage.padStart(STAGE_WIDTH, NBSP)}]</span>}
            <span className={styles.text}>
              <b className={styles.key}>{line.key}</b> {line.text}
            </span>
            <span
              className={styles.leader}
              aria-hidden="true"
            />
            {line.status === 'ok' ? (
              <span className={styles.ok}>{HERO.statusOk}</span>
            ) : (
              <>
                <span className={styles.active}>{HERO.statusActive}</span>
                <span
                  className={styles.cursor}
                  aria-hidden="true"
                />
              </>
            )}
          </li>
        ))}
      </ol>
    </Window>
  </section>
);
