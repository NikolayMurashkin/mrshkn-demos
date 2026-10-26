'use client';

import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { LOW_VISION_EVENT, LOW_VISION_SCHEMES } from '../../consts';
import { applyLowVision, LOW_VISION_FONTS, LOW_VISION_IMAGES, LOW_VISION_SCHEME_NAMES } from '../../low-vision';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang, LowVisionEventDetail, LowVisionSettings } from '../../types';
import styles from './LowVisionPanel.module.scss';
import './low-vision.scss';

type LowVisionPanelProps = {
  /** Настройки из cookie запроса: сервер рисует панель сразу, без мигания после гидрации. */
  initial: LowVisionSettings | null;
  lang?: DemoLang;
};

type ChoiceProps = {
  pressed: boolean;
  label: string;
  name?: string;
  style?: CSSProperties;
  className?: string;
  onPress: () => void;
};

const Choice = ({ pressed, label, name, style, className, onPress }: ChoiceProps) => (
  <button
    className={className ? `${styles.choice} ${className}` : styles.choice}
    type="button"
    aria-pressed={pressed}
    aria-label={name}
    style={style}
    onClick={onPress}
  >
    {label}
  </button>
);

/** Образец цветов схемы на ее кнопке: цвета — из `LOW_VISION_SCHEMES`, в SCSS литералов нет. */
const swatchOf = (scheme: keyof typeof LOW_VISION_SCHEMES) =>
  ({
    '--swatch-text': LOW_VISION_SCHEMES[scheme].text,
    '--swatch-bg': LOW_VISION_SCHEMES[scheme].background,
  }) as CSSProperties;

/** Панель над шапкой в режиме для слабовидящих: шрифт, цвета, картинки и выход в обычный вид. */
export const LowVisionPanel = ({ initial, lang = 'ru' }: LowVisionPanelProps) => {
  const id = useId();
  const [settings, setSettings] = useState(initial);
  const [focusRequest, setFocusRequest] = useState(0);
  const panel = useRef<HTMLElement>(null);
  const texts = CORE_TEXTS[lang].lowVision;

  useEffect(() => {
    const listen = (event: Event) => {
      const { settings: enabled } = (event as CustomEvent<LowVisionEventDetail>).detail ?? {};

      if (enabled) {
        setSettings(enabled);
      }

      setFocusRequest((count) => count + 1);
    };

    window.addEventListener(LOW_VISION_EVENT, listen);

    return () => window.removeEventListener(LOW_VISION_EVENT, listen);
  }, []);

  useEffect(() => {
    if (focusRequest > 0) {
      panel.current?.focus();
    }
  }, [focusRequest]);

  if (!settings) {
    return null;
  }

  const choose = (change: Partial<LowVisionSettings>) => {
    const next = { ...settings, ...change };

    applyLowVision(next);
    setSettings(next);
  };

  const exit = () => {
    applyLowVision(null);
    setSettings(null);
    document.querySelector<HTMLElement>('[data-low-vision-toggle]')?.focus();
  };

  return (
    <section
      ref={panel}
      className={styles.panel}
      aria-label={texts.panel}
      tabIndex={-1}
    >
      <div className={styles.inner}>
        <div
          className={styles.group}
          role="group"
          aria-labelledby={`${id}-font`}
        >
          <p
            className={styles.label}
            id={`${id}-font`}
          >
            {texts.fontGroup}
          </p>
          <div className={styles.choices}>
            {LOW_VISION_FONTS.map((font) => (
              <Choice
                key={font}
                className={styles[`font${font}`]}
                pressed={settings.font === font}
                label={texts.font[font].label}
                name={texts.font[font].name}
                onPress={() => choose({ font })}
              />
            ))}
          </div>
        </div>
        <div
          className={styles.group}
          role="group"
          aria-labelledby={`${id}-scheme`}
        >
          <p
            className={styles.label}
            id={`${id}-scheme`}
          >
            {texts.schemeGroup}
          </p>
          <div className={styles.choices}>
            {LOW_VISION_SCHEME_NAMES.map((scheme) => (
              <Choice
                key={scheme}
                className={styles.scheme}
                style={swatchOf(scheme)}
                pressed={settings.scheme === scheme}
                label={texts.scheme[scheme]}
                onPress={() => choose({ scheme })}
              />
            ))}
          </div>
        </div>
        <div
          className={styles.group}
          role="group"
          aria-labelledby={`${id}-images`}
        >
          <p
            className={styles.label}
            id={`${id}-images`}
          >
            {texts.imagesGroup}
          </p>
          <div className={styles.choices}>
            {LOW_VISION_IMAGES.map((images) => (
              <Choice
                key={images}
                pressed={settings.images === images}
                label={texts.images[images]}
                onPress={() => choose({ images })}
              />
            ))}
          </div>
        </div>
        <button
          className={styles.exit}
          type="button"
          onClick={exit}
        >
          {texts.exit}
        </button>
      </div>
    </section>
  );
};
