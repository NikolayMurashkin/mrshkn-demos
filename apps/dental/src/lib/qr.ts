import QRCode from 'qrcode';

/**
 * SVG QR-кода без фона: модули берут цвет текста (`currentColor`), тихая зона в четыре модуля — внутри viewBox.
 * Рисуется на сервере, клиенту не нужен ни пакет, ни скрипт.
 */
export const qrSvg = async (url: string) => {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000ff', light: '#00000000' },
  });

  return svg.replace('stroke="#000000"', 'stroke="currentColor"').replace('<svg ', '<svg aria-hidden="true" ');
};
