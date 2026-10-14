import { NBSP } from '@mrshkn/demo-core/consts';
import type { DemoLang } from '@mrshkn/demo-core/types';
import { useEffect, useMemo, useRef, type ChangeEvent, type RefObject } from 'react';
import { NUMBER_LOCALES, PLOT } from '../../consts';
import { airPath, chainFor, chainZones, playheadX, plotPath, plotY, rideFor } from '../../lib/explain';
import { typeset } from '../../lib/lang';
import { PHYSICS } from '../../scene/physics/constants';
import { TEXTS, type AutoTexts } from '../../texts';
import type { ExplainValues } from '../../types';
import styles from './Explainer.module.scss';

type ExplainerProps = {
  kind: 'suspension' | 'chain';
  lang: DemoLang;
  values: ExplainValues;
  onChange: (values: ExplainValues) => void;
  /** Ползунок цепи сдвинули: камера — к приводу ГРМ. */
  onChainView: () => void;
  /** Сюда сцена передает время цикла подвески: линия «сейчас» на графике. */
  cycleRef: RefObject<((time: number) => void) | null>;
};

/** Тексты, числа и проценты объяснялки по правилам языка: «60 %» с неразрывным пробелом в ru, «60%» в en. */
const formatters = (lang: DemoLang) => {
  const texts = TEXTS[lang].explain;
  const locale = NUMBER_LOCALES[lang];

  return {
    t: (key: keyof AutoTexts['explain'], vars: Record<string, string> = {}) =>
      typeset(
        texts[key].replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? ''),
        lang,
      ),
    number: (value: number, digits: number) =>
      new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value),
    percent: (share: number, digits: number) =>
      new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(share),
  };
};

type SliderProps = {
  id: string;
  label: string;
  output: string;
  max: number;
  step: number;
  value: number;
  onInput: (value: number) => void;
};

const Slider = ({ id, label, output, max, step, value, onInput }: SliderProps) => (
  <>
    <div className={styles.control}>
      <label htmlFor={id}>{label}</label>
      <output
        className={styles.value}
        htmlFor={id}
      >
        {output}
      </output>
    </div>
    <input
      className={styles.range}
      type="range"
      id={id}
      min={0}
      max={max}
      step={step}
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onInput(Number(event.target.value))}
    />
  </>
);

const SuspensionExplainer = ({ lang, values, onChange, cycleRef }: ExplainerProps) => {
  const { t, number, percent } = formatters(lang);
  const playhead = useRef<SVGLineElement>(null);
  const fresh = rideFor(0);
  const ride = rideFor(values.wear);
  const freshPath = useMemo(() => plotPath(rideFor(0).front), []);
  const seconds = (value: number) =>
    Number.isFinite(value)
      ? `${number(value, 1)}${NBSP}${t('seconds')}`
      : `> ${number(PHYSICS.suspension.cycleMax - PHYSICS.suspension.bumpStart, 0)}${NBSP}${t('seconds')}`;

  useEffect(() => {
    cycleRef.current = (time) => {
      const x = playheadX(time).toFixed(1);

      playhead.current?.setAttribute('x1', x);
      playhead.current?.setAttribute('x2', x);
    };

    return () => {
      cycleRef.current = null;
    };
  }, [cycleRef]);

  return (
    <section
      className={styles.explain}
      aria-labelledby="explain-title"
    >
      <h3
        className={styles.title}
        id="explain-title"
      >
        {t('suspensionTitle')}
      </h3>
      <p className={styles.lead}>{t('suspensionLead')}</p>
      <Slider
        id="explain-wear"
        label={t('wear')}
        output={percent(values.wear, 0)}
        max={PHYSICS.suspension.wearMax * 100}
        step={PHYSICS.suspension.wearStep * 100}
        value={Math.round(values.wear * 100)}
        onInput={(value) => onChange({ ...values, wear: value / 100 })}
      />
      <figure className={styles.figure}>
        <svg
          className={styles.plot}
          viewBox={`0 0 ${PLOT.width} ${PLOT.height}`}
          aria-hidden="true"
        >
          <line
            className={styles.axis}
            x1={PLOT.pad}
            x2={PLOT.width - PLOT.pad}
            y1={plotY(0)}
            y2={plotY(0)}
          />
          <path
            className={`${styles.line} ${styles.lineNew}`}
            d={freshPath}
          />
          <path
            className={styles.air}
            d={airPath(ride.front)}
          />
          <path
            className={styles.line}
            d={plotPath(ride.front)}
          />
          <line
            className={styles.playhead}
            ref={playhead}
            x1={-10}
            x2={-10}
            y1={0}
            y2={PLOT.height}
          />
        </svg>
        <figcaption className={styles.caption}>
          <span className={styles.key}>{t('plotNow')}</span>
          <span className={`${styles.key} ${styles.keyNew}`}>{t('plotNew')}</span>
          <span className={`${styles.key} ${styles.keyAir}`}>{t('plotAir')}</span>
        </figcaption>
      </figure>
      <dl className={styles.facts}>
        <div>
          <dt>{t('settle')}</dt>
          <dd>{`${seconds(ride.settle)} (${t('newShock')} ${seconds(fresh.settle)})`}</dd>
        </div>
        <div>
          <dt>{t('airborne')}</dt>
          <dd>{`${percent(ride.air, 0)} (${t('newShock')} ${percent(fresh.air, 0)})`}</dd>
        </div>
      </dl>
      <p className={styles.note}>
        {t('suspensionNote', {
          length: number(PHYSICS.suspension.bumpLength, 1),
          height: number(PHYSICS.suspension.bumpHeight, 3),
          speed: number(PHYSICS.suspension.speed * 3.6, 0),
        })}
      </p>
    </section>
  );
};

