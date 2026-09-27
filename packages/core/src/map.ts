import { MAP_WIDGET_URL, MAP_ZOOM } from './consts';
import type { MapPoint } from './types';

/** Адрес виджета Яндекс Карт: центр и метка на точке. Координаты у Яндекса идут долготой вперед. */
export const mapWidgetUrl = ({ latitude, longitude }: MapPoint, zoom = MAP_ZOOM) => {
  const point = `${longitude},${latitude}`;

  return `${MAP_WIDGET_URL}?${new URLSearchParams({ ll: point, z: String(zoom), pt: `${point},pm2rdm` })}`;
};
