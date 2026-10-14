import type { CanvasRect, ProxiedPointer } from './types';

/**
 * Холст для camera-controls в воркере: DOM там нет, главный поток пересылает события указателя и размер холста,
 * прокси отдает их как элемент. `ownerDocument` — сам прокси: слушатели «на документе» (движение и отпускание при
 * перетаскивании) получают те же пересланные события; захват указателя держит главный поток.
 */
export class ElementProxy extends EventTarget {
  readonly style: Record<string, string> = {};

  readonly ownerDocument = this;

  readonly pointerLockElement = null;

  private rect: CanvasRect;

  constructor(rect: CanvasRect) {
    super();
    this.rect = rect;
  }

  get clientWidth() {
    return this.rect.width;
  }

  get clientHeight() {
    return this.rect.height;
  }

  getBoundingClientRect() {
    const { left, top, width, height } = this.rect;

    return { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height };
  }

  setRect(rect: CanvasRect) {
    this.rect = rect;
  }

  dispatchPointer({ type, ...fields }: ProxiedPointer) {
    this.dispatchEvent(Object.assign(new Event(type), fields));
  }

  setAttribute() {}

  removeAttribute() {}

  setPointerCapture() {}

  releasePointerCapture() {}

  requestPointerLock() {}

  exitPointerLock() {}

  focus() {}
}
