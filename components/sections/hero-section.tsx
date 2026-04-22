"use client";

import { motion } from "framer-motion";
import { ArrowRight, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="mx-auto max-w-5xl px-4 text-center"
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-card/50 px-4 py-2 text-xs uppercase tracking-[0.25em] text-primary">
          <TerminalSquare className="h-3.5 w-3.5 animate-pulse-neon" />
          Software Engineer Portfolio
        </p>
        <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
          Phung Gia Bao
          <span className="block bg-gradient-to-r from-cyan-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            Building scalable systems & modern web experiences
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Senior Software Engineer focused on high-performance frontend architecture, resilient backend services, and real-world product delivery.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#projects">
              View Projects <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="#contact">Contact Me</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
