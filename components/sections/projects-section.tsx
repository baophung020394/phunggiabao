"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ExternalLink, Filter, Github } from "lucide-react";
import { categories, projects } from "@/lib/data";
import { useAppDispatch, useAppSelector, setCategory } from "@/lib/store/redux-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function fetchProjects() {
  return Promise.resolve(projects);
}

export function ProjectsSection() {
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => state.filters.activeCategory);
  const { data = [] } = useQuery({ queryKey: ["projects"], queryFn: fetchProjects });

  const filtered = useMemo(() => {
    if (active === "All") return data;
    return data.filter((project) => project.category.includes(active));
  }, [active, data]);

  return (
    <section id="projects" className="mx-auto mt-20 max-w-6xl px-4">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold sm:text-3xl">Featured Projects</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={active === category ? "default" : "outline"}
              size="default"
              onClick={() => dispatch(setCategory(category))}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((project, idx) => {
          const card = (
            <Card
              className={
                project.featured
                  ? "group h-full border-transparent bg-card shadow-none hover:border-transparent hover:shadow-none"
                  : "group h-full"
              }
            >
              <h3 className="text-lg font-semibold">{project.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <a className="inline-flex items-center gap-1 text-sm text-primary" href={project.demoUrl} target="_blank">
                  Live Demo <ExternalLink className="h-4 w-4" />
                </a>
                <a className="inline-flex items-center gap-1 text-sm text-primary" href={project.githubUrl} target="_blank" >
                  GitHub <Github className="h-4 w-4" />
                </a>
              </div>
            </Card>
          );

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: idx * 0.08, duration: 0.35 }}
              whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
            >
              {project.featured ? <div className="border-light h-full">{card}</div> : card}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
