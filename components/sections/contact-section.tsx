"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ContactSection() {
  return (
    <section id="contact" className="mx-auto mt-20 max-w-5xl px-4 pb-16">
      <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Contact</h2>
      <Card className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xl font-semibold">Let&apos;s build something impactful.</h3>
          <p className="text-sm text-muted-foreground">Available for senior frontend/fullstack engineering opportunities and architecture-focused product work.</p>
          <div className="flex gap-3">
            <a href="https://github.com/baophung020394" className="rounded-md border border-border p-2 hover:border-primary">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com/in/phunggiabao" className="rounded-md border border-border p-2 hover:border-primary">
              <Linkedin className="h-4 w-4" />
            </a>
            <a href="mailto:bao.future94@gmail.com" className="rounded-md border border-border p-2 hover:border-primary">
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>
        <form className="space-y-3">
          <Input placeholder="Your name" />
          <Input type="email" placeholder="Your email" />
          <Textarea placeholder="Your message" />
          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </Card>
    </section>
  );
}
