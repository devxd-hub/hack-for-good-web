import React, { useState, useEffect, useRef, HTMLAttributes } from 'react';

const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface GalleryItem {
  common: string;
  binomial: string;
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
  cardWidth?: number;
  cardHeight?: number;
}

const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius = 380,
      autoRotateSpeed = 0.04,
      cardWidth = 240,
      cardHeight = 330,
      ...props
    },
    forwardedRef
  ) => {
    const localContainerRef = useRef<HTMLDivElement | null>(null);
    const sceneRef = useRef<HTMLDivElement | null>(null);

    // Physics & rotation refs for maximum frame rate
    const currentRotationRef = useRef(0);
    const velocityRef = useRef(0);
    const isDraggingRef = useRef(false);
    const lastPointerXRef = useRef(0);
    const lastPointerTimeRef = useRef(0);
    const tiltRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    const anglePerItem = 360 / items.length;

    // Attach non-blocking wheel listener to container so page scrolling is never frozen
    useEffect(() => {
      const container = localContainerRef.current;
      if (!container) return;

      const handleWheel = (e: WheelEvent) => {
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        velocityRef.current += delta * 0.015;
      };

      container.addEventListener('wheel', handleWheel, { passive: true });

      return () => {
        container.removeEventListener('wheel', handleWheel);
      };
    }, []);

    // Main Animation Loop with IntersectionObserver to avoid background CPU/GPU usage
    useEffect(() => {
      let animId: number = 0;
      let isVisible = false;

      const updateLoop = () => {
        if (!isVisible) {
          animId = 0;
          return;
        }

        // Apply ambient auto-rotation
        currentRotationRef.current += autoRotateSpeed;

        // Apply velocity with friction damping
        if (Math.abs(velocityRef.current) > 0.001) {
          currentRotationRef.current += velocityRef.current;
          velocityRef.current *= 0.92; // smooth friction deceleration
        } else {
          velocityRef.current = 0;
        }

        // Smoothly lerp 3D parallax tilt towards cursor target
        tiltRef.current.x += (tiltRef.current.targetX - tiltRef.current.x) * 0.08;
        tiltRef.current.y += (tiltRef.current.targetY - tiltRef.current.y) * 0.08;

        // Direct DOM update on 3D scene container
        if (sceneRef.current) {
          const rotY = ((currentRotationRef.current % 360) + 360) % 360;
          const tiltX = tiltRef.current.x;
          const tiltY = tiltRef.current.y;

          sceneRef.current.style.transform = `rotateX(${tiltX}deg) rotateY(${rotY + tiltY}deg)`;

          // Smoothly adjust card opacity without breaking 3D preserve-3d sorting
          const cards = sceneRef.current.children;
          for (let i = 0; i < cards.length; i++) {
            const card = cards[i] as HTMLElement;
            const itemAngle = i * anglePerItem;
            const relativeAngle = (itemAngle + rotY) % 360;
            const normalizedAngle = Math.abs(
              relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
            );

            // Front cards (facing the user) are bright and clear; rear cards fade smoothly
            const opacity = Math.max(0.25, 1 - (normalizedAngle / 180) * 0.9);
            card.style.opacity = String(opacity);
          }
        }

        animId = requestAnimationFrame(updateLoop);
      };

      const container = localContainerRef.current;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (!wasVisible && isVisible && !animId) {
              animId = requestAnimationFrame(updateLoop);
            }
          });
        },
        { threshold: 0 }
      );

      if (container) {
        observer.observe(container);
      }

      return () => {
        observer.disconnect();
        if (animId) cancelAnimationFrame(animId);
        animId = 0;
      };
    }, [autoRotateSpeed, anglePerItem]);

    // Enhanced Mouse & Pointer Drag Scrubbing
    const handlePointerDown = (e: React.PointerEvent) => {
      isDraggingRef.current = true;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = performance.now();
      velocityRef.current = 0;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      const container = localContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        tiltRef.current.targetX = -normY * 8;
        tiltRef.current.targetY = normX * 10;
      }

      if (!isDraggingRef.current) return;

      const now = performance.now();
      const deltaX = e.clientX - lastPointerXRef.current;
      const deltaTime = Math.max(now - lastPointerTimeRef.current, 1);

      currentRotationRef.current += -deltaX * 0.45;
      velocityRef.current = (-deltaX / deltaTime) * 5;

      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      isDraggingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    };

    const handleMouseLeave = () => {
      isDraggingRef.current = false;
      tiltRef.current.targetX = 0;
      tiltRef.current.targetY = 0;
    };

    return (
      <div
        ref={(el) => {
          localContainerRef.current = el;
          if (typeof forwardedRef === 'function') forwardedRef(el);
          else if (forwardedRef) (forwardedRef as any).current = el;
        }}
        role="region"
        aria-label="Circular 3D NGO Carousel"
        className={cn(
          "relative w-full h-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing",
          className
        )}
        style={{ perspective: '2200px', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* 3D Scene Root */}
        <div
          ref={sceneRef}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
          }}
        >
          {items.map((item, i) => {
            const itemAngle = i * anglePerItem;

            return (
              <div
                key={item.photo.url + i}
                role="group"
                aria-label={item.common}
                className="absolute pointer-events-auto"
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                  left: '50%',
                  top: '50%',
                  marginLeft: `-${cardWidth / 2}px`,
                  marginTop: `-${cardHeight / 2}px`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="relative w-full h-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden group border border-[rgba(241,238,231,0.14)] bg-[#171A1D] transition-all duration-300 hover:border-[#FF2A85]/80 hover:shadow-[0_0_35px_rgba(255,42,133,0.4)] flex items-center justify-center">
                  {/* Subtle blurred ambient backdrop to fill non-square ratios seamlessly */}
                  <img
                    src={item.photo.url}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-40 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-black/35 pointer-events-none" />

                  {/* Primary sharp, uncropped image */}
                  <img
                    src={item.photo.url}
                    alt={item.photo.text || item.common}
                    className="relative z-10 w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: item.photo.pos || 'center' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  {/* Subtle glass reflection highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

CircularGallery.displayName = 'CircularGallery';

export { CircularGallery };
