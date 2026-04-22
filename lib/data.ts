export type TechCategory = "All" | "Frontend" | "Backend" | "Database" | "DevOps" | "Web3";

export const techStack: Record<Exclude<TechCategory, "All">, string[]> = {
  Frontend: ["Next.js App Router", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Radix UI", "Framer Motion"],
  Backend: ["Node.js", "NestJS", "REST APIs", "Microservices", "React Query"],
  Database: ["PostgreSQL", "MongoDB", "Redis", "Drizzle ORM"],
  DevOps: ["Docker", "CI/CD", "Vercel", "New Relic"],
  Web3: ["EVM Wallet Auth", "Smart Contract Integrations", "On-chain Data Visualization"],
};

export const categories: TechCategory[] = ["All", "Frontend", "Backend", "Database", "DevOps", "Web3"];

export type Project = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  category: Exclude<TechCategory, "All">[];
  demoUrl: string;
  githubUrl: string;
};

export const projects: Project[] = [
  {
    id: "prediction-market",
    title: "Prediction Market",
    description: "Built a scalable Web3 prediction platform with wallet and Gmail auth, fast settlement flows, and real-time market updates.",
    stack: ["Next.js", "Node.js", "Drizzle ORM", "PostgreSQL", "Web3", "Docker"],
    category: ["Frontend", "Backend", "Database", "DevOps", "Web3"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "offline-engine",
    title: "7-Eleven Offline Engine",
    description: "Engineered an offline-first promotion system to keep stores operational during outages and synchronize cloud state once connected.",
    stack: ["React", "Node.js", "MongoDB", "Redis", "Docker"],
    category: ["Frontend", "Backend", "Database", "DevOps"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "master-data-platform",
    title: "Master Data Management Platform",
    description: "Developed data workflows for high-volume retail operations with resilient APIs, role-based controls, and observability-first architecture.",
    stack: ["React", "Node.js", "PostgreSQL", "Redis", "NestJS"],
    category: ["Frontend", "Backend", "Database"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "viral-profit",
    title: "America - Viral Profit",
    description: "Built online course commerce flows including quizzes, checkout, video learning, refunds, booking calendars, and Slack API integrations.",
    stack: ["React", "Node.js", "PostgreSQL", "Vercel", "Render"],
    category: ["Frontend", "Backend", "Database", "DevOps"],
    demoUrl: "https://www.viralprofits.yt",
    githubUrl: "#",
  },
  {
    id: "pacificwide-crm",
    title: "America - Pacificwide CRM",
    description: "Developed real estate CRM features such as lead import/export, email sync with Outlook/Gmail, and Firebase push notifications.",
    stack: ["Next.js", "NestJS", "PostgreSQL", "AWS", "Firebase"],
    category: ["Frontend", "Backend", "Database", "DevOps"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "open-chatting",
    title: "Open Chatting - WAVE ASEAN",
    description: "Delivered a community chat platform with channels, groups, booking support, and chatbot scripting in a lead fullstack role.",
    stack: ["React", "Redux", "Redux Toolkit", "TypeScript", "Webpack", "Java Spring Boot"],
    category: ["Frontend", "Backend"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "irroom-video-meeting",
    title: "IRROOM - WAVE ASEAN",
    description: "Implemented multi-user video meeting features using WebSocket and Kurento media server for investor and presenter rooms.",
    stack: ["Java Spring Boot", "MySQL", "WebSocket", "Kurento"],
    category: ["Backend", "Database"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "moa-group",
    title: "MOA Group - WAVE ASEAN",
    description: "Built a management dashboard for employees, members, channels, and payment workflows in a scalable chat ecosystem.",
    stack: ["React", "Redux Saga", "Redux Toolkit", "TypeScript", "Webpack", "Java Spring Boot", "WebSocket"],
    category: ["Frontend", "Backend"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "qa-vinid-game",
    title: "Q&A Game - One Mount",
    description: "Developed VinID event game features with API integrations, automated tests, and end-to-end release ownership.",
    stack: ["React", "Redux", "Node.js", "Firebase", "Jest"],
    category: ["Frontend", "Backend", "DevOps"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "urbanfox-ecommerce",
    title: "Urbanfox E-commerce",
    description: "Maintained and enhanced long-term e-commerce frontend systems with responsive support across devices.",
    stack: ["Magento 2", "Less", "GruntJS"],
    category: ["Frontend"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "mystays-hotel",
    title: "Mystays Hotel",
    description: "Delivered booking hotel website features, sliced Figma-based UI, and coordinated frontend-backend integration.",
    stack: ["SCSS", "Node.js", "Webpack", "Sitecore"],
    category: ["Frontend", "Backend"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    id: "asus-ecommerce",
    title: "ASUS E-commerce",
    description: "Implemented responsive commerce pages, fixed UX bugs, and shipped iterative feature updates in a Magento 2 stack.",
    stack: ["Magento 2", "Less", "JavaScript"],
    category: ["Frontend"],
    demoUrl: "#",
    githubUrl: "#",
  },
];

export const experiences = [
  { company: "Lumberworks Limited", role: "Senior Software Engineer", period: "2025 - Present" },
  { company: "Rikkeisoft", role: "Senior Software Engineer", period: "2023 - 2025" },
  { company: "WAVE ASEAN", role: "Senior Software Engineer", period: "2021 - 2023" },
  { company: "One Mount Consumer", role: "Senior Software Engineer", period: "2019 - 2021" },
  { company: "SmartOSC", role: "Junior Developer", period: "2017 - 2019" },
  { company: "Apollo English", role: "Web Developer", period: "2015 - 2017" },
];
