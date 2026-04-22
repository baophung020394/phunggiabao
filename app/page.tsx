"use client";

import { motion } from "framer-motion";
import { HeroSection } from "@/components/sections/hero-section";
import { TechStackSection } from "@/components/sections/tech-stack-section";
import { ProjectsSection } from "@/components/sections/projects-section";
import { ExperienceSection } from "@/components/sections/experience-section";
import { ContactSection } from "@/components/sections/contact-section";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useUiStore } from "@/lib/store/zustand-store";

export default function HomePage() {
  const isNoiseEnabled = useUiStore((state) => state.isNoiseEnabled);
  const toggleNoise = useUiStore((state) => state.toggleNoise);

  return (
    <main className="relative min-h-screen overflow-hidden pb-8">
      {isNoiseEnabled && <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:3px_3px]" />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl"
      >
        <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
          <div className="container flex h-16 items-center justify-between">
            <a href="#top" className="text-sm font-bold tracking-widest text-primary">
              PGB.SYSTEMS
            </a>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleNoise}
                className="rounded-md border border-border bg-card/50 px-3 py-2 text-xs hover:border-primary"
              >
                Toggle FX
              </button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div id="top" className="pt-2">
          <HeroSection />
          <TechStackSection />
          <ProjectsSection />
          <ExperienceSection />
          <ContactSection />
        </div>
      </motion.div>
    </main>
  );
}
