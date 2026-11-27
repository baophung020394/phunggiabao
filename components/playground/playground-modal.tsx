"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { ExternalLink, Github, MapPin, X } from "lucide-react";
import type { SteleMarker } from "@/lib/playground-data";
import { playgroundMaps } from "@/lib/playground-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FeaturedProjectsScene = dynamic(
  () =>
    import("@/components/playground/featured-projects-scene").then(
      (mod) => mod.FeaturedProjectsScene,
    ),
  { ssr: false },
);

type PlaygroundModalProps = {
  open: boolean;
  onClose: () => void;
};

function ProjectPopup3D({
  stele,
  onClose,
}: {
  stele: SteleMarker;
  onClose: () => void;
}) {
  const { project } = stele;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss project popup"
        className="pointer-events-auto absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="pointer-events-auto relative w-full max-w-lg origin-center"
        style={{
          perspective: "1200px",
        }}
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-cyan-950/80 p-6 shadow-[0_0_60px_rgba(34,211,238,0.28)]"
          style={{
            transform: "rotateX(8deg) rotateY(-6deg)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-70"
            style={{
              background:
                "linear-gradient(135deg, rgba(34,211,238,0.55), transparent 42%, rgba(167,139,250,0.35))",
              transform: "translateZ(-1px)",
            }}
          />
          <div className="relative" style={{ transform: "translateZ(28px)" }}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">
                  Featured Projects · Stele
                </p>
                <h3 className="mt-1 text-2xl font-bold text-white">{project.title}</h3>
              </div>
              <Button type="button" variant="ghost" size="default" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{project.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.stack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {project.demoUrl !== "#" && (
                <a
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Live Demo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {project.githubUrl !== "#" && (
                <a
                  className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub <Github className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="mt-5 text-xs text-slate-500">Esc or click outside to close · keep driving with arrows</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlaygroundModal({ open, onClose }: PlaygroundModalProps) {
  const [mounted, setMounted] = useState(false);
  const [nearby, setNearby] = useState<SteleMarker | null>(null);
  const [activeStele, setActiveStele] = useState<SteleMarker | null>(null);
  const [interactRequestId, setInteractRequestId] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setNearby(null);
      setActiveStele(null);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Escape") return;
      event.preventDefault();
      if (activeStele) {
        setActiveStele(null);
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activeStele, onClose]);

  const handleNearby = useCallback((stele: SteleMarker | null) => {
    setNearby(stele);
  }, []);

  const handleInteract = useCallback((stele: SteleMarker) => {
    setActiveStele(stele);
  }, []);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex h-[100dvh] w-screen flex-col bg-[#0b1220]">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="pointer-events-auto rounded-xl border border-cyan-400/25 bg-slate-950/70 px-4 py-3 backdrop-blur-md">
          <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80">District</p>
          <h2 className="text-lg font-semibold text-white">Featured Projects</h2>
          <p className="mt-1 max-w-xs text-xs text-slate-400">
            Drive with arrow keys · approach a stele · press Enter
          </p>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} aria-label="Close playground">
            <X className="mr-2 h-4 w-4" />
            Exit
          </Button>
          <div className="hidden rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400 sm:block">
            {playgroundMaps.map((map) => (
              <div key={map.id} className="flex items-center gap-2 py-0.5">
                <MapPin className={`h-3 w-3 ${map.status === "ready" ? "text-cyan-300" : "text-slate-600"}`} />
                <span className={map.status === "ready" ? "text-slate-200" : "text-slate-500"}>
                  {map.label}
                  {map.status === "planned" ? " · soon" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <FeaturedProjectsScene
        onNearbySteleChange={handleNearby}
        interactRequestId={interactRequestId}
        onInteract={handleInteract}
      />

      {nearby && !activeStele && (
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex justify-center px-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-cyan-300/35 bg-slate-950/80 px-5 py-4 text-center shadow-[0_0_40px_rgba(34,211,238,0.2)] backdrop-blur-md">
            <p className="text-sm text-cyan-50">
              Near <span className="font-semibold text-cyan-300">{nearby.project.title}</span>
            </p>
            <Button
              type="button"
              className="pointer-events-auto"
              onClick={() => {
                setInteractRequestId((id) => id + 1);
                setActiveStele(nearby);
              }}
            >
              Press Enter · View project
            </Button>
          </div>
        </div>
      )}

      {activeStele && <ProjectPopup3D stele={activeStele} onClose={() => setActiveStele(null)} />}
    </div>,
    document.body,
  );
}
