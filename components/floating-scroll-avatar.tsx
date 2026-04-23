"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileInfoGrid } from "@/components/profile-info-grid";

const SCROLL_START = 20;
const SCROLL_END = 300;
const PANEL_THRESHOLD = 0.94;
const HERO_AVATAR_ID = "hero-avatar-orb";

type RectState = {
  left: number;
  top: number;
  size: number;
};

export function FloatingScrollAvatar() {
  const [scrollY, setScrollY] = useState(0);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [sourceRect, setSourceRect] = useState<RectState | null>(null);

  const measureSource = useCallback(() => {
    if (typeof window === "undefined") return;
    const element = document.getElementById(HERO_AVATAR_ID);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    setSourceRect({ left: rect.left, top: rect.top, size: rect.width });
  }, []);

  const onScroll = useCallback(() => {
    setScrollY(typeof window !== "undefined" ? window.scrollY : 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setViewport({ width: window.innerWidth, height: window.innerHeight });
    measureSource();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const resizeHandler = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      measureSource();
    };
    window.addEventListener("resize", resizeHandler);

    const raf = window.requestAnimationFrame(() => {
      measureSource();
      onScroll();
    });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [measureSource, onScroll]);

  useEffect(() => {
    if (scrollY < SCROLL_START + 8) {
      measureSource();
    }
  }, [measureSource, scrollY]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const progress = useMemo(() => {
    const ratio = (scrollY - SCROLL_START) / (SCROLL_END - SCROLL_START);
    return Math.min(1, Math.max(0, ratio));
  }, [scrollY]);

  useEffect(() => {
    const element = document.getElementById(HERO_AVATAR_ID);
    if (!element) return;

    const sourceOpacity = Math.max(0, 1 - progress * 1.15);
    element.style.opacity = `${sourceOpacity}`;
    element.style.pointerEvents = sourceOpacity < 0.05 ? "none" : "auto";

    return () => {
      element.style.opacity = "1";
      element.style.pointerEvents = "auto";
    };
  }, [progress]);

  const rightOffset = viewport.width >= 640 ? 24 : 16;
  const targetRect = useMemo<RectState>(
    () => ({
      left: Math.max(8, viewport.width - rightOffset - 40),
      top: Math.max(8, viewport.height / 2 - 20),
      size: 40,
    }),
    [rightOffset, viewport.height, viewport.width],
  );

  const baseRect = sourceRect ?? targetRect;
  const currentRect = useMemo<RectState>(
    () => ({
      left: baseRect.left + (targetRect.left - baseRect.left) * progress,
      top: baseRect.top + (targetRect.top - baseRect.top) * progress,
      size: baseRect.size + (targetRect.size - baseRect.size) * progress,
    }),
    [baseRect.left, baseRect.size, baseRect.top, progress, targetRect.left, targetRect.size, targetRect.top],
  );

  const isInteractive = progress > PANEL_THRESHOLD;

  return (
    <motion.div
      style={{
        left: currentRect.left,
        top: currentRect.top,
        width: currentRect.size,
        height: currentRect.size,
        opacity: progress,
      }}
      className="fixed z-[60]"
      onMouseEnter={() => isInteractive && setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <motion.button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="flex h-full w-full cursor-pointer items-center justify-center rounded-full border border-primary/50 bg-gradient-to-br from-cyan-400/30 via-violet-500/25 to-emerald-400/20 p-0.5 shadow-[0_0_20px_hsl(var(--primary)/0.35)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span
          className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-slate-900/90 font-black leading-none tracking-tight text-cyan-300"
          style={{ fontSize: Math.max(10, currentRect.size * 0.24) }}
        >
          PGB
        </span>
      </motion.button>

      <AnimatePresence>
        {hoverOpen && isInteractive && (
          <motion.div
            initial={{ opacity: 0, x: 12, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-[calc(100%+10px)] top-1/2 w-[min(calc(100vw-5.5rem),360px)] -translate-y-1/2 rounded-xl border border-primary/40 bg-card/95 shadow-[0_0_40px_hsl(var(--primary)/0.15)] backdrop-blur-xl"
          >
            <ProfileInfoGrid compact singleColumn className="p-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
