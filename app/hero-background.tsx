"use client";

import { useEffect, useRef } from "react";
import { assetPath } from "./asset-path";

type BackgroundVariant = "cells" | "skyline";
type Cell = {
  x: number;
  y: number;
  depth: number;
  radius: number;
  opacity: number;
  speed: number;
  phase: number;
  sprite: number;
};

function seededRandom(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Concentric gradients keep every particle perfectly circular at every depth.
// Cache the three focus levels so animation only needs drawImage, also in Safari.
function createCellSprite(softness: number) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = 96;
  const context = sprite.getContext("2d");
  if (!context) return sprite;
  const radius = 28;
  const outerRadius = radius + softness * 3;
  context.beginPath();
  context.arc(48, 48, outerRadius, 0, Math.PI * 2);
  const body = context.createRadialGradient(48, 48, 0, 48, 48, outerRadius);
  body.addColorStop(0, "rgba(224,224,224,.9)");
  body.addColorStop((radius - softness * 2) / outerRadius, "rgba(224,224,224,.84)");
  body.addColorStop(radius / outerRadius, "rgba(224,224,224,.42)");
  body.addColorStop((radius + softness * 1.5) / outerRadius, "rgba(224,224,224,.08)");
  body.addColorStop(1, "rgba(224,224,224,0)");
  context.fillStyle = body;
  context.fill();
  return sprite;
}

function makeCells(width: number, height: number, scale: number): Cell[] {
  const random = seededRandom(831207);
  const groups = Array.from({ length: 62 }, () => ({ x: random(), y: random(), depth: .12 + random() * .86 }));
  const count = Math.min(1200, Math.max(380, Math.round(width * height / (scale * scale * 460))));
  return Array.from({ length: count }, () => {
    const group = groups[Math.floor(random() * groups.length)];
    const clustered = random() < .54;
    const depth = Math.max(.08, Math.min(.98, clustered ? group.depth + (random() - .5) * .15 : random()));
    const focus = depth < .25 ? 1 : depth > .8 ? 2 : 0;
    return {
      x: clustered ? (group.x + (random() - .5) * .11 + 1) % 1 : random(),
      y: clustered ? (group.y + (random() - .5) * .12 + 1) % 1 : random(),
      depth,
      radius: (2.2 + 11 * Math.pow(depth, 1.2)) * (.8 + random() * .4),
      opacity: (.52 + random() * .38) * (focus === 0 ? 1 : .72),
      speed: .65 + random() * .7,
      phase: random() * Math.PI * 2,
      sprite: focus,
    };
  }).sort((a, b) => a.depth - b.depth);
}

