"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { techStack } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function TechStackSection() {
  return (
    <section id="stack" className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-8 flex items-center gap-2">
        <Cpu className="h-5 w-5 text-primary" />
        <h2 className="text-2xl font-bold sm:text-3xl">Tech Stack</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(techStack).map(([category, items], idx) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
          >
            <Card className="h-full">
              <h3 className="mb-3 text-lg font-semibold text-primary">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <Badge key={item} className="hover:bg-primary/25">
                    {item}
                  </Badge>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
