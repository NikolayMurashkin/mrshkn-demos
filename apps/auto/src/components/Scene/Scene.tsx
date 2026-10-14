import type { DemoLang } from '@mrshkn/demo-core/types';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { AutoNode } from '../../cms/types';
import { HOTSPOT_LABEL, PHONE_MEDIA, REDUCED_MOTION_MEDIA, SCENE_CLICK, SCENE_COLOR_TOKENS } from '../../consts';
import { typeset } from '../../lib/lang';
import { startMainScene, startWorkerScene, supportsWebgl2 } from '../../scene/host';
import { pickStartMode, waitForFirstAction } from '../../scene/start';
import type {
  CanvasRect,
  NodeAnchor,
  ProxiedPointer,
  SceneColors,
  SceneEvent,
  SceneHost,
  SceneMode,
  SceneSetup,
  SceneSize,
} from '../../scene/types';
import { TEXTS } from '../../texts';
import type { Press, SceneExplain, Selection } from '../../types';
import styles from './Scene.module.scss';

type SceneProps = {
  lang: DemoLang;
  nodes: AutoNode[];
  selection: Selection | null;
  hover: string | null;
  explain: SceneExplain | null;
  onSelect: (node: string, place: string | null) => void;
  onHover: (node: string | null) => void;
  /** Время цикла объяснялки подвески, каждый кадр. */
  onCycle: (time: number) => void;
  /** Точки узлов после каждого кадра; `null` — сцены нет. */
  onAnchors: (anchors: NodeAnchor[] | null) => void;
  /** Режим сцены после каждой смены: постер, воркер или главный поток. */
  onMode: (mode: SceneMode) => void;
};

const rectOf = (element: Element): CanvasRect => {
  const { left, top, width, height } = element.getBoundingClientRect();

  return { left, top, width, height };
};

const sizeOf = (element: Element): SceneSize => {
  const rect = rectOf(element);

  return { width: rect.width, height: rect.height, pixelRatio: window.devicePixelRatio, rect };
};

const readColors = (): SceneColors => {
  const css = getComputedStyle(document.documentElement);

  return Object.fromEntries(
    Object.entries(SCENE_COLOR_TOKENS).map(([key, token]) => [key, css.getPropertyValue(token).trim()]),
  ) as SceneColors;
};

const proxied = (event: ReactPointerEvent<HTMLCanvasElement>): ProxiedPointer => ({
  type: event.type as ProxiedPointer['type'],
  pointerId: event.pointerId,
  pointerType: event.pointerType,
  button: event.button,
  buttons: event.buttons,
  clientX: event.clientX,
  clientY: event.clientY,
  movementX: event.movementX,
  movementY: event.movementY,
  ctrlKey: event.ctrlKey,
  shiftKey: event.shiftKey,
  metaKey: event.metaKey,
  altKey: event.altKey,
});

const nextPaint = () => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * Тонкая обертка 3D-сцены над постером. После загрузки страницы: OffscreenCanvas с WebGL2 — рендер в воркере, иначе
 * постер до первого касания, клика или прокрутки, затем те же модули в главном потоке. Без WebGL и при обрыве
 * загрузки сцена остается постером, интерфейс работает. Режим — в `data-scene-mode`, сэмплы MSAA цели и предел
 * устройства — в `data-scene-samples`.
 */
