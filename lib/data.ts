export type TechCategory = "All" | "Frontend" | "Backend" | "Database" | "DevOps" | "Web3";

export const techStack: Record<Exclude<TechCategory, "All">, string[]> = {
  Frontend: ["Next.js App Router", "React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Radix UI", "Framer Motion", "React Query"],
  Backend: ["Node.js", "NestJS", "REST APIs", "Microservices"],
  Database: ["PostgreSQL", "MongoDB", "Redis", "Drizzle ORM"],
  DevOps: ["Docker", "CI/CD", "Vercel", "New Relic", "EC2", "RDS", "Digital Ocean", "S3"],
  Web3: ["EVM Wallet Auth", "Smart Contract Integrations", "On-chain Data Visualization", "Privy"],
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
  featured?: boolean;
};

export const projects: Project[] = [
  {
    id: "tempelite",
    title: "TempElite",
    description:
      "Lead a 5-member team on a USA job marketplace connecting Facilities and Professionals, migrating MongoDB to PostgreSQL, redesigning tables, fixing bugs, and shipping notification features to production.",
    stack: ["Next.js", "React.js", "Node.js", "MongoDB", "PostgreSQL"],
    category: ["Frontend", "Backend", "Database"],
    demoUrl: "https://tempelite.com",
    githubUrl: "#",
    featured: true,
  },
  {
    id: "prediction-market",
    title: "Prediction Market",
    description: "Built a scalable Web3 prediction platform with wallet and Gmail auth, fast settlement flows, and real-time market updates.",
    stack: ["Next.js", "Node.js", "Drizzle ORM", "PostgreSQL", "Web3", "Docker"],
    category: ["Frontend", "Backend", "Database", "DevOps", "Web3"],
    demoUrl: "https://xmarket.app",
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

export type ExperienceTheme =
  | "blockchain"
  | "japan-outsource"
  | "korea-fintech"
  | "ewallet"
  | "vietnam-outsource"
  | "english-center";

export type Experience = {
  company: string;
  role: string;
  period: string;
  tags: string[];
  highlights: string[];
  techStack?: string;
  theme: ExperienceTheme;
};

export const experiences: Experience[] = [
  {
    company: "Lumberworks Limited",
    role: "Senior Software Engineer",
    period: "2025 - Present",
    tags: ["#Web3", "#Blockchain"],
    highlights: [
      "Developed a Prediction Market project built on Web3/Blockchain technology.",
      "Enabled users to register and access their accounts using either crypto wallets or Gmail-based authentication, then participate in market predictions directly on the platform.",
    ],
    techStack: "Next.js, Node.js, Drizzle ORM, PostgreSQL, S3, DigitalOcean, Web3/Blockchain",
    theme: "blockchain",
  },
  {
    company: "Rikkeisoft",
    role: "Senior Software Engineer",
    period: "2023 - 2025",
    tags: ["#Japan", "#Outsourcing"],
    highlights: [
      "Developed features for the Offline Engine system to apply discount codes for 7-Eleven stores during internet outages, and synchronized discount-code updates back to the cloud once connectivity was restored based on the Node.js, MongoDB, IoT MQTT, and S3 codebase in Hawaii, USA.",
      "Participated in the Master Data Management System project by troubleshooting and fixing issues in a React.js codebase while collaborating with the 7-Eleven USA India team.",
    ],
    theme: "japan-outsource",
  },
  {
    company: "WAVE ASEAN",
    role: "Senior Software Engineer",
    period: "2021 - 2023",
    tags: ["#Fintech", "#Korea"],
    highlights: [
      "Built projects from scratch using React.js and successfully delivered 2 projects for employee and user information management for the Moa Group Chat system, including channel, group, and 1:1 chat functionalities.",
      "Maintained and developed additional small tasks for the Java Spring Boot 3 project, and successfully delivered the video call feature for the IRROM project from Korea.",
      "Participated in discussions, development, and successful delivery of the Angular 9 project for weekly breakfast and lunch orders for company staff at Korea.",
      "Involved in fixing UI bugs for web and mobile, and developing additional features for the company’s big data security project.",
      "Discussed and ideated with designers about UX/UI to make appropriate adjustments for the projects.",
      "Established the Scrum model for the team, managed and assigned tasks, and provided training for team members.",
      "Reported all work to the CEO and CTO daily.",
    ],
    techStack: "React.js, Java Spring Boot 3",
    theme: "korea-fintech",
  },
  {
    company: "One Mount Consumer",
    role: "Senior Software Engineer",
    period: "2019 - 2021",
    tags: ["#VinID", "#E-Wallet"],
    highlights: [
      "Successfully delivered the Q&A game event project for the VinID e-wallet based on React.js.",
      "Responsible for converting UI from Figma and discussing adjustments with the design team to ensure UX/UI alignment.",
      "Participated in fixing UI bugs on iOS and Android devices.",
    ],
    techStack: "React.js, Node.js, Firebase",
    theme: "ewallet",
  },
  {
    company: "SmartOSC",
    role: "Junior Developer",
    period: "2017 - 2019",
    tags: ["#Vietnam", "#Outsourcing"],
    highlights: [
      "Responsible for slicing interfaces from Figma, Zeplin, and Adobe XD files for the company’s e-commerce projects on CMS platforms such as Sitecore and Magento 2.",
      "Fixed UI and responsive bugs.",
    ],
    techStack: "HTML, CSS, JavaScript, Sitecore, Magento 2",
    theme: "vietnam-outsource",
  },
  {
    company: "Apollo English",
    role: "Web Developer",
    period: "2015 - 2017",
    tags: ["#Education", "#English"],
    highlights: [
      "Participated in and developed the UI for the company’s SugarCRM system using PHP.",
      "Responsible for training the company’s admin, sales, and teaching staff on the SugarCRM system.",
      "Managed data import and supervised interns during the data import/export process for the system transition from C# to SugarCRM.",
    ],
    techStack: "PHP, SugarCRM",
    theme: "english-center",
  },
];