const ChainExplainer = ({ lang, values, onChange, onChainView }: ExplainerProps) => {
  const { t, number, percent } = formatters(lang);
  const chain = chainFor(values.stretch);
  const zones = chainZones();
  const share = (value: number) => `${value * 100}%`;

  return (
    <section
      className={styles.explain}
      aria-labelledby="explain-title"
    >
      <h3
        className={styles.title}
        id="explain-title"
      >
        {t('chainTitle')}
      </h3>
      <p className={styles.lead}>{t('chainLead')}</p>
      <Slider
        id="explain-stretch"
        label={t('stretch')}
        output={`${percent(values.stretch, 2)} · +${number(chain.millimeters, 1)}${NBSP}${t('mm')}`}
        max={PHYSICS.chain.elongationMax * 100}
        step={PHYSICS.chain.elongationStep * 100}
        value={values.stretch * 100}
        onInput={(value) => {
          onChainView();
          onChange({ ...values, stretch: value / 100 });
        }}
      />
      <div
        className={styles.scale}
        aria-hidden="true"
      >
        <span
          className={`${styles.zone} ${styles.zoneReplace}`}
          style={{ left: share(zones.replace) }}
        />
        <span
          className={`${styles.zone} ${styles.zoneError}`}
          style={{ left: share(zones.error) }}
        />
        <span
          className={`${styles.zone} ${styles.zoneSkip}`}
          style={{ left: share(zones.skip) }}
        />
        <span
          className={styles.marker}
          style={{ left: share(values.stretch / PHYSICS.chain.elongationMax) }}
        />
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>{t('shift')}</dt>
          <dd>{`${number(chain.shift, 1)}° ${t('crankDegrees')}`}</dd>
        </div>
      </dl>
      <p
        className={styles.status}
        role="status"
        data-level={chain.level}
      >
        {t(`chain_${chain.level}`, {
          limit: percent(PHYSICS.chain.wearLimit, 1),
          norm: `0${NBSP}±${NBSP}${number(PHYSICS.chain.errorShift, 0)}°`,
          skip: percent(PHYSICS.chain.skipElongation, 1),
        })}
      </p>
      <p className={styles.note}>{t('chainNote')}</p>
    </section>
  );
};

/**
 * Объяснялка в карточке узла: ползунок, расчет по физике сцены, график хода кузова или шкала растяжения цепи, выводы.
 * Работает и без 3D: сцена, если запущена, получает те же расчеты.
 */
export const Explainer = (props: ExplainerProps) =>
  props.kind === 'suspension' ? <SuspensionExplainer {...props} /> : <ChainExplainer {...props} />;
