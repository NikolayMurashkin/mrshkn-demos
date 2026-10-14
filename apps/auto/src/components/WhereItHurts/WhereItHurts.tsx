'use client';

import { BookingButton } from '@mrshkn/demo-core/components/BookingButton';
import { LEAD_FORM_ID } from '@mrshkn/demo-core/consts';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { WhereItHurts as WhereItHurtsData } from '../../cms/types';
import { EXPLAINERS, REDUCED_MOTION_MEDIA, STACKED_MEDIA } from '../../consts';
import { EXPLAIN_START, sceneExplainFor } from '../../lib/explain';
import { typeset } from '../../lib/lang';
import { selectSymptom } from '../../lib/where-it-hurts';
import type { NodeAnchor, SceneMode } from '../../scene/types';
import { TEXTS } from '../../texts';
import type { CardOpener, ExplainValues, LeaderLayout, Selection } from '../../types';
import { Explainer } from '../Explainer';
import { NodeCard } from '../NodeCard';
import { Scene } from '../Scene';
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

/** Элемент виден: не `visibility: hidden` и не внутри скрытого — как список узлов при работающей сцене на узком экране. */
const isShown = (element: HTMLElement) =>
  typeof element.checkVisibility === 'function'
    ? element.checkVisibility({ visibilityProperty: true })
    : element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible';

/**
 * Первый экран «где болит»: симптомы, восемь узлов, карточка выбранного узла с объяснялкой и 3D-сцена над постером.
 * Симптом или узел ведут камеру к узлу, клик по узлу в сцене открывает карточку; без 3D все то же работает на постере.
 * Карточка закрывается кнопкой или Escape — из первого экрана или когда фокус потерян (на `body`), а не из формы
 * ниже, — и фокус возвращается на симптом или узел, которым ее открыли; если сцена работает, а кнопка скрыта (список
 * узлов на узком экране), — на саму сцену: точку узла камера по пути к общему плану прячет, и браузер снял бы с нее
 * фокус. На десктопе выноска ведет от точки узла в сцене к заголовку карточки.
 */
