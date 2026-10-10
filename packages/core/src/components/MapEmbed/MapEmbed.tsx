'use client';

import { useState } from 'react';
import { mapWidgetUrl } from '../../map';
import { CORE_TEXTS } from '../../texts';
import type { DemoLang, MapPoint } from '../../types';
import styles from './MapEmbed.module.scss';

type MapEmbedProps = {
  point: MapPoint;
  /** Что отмечено на карте: заголовок iframe для скринридера. */
  label: string;
  lang?: DemoLang;
};

/**
 * Карта грузится по нажатию, а не при открытии страницы: виджет Яндекса тянет скрипты, тайлы и свои cookie,
 * и до нажатия страница не делает к нему ни одного запроса.
 */
export const MapEmbed = ({ point, label, lang = 'ru' }: MapEmbedProps) => {
  const [shown, setShown] = useState(false);
  const texts = CORE_TEXTS[lang].map;

  return (
    <div
      className={styles.map}
      data-map
    >
      {shown ? (
        <iframe
          className={styles.widget}
          src={mapWidgetUrl(point)}
          title={label}
          allowFullScreen
        />
      ) : (
        <div className={styles.placeholder}>
          <button
            className={styles.button}
            type="button"
            onClick={() => setShown(true)}
          >
            {texts.show}
          </button>
          <p className={styles.note}>{texts.note}</p>
        </div>
      )}
    </div>
  );
};
