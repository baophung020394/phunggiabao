```
+----------------------------------------------------------------------------------------+
|  TARGET: Personal Portfolio (CREATIVE: Portfolio) - CREATIVE STUDIO VARIANT           |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PATTERN: Hero-Centric + Storytelling-Driven + Interactive Product Demo               |
|     Conversion: Visual-first narrative proving Frontend + Three.js impact in 5-10 sec |
|     CTA: Above fold ("Explore Projects"), repeated after featured interactive demo     |
|     Sections:                                                                          |
|       1. Hero (positioning + interactive Three.js teaser + clear technical signature)  |
|       2. Signature Work (3-5 high-impact projects with measurable outcomes)            |
|       3. Interactive Lab (WebGL/Three.js experiments with production lessons)          |
|       4. Systems Thinking (full-stack, backend, architecture, design system)           |
|       5. Collaboration CTA                                                             |
|                                                                                        |
|  STYLE: Bento Box Grid + Motion-Driven + Interactive Cursor Design                     |
|     Keywords: Dynamic composition, spatial layering, controlled motion, modern creative|
|     Best For: Recruiters hiring frontend/creative engineers with deep execution skills |
|     Performance: High (3D budgeted with graceful degradation) | Accessibility: WCAG AA |
|                                                                                        |
|  COLORS:                                                                               |
|     Primary:    #3B82F6 (Bright Tech Blue)                                             |
|     Secondary:  #14B8A6 (Cyan Teal)                                                    |
|     Accent:     #A855F7 (Creative Violet)                                              |
|     Highlight:  #F59E0B (Signal Amber)                                                 |
|     Background: #070B14 (Near-Black Navy)                                              |
|     Text:       #F3F4F6 (Light Neutral)                                                |
|     Notes: Keep high contrast, reserve accent for CTAs and interaction states only     |
|                                                                                        |
|  TYPOGRAPHY: Space Grotesk / Sora                                                      |
|     Mood: Creative-tech, bold, forward-looking                                         |
|     Best For: Interactive portfolio storytelling + technical readability                |
|     Google Fonts: https://fonts.google.com/share?selection.family=Space+Grotesk:wght@ |
|                   500;600;700|Sora:wght@400;500;600;700                                |
|                                                                                        |
|  KEY EFFECTS:                                                                          |
|     Three.js hero scene + layered parallax + magnetic hover + route transitions        |
|     (180-300ms) + Motion timeline reveals + progressive enhancement by device tier     |
|                                                                                        |
|  STACK-SPECIFIC IMPLEMENTATION NOTES:                                                  |
|     React+Vite: split heavy 3D bundles with dynamic import and route-level lazy loading|
|     React Router DOM: animated page transitions + persistent nav + project deep links  |
|     React Hook Form: accessible contact form with schema validation + inline errors    |
|     Motion: animate intent (state/flow), not decoration; honor reduced-motion always   |
|     Lucide React: consistent icon sizing/stroke, paired with text labels where needed  |
|     Tailwind CSS: tokenized spacing/type/color scales; avoid arbitrary one-off values  |
|     shadcn/ui: compose primitives for cards/dialogs/forms with consistent variants      |
|                                                                                        |
|  CONTENT PRIORITY:                                                                     |
|     Primary strengths first: Frontend engineering, Three.js production delivery         |
|     Secondary strengths visible in proof: backend APIs, architecture, design systems    |
|     Personal info minimal: short bio + concise contact, keep spotlight on project value |
|                                                                                        |
|  PROJECT CARD SPEC (for Signature Work):                                               |
|     Must include: role, problem, stack, architecture decision, measurable result        |
|     Metrics examples: conversion uplift, load-time reduction, engagement increase       |
|                                                                                        |
|  AVOID (Anti-patterns):                                                                |
|     Effect overload + unreadable contrast + animation competing with content hierarchy  |
|     + long biography before projects + generic case studies without outcomes            |
|     + unoptimized WebGL startup causing slow first meaningful paint                     |
|                                                                                        |
|  PRE-DELIVERY CHECKLIST:                                                               |
|     [ ] First viewport communicates Frontend + Three.js value immediately               |
|     [ ] At least 1 featured project shows real Three.js production impact              |
|     [ ] Each project card includes role, stack, challenge, architecture, result         |
|     [ ] Full-stack/backend/design-system depth is present but secondary to frontend     |
|     [ ] Routing and transitions preserve context and feel intentional                    |
|     [ ] Forms are validated, keyboard-friendly, and screen-reader understandable         |
|     [ ] Motion is meaningful, subtle, and disabled/reduced when user requests it        |
|     [ ] WebGL fallback exists for unsupported/low-power devices                         |
|     [ ] Contrast, focus states, and semantic landmarks satisfy accessibility checks      |
|     [ ] Performance budgets verified (LCP/CLS/INP), assets optimized, code split        |
|     [ ] Responsive QA passed at 375px, 768px, 1024px, 1440px                            |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```