export const WhereItHurts = ({ data, lang, poster }: WhereItHurtsProps) => {
  const texts = TEXTS[lang];
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [explainValues, setExplainValues] = useState<ExplainValues>(EXPLAIN_START);
  const [sceneMode, setSceneMode] = useState<SceneMode>('poster');
  const cycle = useRef<((time: number) => void) | null>(null);
  const anchors = useRef<NodeAnchor[] | null>(null);
  const leader = useRef<SVGSVGElement>(null);
  const layout = useRef<LeaderLayout | null>(null);
  const stacked = useRef<MediaQueryList | null>(null);
  const selected = useRef<string | null>(null);
  const opener = useRef<CardOpener | null>(null);
  const pendingFocus = useRef<CardOpener | 'close' | null>(null);
  const pendingReveal = useRef(false);
  const symptomButtons = useRef(new Map<string, HTMLButtonElement>());
  const nodeButtons = useRef(new Map<string, HTMLButtonElement>());
  const closeButton = useRef<HTMLButtonElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);

  const sceneOn = sceneMode !== 'poster';
  const node = selection && data.nodes.find(({ key }) => key === selection.node);
  const symptom = selection?.symptom ? data.symptoms.find(({ key }) => key === selection.symptom) : undefined;

  const explainer = node ? EXPLAINERS[node.key] : undefined;
  const sceneExplain = useMemo(
    () => sceneExplainFor(selection?.node ?? null, explainValues),
    [selection?.node, explainValues],
  );

  /** Карточку открыл симптом или узел из списка — фокус вернется к нему; точка или клик в сцене — `null`. */
  const open = (next: Selection, from: CardOpener | null) => {
    opener.current = from;
    pendingReveal.current = true;
    pendingFocus.current = from?.kind === 'node' ? 'close' : null;
    setSelection(next);
  };

  const chooseSymptom = (key: string) => {
    const found = selectSymptom(data, key);

    if (found) {
      open({ node: found.node.key, symptom: key, place: found.symptom.place ?? null }, { kind: 'symptom', key });
    }
  };

  /** Симптом остается нажатым, только если ведет в тот же узел и то же место. */
  const keptSymptom = (node: string, place: string | null) => {
    const current = symptom && symptom.node === node && (symptom.place ?? null) === place;

    return current ? symptom.key : null;
  };

  const chooseNode = (key: string, place: string | null = null, from: CardOpener | null = { kind: 'node', key }) =>
    open({ node: key, symptom: keptSymptom(key, place), place }, from);

  // Ползунок цепи: камера — к приводу ГРМ (место timing узла «Двигатель»), если она еще не там.
  const showChain = () => {
    if (selection?.node === 'engine' && selection.place !== 'timing') {
      setSelection({ node: 'engine', symptom: keptSymptom('engine', 'timing'), place: 'timing' });
    }
  };

  // Выноска как в руководстве по ремонту: от точки узла в сцене к заголовку карточки, только на десктопе.
  // Раскладку читает measureLeader при смене выбора, прокрутке и смене размеров; кадр сцены только считает и пишет.
  const isStacked = () => (stacked.current ??= window.matchMedia(STACKED_MEDIA)).matches;

  const measureLeader = () => {
    const title = card.current?.querySelector('#card-title');

    if (!root.current || !stage.current || !card.current || !title || isStacked()) {
      layout.current = null;

      return;
    }

    const box = root.current.getBoundingClientRect();
    const stageBox = stage.current.getBoundingClientRect();
    const cardBox = card.current.getBoundingClientRect();
    const titleBox = title.getBoundingClientRect();

    layout.current = {
      stageX: stageBox.left - box.left,
      stageY: stageBox.top - box.top,
      endX: cardBox.left - box.left,
      endY: Math.max(cardBox.top - box.top + 12, titleBox.top - box.top + Math.min(titleBox.height / 2, 24)),
    };
  };

  const drawLeader = () => {
    const svg = leader.current;
    const anchor = anchors.current?.find(({ id }) => id === selected.current);
    const geometry = layout.current;

    if (!svg || !geometry || !anchor?.visible) {
      svg?.removeAttribute('data-visible');

      return;
    }

    const { endX, endY } = geometry;
    const startX = geometry.stageX + anchor.x;
    const startY = geometry.stageY + anchor.y;
    const kneeX = Math.min(Math.max(startX + 24, endX - 56), endX - 8);

    svg.querySelector('polyline')?.setAttribute('points', `${startX},${startY} ${kneeX},${endY} ${endX},${endY}`);
    svg.querySelector('circle')?.setAttribute('cx', String(startX));
    svg.querySelector('circle')?.setAttribute('cy', String(startY));
    svg.setAttribute('data-visible', 'true');
  };

  const onAnchors = (next: NodeAnchor[] | null) => {
    anchors.current = next;
    drawLeader();
  };

  useLayoutEffect(() => {
    selected.current = selection?.node ?? null;
    measureLeader();
    drawLeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection]);

  useEffect(() => {
    const cardElement = card.current;
    let frame = 0;
    const redraw = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        measureLeader();
        drawLeader();
      });
    };
    const resize = new ResizeObserver(redraw);

    [root.current, stage.current, cardElement].forEach((element) => element && resize.observe(element));
    window.addEventListener('scroll', redraw, { passive: true });
    cardElement?.addEventListener('scroll', redraw, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener('scroll', redraw);
      cardElement?.removeEventListener('scroll', redraw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      if (!sceneOn || (button && isShown(button))) {
        // кнопка, нажатая мышью, уже в фокусе, и focus() не прокрутит к ней, когда карточка над ней сжалась
        button?.focus();
        button?.scrollIntoView({ block: 'nearest' });
      } else {
        stage.current?.focus();
      }
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
        tabIndex={-1}
        role={sceneOn ? 'region' : undefined}
        aria-label={sceneOn ? texts.hero.sceneLabel : undefined}
      >
        {poster}
        <Scene
          lang={lang}
          nodes={data.nodes}
          selection={selection}
          hover={hover}
          explain={sceneExplain}
          onSelect={(key, place) => chooseNode(key, place, null)}
          onHover={setHover}
          onCycle={(time) => cycle.current?.(time)}
          onAnchors={onAnchors}
          onMode={setSceneMode}
        />
      </div>
      <div
        className={styles.card}
        ref={card}
        data-empty={!node && sceneOn ? 'true' : undefined}
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
            explanation={
              explainer && (
                <Explainer
                  kind={explainer}
                  lang={lang}
                  values={explainValues}
                  onChange={setExplainValues}
                  onChainView={showChain}
                  cycleRef={cycle}
                />
              )
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
                    onPointerEnter={(event) => event.pointerType === 'mouse' && setHover(item.key)}
                    onPointerLeave={() => setHover(null)}
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
              onPointerEnter={(event) => event.pointerType === 'mouse' && setHover(item.node)}
              onPointerLeave={() => setHover(null)}
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
      <svg
        className={styles.leader}
        ref={leader}
        aria-hidden="true"
      >
        <polyline points="0,0 0,0" />
        <circle
          r="3.5"
          cx="0"
          cy="0"
        />
      </svg>
      <p
        className={styles.hidden}
        role="status"
      >
        {node ? typeset(node.name, lang) : ''}
      </p>
    </section>
  );
};
