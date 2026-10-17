'use client';

import { CSSProperties, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

export interface DriftWallItem {
  image: string;
  title?: string;
  href?: string;
}

export interface DriftWallProps {
  items?: DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: 'up' | 'down';
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
  style?: CSSProperties;
}

interface ColumnMeta {
  copyHeight: number;
  copies: number;
}

const DEVICON_CDN =
  'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

const DEFAULT_ITEMS: DriftWallItem[] = [
  { image: `${DEVICON_CDN}/python/python-original.svg`, title: 'Python' },
  { image: `${DEVICON_CDN}/javascript/javascript-original.svg`, title: 'JavaScript' },
  { image: `${DEVICON_CDN}/typescript/typescript-original.svg`, title: 'TypeScript' },
  { image: `${DEVICON_CDN}/react/react-original.svg`, title: 'React' },
  { image: `${DEVICON_CDN}/nextjs/nextjs-original.svg`, title: 'Next.js' },
  { image: `${DEVICON_CDN}/rust/rust-original.svg`, title: 'Rust' },
  { image: `${DEVICON_CDN}/go/go-original.svg`, title: 'Go' },
  { image: `${DEVICON_CDN}/nodejs/nodejs-original.svg`, title: 'Node.js' },
  { image: `${DEVICON_CDN}/tailwindcss/tailwindcss-original.svg`, title: 'Tailwind' },
  { image: `${DEVICON_CDN}/docker/docker-original.svg`, title: 'Docker' },
  { image: `${DEVICON_CDN}/fastapi/fastapi-original.svg`, title: 'FastAPI' },
  { image: `${DEVICON_CDN}/kotlin/kotlin-original.svg`, title: 'Kotlin' },
  { image: `${DEVICON_CDN}/swift/swift-original.svg`, title: 'Swift' },
  { image: `${DEVICON_CDN}/cplusplus/cplusplus-original.svg`, title: 'C++' },
  { image: `${DEVICON_CDN}/graphql/graphql-plain.svg`, title: 'GraphQL' },
  { image: `${DEVICON_CDN}/postgresql/postgresql-original.svg`, title: 'PostgreSQL' },
  { image: `${DEVICON_CDN}/vuejs/vuejs-original.svg`, title: 'Vue' },
  { image: `${DEVICON_CDN}/svelte/svelte-original.svg`, title: 'Svelte' },
  { image: `${DEVICON_CDN}/ruby/ruby-original.svg`, title: 'Ruby' },
  { image: `${DEVICON_CDN}/java/java-original.svg`, title: 'Java' },
  { image: `${DEVICON_CDN}/csharp/csharp-original.svg`, title: 'C#' },
  { image: `${DEVICON_CDN}/elixir/elixir-original.svg`, title: 'Elixir' },
  { image: `${DEVICON_CDN}/flutter/flutter-original.svg`, title: 'Flutter' },
  { image: `${DEVICON_CDN}/pytorch/pytorch-original.svg`, title: 'PyTorch' },
  { image: `${DEVICON_CDN}/tensorflow/tensorflow-original.svg`, title: 'TensorFlow' },
  { image: `${DEVICON_CDN}/mongodb/mongodb-original.svg`, title: 'MongoDB' },
  { image: `${DEVICON_CDN}/kubernetes/kubernetes-plain.svg`, title: 'Kubernetes' },
  { image: `${DEVICON_CDN}/redis/redis-original.svg`, title: 'Redis' },
  { image: `${DEVICON_CDN}/php/php-original.svg`, title: 'PHP' },
  { image: `${DEVICON_CDN}/angular/angular-original.svg`, title: 'Angular' },
  { image: `${DEVICON_CDN}/zig/zig-original.svg`, title: 'Zig' },
  { image: `${DEVICON_CDN}/bun/bun-original.svg`, title: 'Bun' },
  { image: `${DEVICON_CDN}/vitejs/vitejs-original.svg`, title: 'Vite' },
  { image: `${DEVICON_CDN}/astro/astro-original.svg`, title: 'Astro' },
  { image: `${DEVICON_CDN}/supabase/supabase-original.svg`, title: 'Supabase' },
  { image: `${DEVICON_CDN}/linux/linux-original.svg`, title: 'Linux' },
  { image: `${DEVICON_CDN}/git/git-original.svg`, title: 'Git' },
  { image: `${DEVICON_CDN}/scala/scala-original.svg`, title: 'Scala' },
  { image: `${DEVICON_CDN}/haskell/haskell-original.svg`, title: 'Haskell' },
  { image: `${DEVICON_CDN}/dart/dart-original.svg`, title: 'Dart' },
  { image: `${DEVICON_CDN}/lua/lua-original.svg`, title: 'Lua' },
  { image: `${DEVICON_CDN}/html5/html5-original.svg`, title: 'HTML5' },
  { image: `${DEVICON_CDN}/css3/css3-original.svg`, title: 'CSS3' },
  { image: `${DEVICON_CDN}/wasm/wasm-original.svg`, title: 'Wasm' },
  { image: `${DEVICON_CDN}/apachekafka/apachekafka-original.svg`, title: 'Kafka' },
  { image: `${DEVICON_CDN}/electron/electron-original.svg`, title: 'Electron' },
  { image: `${DEVICON_CDN}/mysql/mysql-original.svg`, title: 'MySQL' },
  { image: `${DEVICON_CDN}/django/django-plain.svg`, title: 'Django' },
  { image: `${DEVICON_CDN}/flask/flask-original.svg`, title: 'Flask' },
];

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const columnFactor = (index: number, variance: number): number => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

export const DriftWall = ({
  items = DEFAULT_ITEMS,
  columns = 12,
  tileWidth = 175,
  tileHeight = 105,
  gap = 16,
  radius = 12,
  tilt = 12,
  turn = -10,
  roll = 0,
  perspective = 1100,
  depth = 80,
  speed = 34,
  direction = 'up',
  variance = 0.4,
  parallax = 0.5,
  pauseOnHover = false,
  lift = 48,
  fade = 0.25,
  dim = 0.85,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
  style
}: DriftWallProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);

  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef<number>(-1);
  const wallHoveredRef = useRef<boolean>(false);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);

  const [containerHeight, setContainerHeight] = useState(700);
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(prefersReducedMotion());
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Guarantee every column receives a distinct, non-repetitive sequence of items
  const columnItems = useMemo<DriftWallItem[][]>(() => {
    const list = items && items.length > 0 ? items : DEFAULT_ITEMS;
    const itemsPerCol = Math.max(8, Math.ceil(list.length / columns) + 4);
    return Array.from({ length: columns }, (_, colIdx) => {
      const colList: DriftWallItem[] = [];
      const step = 7; // prime offset to disperse logos evenly
      for (let i = 0; i < itemsPerCol; i++) {
        const itemIdx = (colIdx * step + i * 3) % list.length;
        colList.push(list[itemIdx]);
      }
      return colList;
    });
  }, [items, columns]);

  const columnMeta = useMemo<ColumnMeta[]>(() => {
    const unit = tileHeight + gap;
    return columnItems.map(col => {
      const copyHeight = Math.max(unit, col.length * unit);
      const copies = Math.max(3, Math.ceil((containerHeight * 2.4) / copyHeight) + 2);
      return { copyHeight, copies };
    });
  }, [columnItems, tileHeight, gap, containerHeight]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 700);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const baseVelocities = useMemo<number[]>(() => {
    const dirSign = direction === 'up' ? 1 : -1;
    return columnItems.map((_, c) => {
      const altSign = c % 2 === 0 ? 1 : -1;
      return speed * columnFactor(c, variance) * dirSign * altSign;
    });
  }, [columnItems, speed, direction, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, c) => meta.copyHeight * ((c * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnMeta, columnItems]);

  const applyPlaneTransform = useCallback(
    (px: number, py: number) => {
      const plane = planeRef.current;
      if (!plane) return;
      plane.style.transform =
        `translate(-50%, -50%) scale(1.55) ` +
        `rotateX(${tilt + py}deg) rotateY(${turn + px}deg) rotateZ(${roll}deg) ` +
        `translateZ(${-depth}px)`;
    },
    [tilt, turn, roll, depth]
  );

  useEffect(() => {
    let isVisible = false;

    const animate = (ts: number) => {
      if (!isVisible) {
        rafRef.current = null;
        lastTsRef.current = null;
        return;
      }

      if (lastTsRef.current === null) lastTsRef.current = ts;
      const dt = Math.min(0.05, Math.max(0, ts - lastTsRef.current) / 1000);
      lastTsRef.current = ts;

      const maxTilt = parallax * 8;
      const targetX = pointerRef.current.x * maxTilt;
      const targetY = -pointerRef.current.y * maxTilt;
      const damp = 1 - Math.exp(-dt / 0.12);

      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp;
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp;

      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

      if (!reduced) {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const meta = columnMeta[c];
          if (!meta) continue;

          const paused = wallHoveredRef.current && pauseOnHover;
          const factor = paused || hoveredColRef.current === c ? 0 : 1;
          const target = baseVelocities[c] * factor;

          const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
          velocitiesRef.current[c] += (target - velocitiesRef.current[c]) * ease;

          let next = (offsetsRef.current[c] ?? 0) + velocitiesRef.current[c] * dt;
          next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
          offsetsRef.current[c] = next;

          const el = trackRefs.current[c];
          if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
        }
      } else {
        for (let c = 0; c < trackRefs.current.length; c++) {
          const el = trackRefs.current[c];
          const meta = columnMeta[c];
          if (el && meta) {
            el.style.transform = `translate3d(0, ${-(offsetsRef.current[c] ?? 0)}px, 0)`;
          }
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    const container = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = Boolean(entry?.isIntersecting);
        if (!wasVisible && isVisible && !rafRef.current) {
          lastTsRef.current = null;
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0 }
    );

    if (container) {
      observer.observe(container);
    }

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform]);

  const activate = useCallback((id: string, index: number): void => {
    activeIdRef.current = id;
    hoveredColRef.current = index;
    setActiveId(id);
  }, []);

  const release = useCallback((): void => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (parallax > 0 && !reduced) {
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width - 0.5,
          y: (e.clientY - rect.top) / rect.height - 0.5
        };
      }

      const hit = document.elementFromPoint(e.clientX, e.clientY);
      const tile = hit && hit.closest ? (hit.closest('[data-tile-id]') as HTMLElement | null) : null;

      if (!tile) return;

      const id = tile.dataset.tileId ?? null;
      if (id === activeIdRef.current) return;

      activeIdRef.current = id;
      hoveredColRef.current = Number(tile.dataset.col);
      setActiveId(id);
    },
    [parallax, reduced]
  );

  const handlePointerLeaveWall = useCallback((): void => {
    wallHoveredRef.current = false;
    pointerRef.current = { x: 0, y: 0 };
    release();
  }, [release]);

  const maskStyle =
    fade > 0
      ? `radial-gradient(ellipse 94% 94% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)`
      : undefined;

  const cssVars = useMemo<CSSProperties>(() => {
    const vars: Record<string, any> = {
      '--dw-tile-w': `${tileWidth}px`,
      '--dw-tile-h': `${tileHeight}px`,
      '--dw-gap': `${gap}px`,
      '--dw-radius': `${radius}px`,
      '--dw-lift': `${lift}px`,
      '--dw-dim': dim,
      '--dw-gray': grayscale ? 1 : 0,
      '--dw-overlay': overlayColor,
      perspective: `${perspective}px`,
      perspectiveOrigin: '50% 50%',
      ...style,
    };
    if (maskStyle) {
      vars.WebkitMaskImage = maskStyle;
      vars.maskImage = maskStyle;
    }
    return vars as CSSProperties;
  }, [tileWidth, tileHeight, gap, radius, lift, dim, grayscale, overlayColor, perspective, maskStyle, style]);

  const tileClass = cx(
    'group/tile relative block flex-none cursor-pointer outline-none',
    'w-full h-[calc(var(--dw-tile-h)+var(--dw-gap))] [transform-style:preserve-3d]'
  );

  const innerClass = cx(
    'pointer-events-none absolute inset-[calc(var(--dw-gap)/2)] flex flex-col items-center justify-center p-3 overflow-hidden bg-[#161822]/90 border border-white/[0.12] backdrop-blur-md shadow-lg',
    'rounded-[var(--dw-radius)] opacity-[var(--dw-dim)] [transform:translateZ(0)]',
    'transition-[transform,opacity,box-shadow,border-color] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:opacity-100 group-[.is-active]/tile:border-[#C084FC]/60 group-[.is-active]/tile:[transform:translateZ(var(--dw-lift))]',
    'group-[.is-active]/tile:shadow-[0_20px_45px_-8px_rgba(168,85,247,0.4)]',
    'group-focus-visible/tile:opacity-100 group-focus-visible/tile:[transform:translateZ(var(--dw-lift))]',
    'group-focus-visible/tile:shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7),0_0_0_2px_rgba(255,255,255,0.9)]'
  );

  const imgClass = cx(
    'block h-9 w-9 sm:h-10 sm:w-10 select-none object-contain drop-shadow-md',
    '[filter:grayscale(var(--dw-gray))_saturate(0.95)]',
    'transition-[filter,transform] duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:[filter:grayscale(0)_saturate(1.15)] group-[.is-active]/tile:scale-110 group-focus-visible/tile:[filter:grayscale(0)_saturate(1.15)]'
  );

  const overlayClass = cx(
    'pointer-events-none absolute inset-0 bg-[var(--dw-overlay)] opacity-[0.22]',
    'transition-opacity duration-[360ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
    'group-[.is-active]/tile:opacity-0 group-focus-visible/tile:opacity-0'
  );

  const renderTile = (item: DriftWallItem, id: string, colIndex: number) => {
    const inner = (
      <span className={innerClass}>
        <div className="relative flex items-center justify-center mb-1">
          <img
            src={item.image}
            alt={item.title ?? ''}
            loading="lazy"
            decoding="async"
            draggable={false}
            className={imgClass}
          />
        </div>
        {item.title && (
          <span className="text-[10.5px] font-mono font-semibold text-[#E2E8F0]/90 tracking-wider uppercase truncate max-w-full">
            {item.title}
          </span>
        )}
        <span className={overlayClass} aria-hidden="true" />
      </span>
    );

    const commonProps = {
      className: cx(tileClass, activeId === id && 'is-active'),
      'data-tile-id': id,
      'data-col': colIndex,
      onFocus: () => activate(id, colIndex),
      onBlur: release
    };

    if (item.href) {
      return (
        <a key={id} href={item.href} target="_blank" rel="noreferrer noopener" {...commonProps}>
          {inner}
        </a>
      );
    }

    return (
      <div key={id} tabIndex={0} role="button" aria-label={item.title ?? 'tile'} {...commonProps}>
        {inner}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cx('relative h-full w-full overflow-hidden', className)}
      style={cssVars}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => {
        wallHoveredRef.current = true;
      }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-label="Drifting wall of tiles"
    >
      <div
        ref={planeRef}
        className="absolute left-1/2 top-1/2 flex cursor-pointer flex-row [transform-style:preserve-3d] [transform-origin:50%_50%] will-change-transform"
      >
        {columnItems.map((col, c) => {
          const meta = columnMeta[c];
          const copies = Array.from({ length: meta.copies });

          return (
            <div
              className="relative w-[calc(var(--dw-tile-w)+var(--dw-gap))] [transform-style:preserve-3d]"
              key={`col-${c}`}
            >
              <div
                className="flex flex-col [transform-style:preserve-3d] will-change-transform"
                ref={el => {
                  trackRefs.current[c] = el;
                }}
              >
                {copies.map((_, copyIndex) =>
                  col.map((item, itemIndex) =>
                    renderTile(
                      item,
                      `${c}-${copyIndex}-${itemIndex}`,
                      c
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DriftWall;
