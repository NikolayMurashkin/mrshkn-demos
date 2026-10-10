'use client';

import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { WhereItHurts as WhereItHurtsData } from '../../cms/types';
import { REDUCED_MOTION_MEDIA, STACKED_MEDIA } from '../../consts';
import { typeset } from '../../lib/lang';
import { selectSymptom } from '../../lib/where-it-hurts';
import { TEXTS } from '../../texts';
import type { CardOpener, Selection } from '../../types';
import { NodeCard } from '../NodeCard';
import styles from './WhereItHurts.module.scss';

type WhereItHurtsProps = {
  data: WhereItHurtsData;
  lang: DemoLang;
  /** Первый кадр сцены: постер рендерит сервер. */
  poster: ReactNode;
};

const CloseIcon = () => (
  <svg
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
);

/**
 * Первый экран «где болит» без 3D: симптомы, восемь узлов и карточка выбранного узла поверх постера. Карточка
 * закрывается кнопкой или Escape — из первого экрана или когда фокус потерян (на `body`), а не из формы ниже, — и
 * фокус возвращается на симптом или узел, которым ее открыли.
 */
export const WhereItHurts = ({ data, lang, poster }: WhereItHurtsProps) => {
  const texts = TEXTS[lang];
  const [selection, setSelection] = useState<Selection | null>(null);
  const opener = useRef<CardOpener | null>(null);
  const pendingFocus = useRef<CardOpener | 'close' | null>(null);
  const pendingReveal = useRef(false);
  const symptomButtons = useRef(new Map<string, HTMLButtonElement>());
  const nodeButtons = useRef(new Map<string, HTMLButtonElement>());
  const closeButton = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  const node = selection && data.nodes.find(({ key }) => key === selection.node);
  const symptom = selection?.symptom ? data.symptoms.find(({ key }) => key === selection.symptom) : undefined;

  const open = (next: Selection, from: CardOpener) => {
    opener.current = from;
    pendingReveal.current = true;
    pendingFocus.current = from.kind === 'node' ? 'close' : null;
    setSelection(next);
  };

  const chooseSymptom = (key: string) => {
    const selected = selectSymptom(data, key);

    if (selected) {
      open({ node: selected.node.key, symptom: key }, { kind: 'symptom', key });
    }
  };

  const chooseNode = (key: string) => open({ node: key, symptom: null }, { kind: 'node', key });

  const close = () => {
    pendingFocus.current = opener.current;
    opener.current = null;
    setSelection(null);
  };

  useEffect(() => {
    const target = pendingFocus.current;

    pendingFocus.current = null;

    if (target === 'close') {
      closeButton.current?.focus();
    } else if (target) {
      const button = (target.kind === 'symptom' ? symptomButtons : nodeButtons).current.get(target.key);

      // кнопка, нажатая мышью, уже в фокусе, и focus() не прокрутит к ней, когда карточка над ней сжалась
      button?.focus();
      button?.scrollIntoView({ block: 'nearest' });
    }

    if (pendingReveal.current) {
      pendingReveal.current = false;

      if (card.current && stage.current && window.matchMedia(STACKED_MEDIA).matches) {
        const top = card.current.getBoundingClientRect().top + window.scrollY - stage.current.offsetHeight - 8;

        window.scrollTo({ top, behavior: window.matchMedia(REDUCED_MOTION_MEDIA).matches ? 'auto' : 'smooth' });
      }
    }
  });

  useEffect(() => {
    if (!selection) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const { target } = event;
      const fromStage = target === document.body || (target instanceof Node && root.current?.contains(target));

      if (event.key === 'Escape' && fromStage) {
        close();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return (
    <section
      className={styles.layout}
      ref={root}
      aria-labelledby="where-title"
    >
      <div className={styles.ask}>
        <h1
          className={styles.heading}
          id="where-title"
        >
          {texts.hero.heading}
        </h1>
        <p className={styles.intro}>{texts.hero.intro}</p>
      </div>
      <div
        className={styles.stage}
        ref={stage}
      >
        {poster}
      </div>
      <div
        className={styles.card}
        ref={card}
      >
        {node ? (
          <NodeCard
            node={node}
            lang={lang}
            headingLevel="h2"
            titleId="card-title"
            action={
              <button
                className={styles.close}
                type="button"
                ref={closeButton}
                aria-label={texts.hero.close}
                onClick={close}
              >
                <CloseIcon />
              </button>
            }
            lead={
              symptom && (
                <p className={styles.cardSymptom}>
                  <span
                    className={styles.cardLamp}
                    aria-hidden="true"
                  />
                  <span>
                    <span className={styles.hidden}>{texts.hero.symptomPrefix}: </span>
                    {typeset(symptom.text, lang)}
                  </span>
                </p>
              )
            }
          >
            <p className={styles.note}>{texts.card.priceNote}</p>
            <div className={styles.book}>
              <BookingButton formHref={`#${LEAD_FORM_ID}`}>{texts.hero.book}</BookingButton>
            </div>
          </NodeCard>
        ) : (
          <>
            <p className={styles.empty}>{texts.hero.emptyCard}</p>
            <h2
              className={styles.sub}
              id="card-nodes"
            >
              {texts.hero.nodesLabel}
            </h2>
            <ul className={styles.nodes}>
              {data.nodes.map((item) => (
                <li key={item.key}>
                  <button
                    className={styles.node}
                    type="button"
                    ref={(element) => {
                      if (element) {
                        nodeButtons.current.set(item.key, element);
                      } else {
                        nodeButtons.current.delete(item.key);
                      }
                    }}
                    onClick={() => chooseNode(item.key)}
                  >
                    <span
                      className={styles.ring}
                      aria-hidden="true"
                    />
                    <span className={styles.nodeName}>{typeset(item.name, lang)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <ul
        className={styles.symptoms}
        aria-label={texts.hero.symptomsLabel}
      >
        {data.symptoms.map((item) => (
          <li key={item.key}>
            <button
              className={styles.symptom}
              type="button"
              ref={(element) => {
                if (element) {
                  symptomButtons.current.set(item.key, element);
                } else {
                  symptomButtons.current.delete(item.key);
                }
              }}
              aria-pressed={selection?.symptom === item.key}
              onClick={() => chooseSymptom(item.key)}
            >
              <span
                className={styles.lamp}
                aria-hidden="true"
              />
              <span className={styles.symptomText}>{typeset(item.text, lang)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p
        className={styles.hidden}
        role="status"
      >
        {node ? typeset(node.name, lang) : ''}
      </p>
    </section>
  );
};
