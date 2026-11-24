"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Briefcase, Building2, GraduationCap, Landmark, Wallet, Waves } from "lucide-react";
import { experiences, type ExperienceTheme } from "@/lib/data";
import { ExperienceModel3D } from "@/components/experience/experience-model-3d";
import { cn } from "@/lib/utils";

const themeIcon: Record<ExperienceTheme, typeof Briefcase> = {
  blockchain: Building2,
  "japan-outsource": Landmark,
  "korea-fintech": Waves,
  ewallet: Wallet,
  "vietnam-outsource": Briefcase,
  "english-center": GraduationCap,
};

/** Horizontal zigzag amplitude — keep in sync with node `translate` classes below.
 *  Keep this smaller than half the column gap so the curve stays in the center gutter. */
const ZIGZAG_OFFSET = 32;

type PathPoint = { x: number; y: number };

/** Build a base360-style zigzag path: vertical runs + cubic S-curves that swap sides. */
function buildZigzagPath(points: PathPoint[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dy = curr.y - prev.y;

    if (Math.abs(prev.x - curr.x) < 1) {
      parts.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    // Vertical hold, then S-curve into the opposite side (base360 pattern).
    const hold = Math.max(dy * 0.28, 36);
    const curveStartY = prev.y + hold;
    const curveEndY = curr.y - Math.max(dy * 0.18, 24);
    const c1y = curveStartY + (curveEndY - curveStartY) * 0.45;
    const c2y = curveStartY + (curveEndY - curveStartY) * 0.55;

    parts.push(`L ${prev.x} ${curveStartY}`);
    parts.push(`C ${prev.x} ${c1y}, ${curr.x} ${c2y}, ${curr.x} ${curveEndY}`);
    parts.push(`L ${curr.x} ${curr.y}`);
  }

  return parts.join(" ");
}

export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const nodeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pathRef = useRef<SVGPathElement>(null);
  const progressPathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [pathD, setPathD] = useState("");
  const [pathLength, setPathLength] = useState(0);
  const [trackSize, setTrackSize] = useState({ width: 0, height: 0 });
  const [lightBgByTheme, setLightBgByTheme] = useState<Partial<Record<ExperienceTheme, boolean>>>({});

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 65%", "end 35%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.001,
  });

  const measurePath = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const trackRect = track.getBoundingClientRect();
    const width = track.clientWidth;
    const height = track.scrollHeight;
    setTrackSize({ width, height });

    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const centerX = width / 2;
    const offset = isDesktop ? ZIGZAG_OFFSET : 0;

    const points: PathPoint[] = nodeRefs.current.map((node, idx) => {
      if (!node) {
        return { x: centerX + (idx % 2 === 0 ? -offset : offset), y: 80 + idx * 280 };
      }
      const rect = node.getBoundingClientRect();
      const y = rect.top - trackRect.top + rect.height / 2;
      const x = isDesktop ? centerX + (idx % 2 === 0 ? -offset : offset) : 16;
      return { x, y };
    });

    // Extend slightly past first/last nodes so the curve doesn't clip.
    if (points.length) {
      points.unshift({ x: points[0].x, y: Math.max(0, points[0].y - 48) });
      const last = points[points.length - 1];
      points.push({ x: last.x, y: Math.min(height, last.y + 48) });
    }

    const d = buildZigzagPath(points);
    setPathD(d);

    // Length is measured after path paints.
    requestAnimationFrame(() => {
      const len = pathRef.current?.getTotalLength() ?? 0;
      setPathLength(len);
    });
  }, []);

  useLayoutEffect(() => {
    measurePath();
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => measurePath());
    ro.observe(track);
    window.addEventListener("resize", measurePath);
    // Remeasure after fonts/3D canvases settle.
    const t = window.setTimeout(measurePath, 400);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measurePath);
      window.clearTimeout(t);
    };
  }, [measurePath]);

  useEffect(() => {
    const nodes = itemRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (!visible[0]) return;
        const idx = Number((visible[0].target as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) setActiveIndex(idx);
      },
      { threshold: [0.35, 0.55, 0.75], rootMargin: "-20% 0px -35% 0px" },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const applyProgress = useCallback(
    (value: number) => {
      const len = pathLength || pathRef.current?.getTotalLength() || 0;
      if (!len) return;

      const drawn = len * Math.min(1, Math.max(0, value));
      const offset = len - drawn;

      if (progressPathRef.current) {
        progressPathRef.current.style.strokeDasharray = `${len}`;
        progressPathRef.current.style.strokeDashoffset = `${offset}`;
      }
      if (glowPathRef.current) {
        glowPathRef.current.style.strokeDasharray = `${len}`;
        glowPathRef.current.style.strokeDashoffset = `${offset}`;
      }

      const path = pathRef.current;
      const marker = markerRef.current;
      if (path && marker) {
        const pt = path.getPointAtLength(drawn);
        marker.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
      }
    },
    [pathLength],
  );

  useMotionValueEvent(smoothProgress, "change", applyProgress);

  useEffect(() => {
    applyProgress(smoothProgress.get());
  }, [applyProgress, pathD, pathLength, smoothProgress]);

  return (
    <section ref={sectionRef} id="experience" className="relative mx-auto mt-24 w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-14 max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">Career path</p>
        <h2 className="text-2xl font-bold sm:text-3xl">Experience Timeline</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Scroll through each milestone — the path lights up as you move, with a themed 3D scene for every company.
        </p>
      </div>

      <div ref={trackRef} className="relative">
        {/* Zigzag SVG track (base360-style S-curves) */}
        <svg
          className="pointer-events-none absolute left-0 top-0 z-0 hidden overflow-visible md:block"
          width={trackSize.width || "100%"}
          height={trackSize.height || "100%"}
          aria-hidden
        >
          <defs>
            <linearGradient id="exp-line-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(188 100% 55%)" />
              <stop offset="50%" stopColor="hsl(199 100% 65%)" />
              <stop offset="100%" stopColor="hsl(188 100% 50%)" />
            </linearGradient>
            <filter id="exp-line-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Dashed guide */}
          <path
            ref={pathRef}
            d={pathD}
            fill="none"
            stroke="hsl(var(--primary) / 0.22)"
            strokeWidth="2"
            strokeDasharray="2 12"
            strokeLinecap="round"
          />

          {/* Soft glow progress */}
          <path
            ref={glowPathRef}
            d={pathD}
            fill="none"
            stroke="url(#exp-line-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.22"
            filter="url(#exp-line-glow)"
            style={{ strokeDasharray: pathLength || 1, strokeDashoffset: pathLength || 1 }}
          />

          {/* Solid progress */}
          <path
            ref={progressPathRef}
            d={pathD}
            fill="none"
            stroke="url(#exp-line-gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ strokeDasharray: pathLength || 1, strokeDashoffset: pathLength || 1 }}
          />
        </svg>

        {/* Mobile straight fallback track */}
        <div className="pointer-events-none absolute bottom-8 left-4 top-8 w-px md:hidden">
          <div className="absolute inset-0 border-l border-dashed border-primary/25" />
        </div>

        {/* Marker traveling along the path */}
        <div
          ref={markerRef}
          className="pointer-events-none absolute left-0 top-0 z-20 hidden h-9 w-9 items-center justify-center rounded-full border border-primary/60 bg-background shadow-[0_0_22px_hsl(var(--primary)/0.45)] md:flex"
          style={{ transform: "translate(-9999px, -9999px)" }}
        >
          {(() => {
            const Icon = themeIcon[experiences[activeIndex]?.theme ?? "blockchain"];
            return <Icon className="h-4 w-4 text-primary" />;
          })()}
        </div>

        <div className="relative z-10 space-y-20 md:space-y-28">
          {experiences.map((item, idx) => {
            const isLeftText = idx % 2 === 0;
            const isActive = activeIndex === idx;
            const isPassed = idx < activeIndex;
            const Icon = themeIcon[item.theme];

            const textBlock = (
              <div
                className={cn(
                  "relative z-10 transition-all duration-500",
                  isActive ? "opacity-100 translate-y-0" : "opacity-55 translate-y-2",
                  isLeftText ? "md:pr-10 lg:pr-16 md:text-right" : "md:pl-10 lg:pl-16 md:text-left",
                  "pl-10 md:pl-0",
                )}
              >

                <div
                  className={cn(
                    "mb-3 flex flex-wrap gap-2",
                    isLeftText ? "md:justify-end" : "md:justify-start",
                  )}
                >
                  {item.tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-primary/80">
                      {tag}
                    </span>
                  ))}
                </div>
                <p
                  className={cn(
                    "text-xs uppercase tracking-[0.18em] transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.period}
                </p>
                <h3
                  className={cn(
                    "mt-2 text-xl font-semibold transition-colors sm:text-2xl",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.role}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary/90">{item.company}</p>
                <ul
                  className={cn(
                    "mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground",
                    isLeftText ? "md:ml-auto md:max-w-xl" : "md:max-w-xl",
                  )}
                >
                  {item.highlights.map((point) => (
                    <li
                      key={point.slice(0, 48)}
                      className="relative pl-3 text-left before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-primary/70"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
                {item.techStack && (
                  <p
                    className={cn(
                      "mt-3 text-xs leading-relaxed text-primary/80",
                      isLeftText ? "md:ml-auto md:max-w-xl" : "md:max-w-xl",
                    )}
                  >
                    <span className="font-semibold text-foreground/80">Tech stack: </span>
                    {item.techStack}
                  </p>
                )}
                <p
                  className={cn(
                    "mt-4 font-mono text-xs transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground/70",
                  )}
                >
                  {String(idx + 1).padStart(2, "0")} / {String(experiences.length).padStart(2, "0")}
                </p>
              </div>
            );

            const needsLightBg = Boolean(lightBgByTheme[item.theme]);

            const visualBlock = (
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl border transition-all duration-500",
                  needsLightBg
                    ? isActive
                      ? "border-primary/45 bg-[#eef3f8] shadow-[0_0_40px_hsl(var(--primary)/0.16)]"
                      : "border-slate-300/80 bg-[#e8eef5]"
                    : isActive
                      ? "border-primary/50 bg-card/70 shadow-[0_0_40px_hsl(var(--primary)/0.18)]"
                      : "border-border/60 bg-card/40",
                  "ml-10 md:ml-0",
                  // Keep cards clear of the center path gutter.
                  isLeftText ? "md:ml-2 lg:ml-4" : "md:mr-2 lg:mr-4",
                )}
              >
                {!needsLightBg && (
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.12),transparent_55%)]" />
                )}
                <ExperienceModel3D
                  theme={item.theme}
                  active={isActive}
                  className="relative h-56 w-full sm:h-64 md:h-72"
                  onNeedsLightBg={(needs) => {
                    setLightBgByTheme((prev) =>
                      prev[item.theme] === needs ? prev : { ...prev, [item.theme]: needs },
                    );
                  }}
                />
                <div
                  className={cn(
                    "absolute bottom-3 left-3 flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] backdrop-blur",
                    needsLightBg
                      ? "border-slate-300/80 bg-white/85 text-slate-700"
                      : "border-border/60 bg-background/70",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className={needsLightBg ? "text-slate-700" : "text-muted-foreground"}>
                    {item.company}
                  </span>
                </div>
              </div>
            );

            return (
              <div
                key={`${item.company}-${item.period}`}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                data-index={idx}
                className="relative grid items-center gap-8 md:grid-cols-2 md:gap-36 lg:gap-48 xl:gap-56"
              >
                {/* Node sits on the zigzag lane (alternating sides of center) */}
                <span
                  ref={(el) => {
                    nodeRefs.current[idx] = el;
                  }}
                  className={cn(
                    "absolute top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all duration-300",
                    "left-4 -translate-x-1/2 md:left-1/2",
                    idx % 2 === 0
                      ? "md:-translate-x-[calc(50%+32px)]"
                      : "md:translate-x-[calc(-50%+32px)]",
                    isActive || isPassed
                      ? "border-primary bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.7)] scale-110"
                      : "border-primary/40 bg-background",
                  )}
                  aria-hidden
                >
                  {(isActive || isPassed) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </span>

                {isLeftText ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.45 }}
                    >
                      {textBlock}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.45, delay: 0.05 }}
                    >
                      {visualBlock}
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.45 }}
                      className="md:order-1"
                    >
                      {visualBlock}
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.35 }}
                      transition={{ duration: 0.45, delay: 0.05 }}
                      className="md:order-2"
                    >
                      {textBlock}
                    </motion.div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
