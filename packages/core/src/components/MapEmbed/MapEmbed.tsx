'use client';

import { useState } from 'react';
import { mapWidgetUrl } from '../../map';
import type { MapPoint } from '../../types';
import styles from './MapEmbed.module.scss';

type MapEmbedProps = {
  point: MapPoint;
  /** Что отмечено на карте: заголовок iframe для скринридера. */
  label: string;
};

/**
 * Карта грузится по нажатию, а не при открытии страницы: виджет Яндекса тянет скрипты, тайлы и свои cookie,
 * и до нажатия страница не делает к нему ни одного запроса.
 */
export const MapEmbed = ({ point, label }: MapEmbedProps) => {
  const [shown, setShown] = useState(false);

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
            Показать карту
          </button>
          <p className={styles.note}>Карту загрузят Яндекс Карты</p>
        </div>
      )}
    </div>
  );
};