export const Scene = ({
  lang,
  nodes,
  selection,
  hover,
  explain,
  onSelect,
  onHover,
  onCycle,
  onAnchors,
  onMode,
}: SceneProps) => {
  const texts = TEXTS[lang];
  const [mode, setMode] = useState<SceneMode>('poster');
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState<string | undefined>();
  const [canvasKey, setCanvasKey] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<SceneHost | null>(null);
  const anchors = useRef<NodeAnchor[]>([]);
  const hotspots = useRef(new Map<string, HTMLButtonElement>());
  const labels = useRef(new Map<string, number>());
  const width = useRef(0);
  const pointers = useRef(new Set<number>());
  const press = useRef<Press | null>(null);
  const hoverFrame = useRef(0);
  const sentFocus = useRef<string | null>(null);
  const sentExplain = useRef<SceneExplain | null>(null);
  const callbacks = useRef({ onSelect, onHover, onCycle, onAnchors, onMode });
  const on = mode !== 'poster';
  const focusKey = selection ? `${selection.node}:${selection.place ?? ''}` : null;

  useLayoutEffect(() => {
    callbacks.current = { onSelect, onHover, onCycle, onAnchors, onMode };
  });

  // ширины подписей читаются отдельным проходом до записи положений: чтение вперемешку с записью пересчитывает раскладку
  const measureLabels = () => {
    hotspots.current.forEach((button, id) => {
      labels.current.set(id, (button.lastElementChild as HTMLElement | null)?.offsetWidth ?? 0);
    });
  };

  // каждый кадр: только запись положений по кешу ширины сцены и подписей
  const placeHotspots = () => {
    if (anchors.current.some(({ id }) => hotspots.current.has(id) && !labels.current.has(id))) {
      measureLabels();
    }

    anchors.current.forEach(({ id, x, y, visible }) => {
      const button = hotspots.current.get(id);

      if (!button) {
        return;
      }

      const label = labels.current.get(id) ?? 0;

      button.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      button.dataset.visible = String(visible);
      button.dataset.side = x + HOTSPOT_LABEL.offset + label + HOTSPOT_LABEL.gap > width.current ? 'left' : 'right';
    });
  };

  useEffect(() => {
    const element = root.current;

    if (!element) {
      return;
    }

    let disposed = false;
    let started: 'worker' | 'main' = 'worker';
    let fallback = false;
    let timer = 0;

    const setup = (): SceneSetup => ({
      ...sizeOf(element),
      colors: readColors(),
      phone: window.matchMedia(PHONE_MEDIA).matches,
      reducedMotion: window.matchMedia(REDUCED_MOTION_MEDIA).matches,
    });

    const stop = () => {
      host.current?.dispose();
      host.current = null;
      pointers.current.clear();
      anchors.current = [];
      sentFocus.current = null;
      sentExplain.current = null;
      callbacks.current.onAnchors(null);
    };

    const onEvent = (event: SceneEvent) => {
      if (disposed) {
        return;
      }

      switch (event.type) {
        case 'ready':
          setMode(started);
          setSamples(event.samples);
          setLoading(false);
          break;
        case 'frame':
          anchors.current = event.anchors;
          placeHotspots();
          callbacks.current.onAnchors(event.anchors);
          break;
        case 'cycle':
          callbacks.current.onCycle(event.time);
          break;
        case 'picked':
          if (event.purpose === 'select') {
            if (event.hit) callbacks.current.onSelect(event.hit.id, event.hit.place);
          } else {
            if (canvas.current) canvas.current.style.cursor = event.hit ? 'pointer' : '';
            callbacks.current.onHover(event.hit?.id ?? null);
          }

          break;
        case 'unsupported':
          stop();
          setLoading(false);
          setMode('poster');

          if (started === 'worker' && !fallback) {
            fallback = true;
            setCanvasKey((key) => key + 1);
            void startOnAction();
          }

          break;
        case 'failed':
          console.error(event.message);
          stop();
          setLoading(false);
          setMode('poster');
          break;
      }
    };

    // без OffscreenCanvas с WebGL2 или после отказа воркера: постер до первого действия, затем главный поток
    async function startOnAction() {
      await waitForFirstAction(window);

      if (disposed || !supportsWebgl2()) {
        return;
      }

      await nextPaint();

      if (disposed || !canvas.current) {
        return;
      }

      started = 'main';
      setLoading(true);

      try {
        const created = await startMainScene(canvas.current, setup(), onEvent);

        if (disposed) {
          created.dispose();
        } else {
          host.current = created;
        }
      } catch (error) {
        console.error('3D-сцена не загрузилась', error);
        setLoading(false);
      }
    }

    const start = () => {
      if (pickStartMode() === 'interaction' || !canvas.current) {
        void startOnAction();

        return;
      }

      setLoading(true);

      try {
        host.current = startWorkerScene(canvas.current, setup(), onEvent);
      } catch {
        onEvent({ type: 'unsupported' });
      }
    };

    // после события load: постер — первый кадр и LCP, сцена его не задерживает
    const schedule = () => {
      timer = window.setTimeout(start, 0);
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, { once: true });
    }

    const resize = new ResizeObserver(() => {
      width.current = element.clientWidth;
      host.current?.send({ type: 'resize', ...sizeOf(element) });
    });

    resize.observe(element);

    return () => {
      disposed = true;
      window.clearTimeout(timer);
      window.removeEventListener('load', schedule);
      resize.disconnect();
      cancelAnimationFrame(hoverFrame.current);
      stop();
    };
    // сцена стартует один раз; выбор, объяснялки и обработчики приходят через refs и эффекты ниже
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    callbacks.current.onMode(mode);
  }, [mode]);

  // подписи меняются только с языком и узлами (и появляются вместе со сценой) — тогда же перемеряются
  useLayoutEffect(() => {
    labels.current.clear();
    measureLabels();
    placeHotspots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, lang, nodes]);

  useEffect(() => {
    if (!on || focusKey === sentFocus.current) {
      return;
    }

    if (selection) {
      host.current?.send({ type: 'focus', id: selection.node, place: selection.place });
    } else {
      host.current?.send({ type: 'overview' });
    }

    sentFocus.current = focusKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, focusKey]);

  useEffect(() => {
    if (!on || explain === sentExplain.current) {
      return;
    }

    if (explain?.kind === 'suspension') {
      host.current?.send({ type: 'suspension', ride: explain.ride });
    } else if (explain?.kind === 'chain') {
      host.current?.send({ type: 'chain', lag: explain.lag });
    } else {
      host.current?.send({ type: 'explainOff' });
    }

    sentExplain.current = explain;
  }, [on, explain]);

  const local = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const forward = (event: ReactPointerEvent<HTMLCanvasElement>, rect?: CanvasRect) => {
    if (mode === 'worker') {
      host.current?.send({ type: 'pointer', event: proxied(event), rect });
    }
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    press.current = { x: event.clientX, y: event.clientY, time: event.timeStamp };

    if (mode === 'worker') {
      event.currentTarget.setPointerCapture(event.pointerId);
      pointers.current.add(event.pointerId);
      forward(event, rectOf(event.currentTarget));
    }
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pointers.current.has(event.pointerId)) {
      forward(event);
    }

    if (event.pointerType !== 'mouse' || event.buttons) {
      return;
    }

    const { x, y } = local(event);

    cancelAnimationFrame(hoverFrame.current);
    hoverFrame.current = requestAnimationFrame(() => host.current?.send({ type: 'pick', purpose: 'hover', x, y }));
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (pointers.current.delete(event.pointerId)) {
      forward(event);
    }

    const start = press.current;

    press.current = null;

    if (
      event.type !== 'pointerup' ||
      !start ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > SCENE_CLICK.slop ||
      event.timeStamp - start.time > SCENE_CLICK.time
    ) {
      return;
    }

    host.current?.send({ type: 'pick', purpose: 'select', ...local(event) });
  };

  const hotspotState = (key: string) => {
    if (key === selection?.node) return 'active';
    if (key === hover) return 'hover';

    return selection ? 'dim' : 'idle';
  };

  return (
    <div
      className={styles.scene}
      ref={root}
      data-scene-mode={mode}
      data-scene-samples={samples}
    >
      <canvas
        key={canvasKey}
        className={styles.canvas}
        ref={canvas}
        aria-hidden="true"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => onHover(null)}
      />
      {on && (
        <div
          className={styles.hotspots}
          role="group"
          aria-label={texts.hero.nodesLabel}
        >
          {nodes.map((node) => (
            <button
              key={node.key}
              className={styles.hotspot}
              type="button"
              ref={(element) => {
                if (element) {
                  hotspots.current.set(node.key, element);
                } else {
                  hotspots.current.delete(node.key);
                }
              }}
              data-state={hotspotState(node.key)}
              aria-pressed={selection?.node === node.key}
              onClick={() => onSelect(node.key, anchors.current.find(({ id }) => id === node.key)?.place ?? null)}
              onPointerEnter={() => onHover(node.key)}
              onPointerLeave={() => onHover(null)}
            >
              <span
                className={styles.dot}
                aria-hidden="true"
              />
              <span className={styles.label}>{typeset(node.name, lang)}</span>
            </button>
          ))}
        </div>
      )}
      {on && <p className={styles.hint}>{texts.scene.hint}</p>}
      {loading && <p className={styles.hint}>{texts.scene.loading}</p>}
    </div>
  );
};
