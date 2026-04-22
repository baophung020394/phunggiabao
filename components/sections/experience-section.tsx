"use client";

import { motion } from "framer-motion";
import { experiences } from "@/lib/data";

export function ExperienceSection() {
  return (
    <section className="mx-auto mt-20 max-w-5xl px-4">
      <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Experience Timeline</h2>
      <div className="relative border-l border-primary/40 pl-6">
        {experiences.map((item, idx) => (
          <motion.div
            key={`${item.company}-${item.period}`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            className="relative mb-8"
          >
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]" />
            <p className="text-xs uppercase tracking-wide text-primary">{item.period}</p>
            <h3 className="text-lg font-semibold">{item.role}</h3>
            <p className="text-sm text-muted-foreground">{item.company}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
