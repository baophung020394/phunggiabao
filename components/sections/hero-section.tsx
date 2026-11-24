"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileInfoGrid } from "@/components/profile-info-grid";

const Avatar3DPortrait = dynamic(
  () => import("@/components/avatar-3d-portrait").then((mod) => mod.Avatar3DPortrait),
  { ssr: false },
);

function Avatar3DCard() {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });

  return (
    <motion.div
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mx-auto flex w-full max-w-md flex-col items-center"
    >
      <div
        className="relative h-72 w-72 rounded-full border border-primary/50 bg-gradient-to-br from-cyan-400/25 via-violet-500/20 to-emerald-400/25 p-2 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setPointer({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseLeave={() => setPointer({ x: 50, y: 50 })}
      >
        <div className="relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-slate-950/80 shadow-[inset_0_0_60px_rgba(34,211,238,0.22)]">
          <Avatar3DPortrait className="absolute inset-0" pointer={pointer} />
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 16%, transparent 42%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-cyan-300/20" />
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Interactive Avatar - move cursor to control 3D tilt</p>
    </motion.div>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2 lg:items-center"
      >
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-primary">
            <TerminalSquare className="h-3.5 w-3.5 animate-pulse-neon" />
            Software Engineer
          </p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Phung Gia Bao
            <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Building scalable systems & modern web experiences
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Senior Software Engineer focused on high-performance frontend architecture, resilient backend services, and real-world product delivery.
          </p>

          <ProfileInfoGrid className="mt-6" />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#projects">
                View Projects <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#contact">Contact Me</a>
            </Button>
          </div>
        </div>
        <Avatar3DCard />
      </motion.div>
    </section>
  );
}