export default function HeroBackground({ variant = "cells", motionEnabled }: { variant?: BackgroundVariant; motionEnabled: boolean }) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motionRef = useRef(motionEnabled);
  const syncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    motionRef.current = motionEnabled;
    syncRef.current?.();
  }, [motionEnabled]);

  useEffect(() => {
    const background = backgroundRef.current;
    const canvas = canvasRef.current;
    const hero = background?.closest<HTMLElement>(".hero");
    if (variant !== "cells" || !background || !canvas || !hero) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      background.dataset.ready = "true";
      return;
    }

    const sprites = [1, 3, 5].map(createCellSprite);
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, active: false, influence: 0 };
    let width = 1;
    let height = 1;
    let scale = 1;
    let ratio = 1;
    let cells: Cell[] = [];
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let disposed = false;

    const paint = () => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.globalAlpha = 1;
      context.fillStyle = "#000000";
      context.fillRect(0, 0, width, height);
      const margin = 90 * scale;
      const fieldWidth = width + margin * 2;
      const fieldHeight = height + margin * 2;
      const cursorX = (pointer.x + .5) * width;
      const cursorY = (pointer.y + .5) * height;
      for (const cell of cells) {
        const drift = elapsed * cell.speed * scale * 2.7;
        let x = ((cell.x * fieldWidth - drift * (1.4 + cell.depth * 2.6)) % fieldWidth + fieldWidth) % fieldWidth - margin;
        let y = (cell.y * fieldHeight + drift * .65) % fieldHeight - margin;
        x += Math.sin(elapsed * .2 + cell.phase) * 5 * scale;
        y += Math.cos(elapsed * .16 + cell.phase) * 6 * scale;
        x += pointer.x * 48 * cell.depth;
        y += pointer.y * 34 * cell.depth;
        if (pointer.influence > .001) {
          const dx = x - cursorX;
          const dy = y - cursorY;
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - distance / (155 * scale));
          const displacement = influence * influence * 12 * cell.depth * pointer.influence;
          x += dx / Math.max(1, distance) * displacement;
          y += dy / Math.max(1, distance) * displacement;
        }
        const radius = cell.radius * scale;
        const size = radius * 3.3;
        context.globalAlpha = cell.opacity;
        context.drawImage(sprites[cell.sprite], x - size / 2, y - size / 2, size, size);
      }
      context.globalAlpha = 1;
      if (background.dataset.ready !== "true") background.dataset.ready = "true";
    };

    const tick = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden || !motionRef.current) return;
      if (lastTime && now - lastTime < 1000 / (finePointer.matches ? 60 : 30) - .5) {
        frame = requestAnimationFrame(tick);
        return;
      }
      const delta = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now;
      elapsed += delta;
      const easing = 1 - Math.exp(-delta * 4.5);
      pointer.x += (pointer.targetX - pointer.x) * easing;
      pointer.y += (pointer.targetY - pointer.y) * easing;
      pointer.influence += ((pointer.active ? 1 : 0) - pointer.influence) * easing;
      paint();
      frame = requestAnimationFrame(tick);
    };

    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!motionRef.current) {
        pointer.x = pointer.y = pointer.targetX = pointer.targetY = 0;
        pointer.active = false;
        pointer.influence = 0;
        paint();
      }
      if (visible && !document.hidden && motionRef.current && !disposed) frame = requestAnimationFrame(tick);
    };
    syncRef.current = syncPlayback;

    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const nextRatio = Math.min(window.devicePixelRatio || 1, 1.5, Math.sqrt(2_500_000 / (nextWidth * nextHeight)));
      if (nextWidth === width && nextHeight === height && nextRatio === ratio && cells.length) return;
      width = nextWidth;
      height = nextHeight;
      ratio = nextRatio;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      scale = Math.max(.72, Math.min(1.65, Math.sqrt(width * height / (900 * 540))));
      cells = makeCells(width, height, scale);
      paint();
    };
    const pointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !finePointer.matches || !motionRef.current) return;
      const bounds = hero.getBoundingClientRect();
      pointer.targetX = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / width - .5));
      pointer.targetY = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / height - .5));
      pointer.active = true;
    };
    const pointerLeave = () => {
      pointer.targetX = pointer.targetY = 0;
      pointer.active = false;
    };
    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    resize();
    resizeObserver.observe(hero);
    visibilityObserver.observe(hero);
    hero.addEventListener("pointermove", pointerMove, { passive: true });
    hero.addEventListener("pointerleave", pointerLeave);
    document.addEventListener("visibilitychange", syncPlayback);
    window.addEventListener("resize", resize, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      syncRef.current = null;
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      hero.removeEventListener("pointermove", pointerMove);
      hero.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", syncPlayback);
      window.removeEventListener("resize", resize);
      delete background.dataset.ready;
    };
  }, [variant]);

  if (variant === "skyline") return <><div className="hero-image" style={{ backgroundImage: `url("${assetPath("/hero-nyc-blue-hour.png")}")` }} aria-hidden="true" /><div className="hero-shade" aria-hidden="true" /></>;

  return (
    <div ref={backgroundRef} className="hero-cell-background" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-cells" />
      <div className="hero-cell-shade" />
    </div>
  );
}
