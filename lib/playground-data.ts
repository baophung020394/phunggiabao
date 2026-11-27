import { projects, type Project } from "@/lib/data";

export type PlaygroundDistrictId = "featured-projects" | "experience" | "skills";

export type PlaygroundMap = {
  id: PlaygroundDistrictId;
  label: string;
  mapUrl: string;
  status: "ready" | "planned";
  source: string;
};

export const playgroundMaps: PlaygroundMap[] = [
  {
    id: "featured-projects",
    label: "Featured Projects",
    mapUrl: "/models/maps/portfolio-map.glb",
    status: "ready",
    source: "Custom portfolio-map.glb (Spawn_Car + Project_01..13)",
  },
  {
    id: "experience",
    label: "Experience District",
    mapUrl: "/models/maps/experience-office.glb",
    status: "planned",
    source: "Pixel Modern Office — 3DAssets.dev",
  },
  {
    id: "skills",
    label: "Skills Tech Lab",
    mapUrl: "/models/maps/skills-tech-lab.glb",
    status: "planned",
    source: "Robots & Drones Kit — 3DAssets.dev",
  },
];

export type SteleMarker = {
  id: string;
  index: number;
  anchorName: string;
  modelUrl: string;
  project: Project;
};

const STELE_FILES = [
  "01-tempelite.glb",
  "02-prediction-market.glb",
  "03-7-eleven-offline-engine.glb",
  "04-master-data-management-platform.glb",
  "05-america-viral-profit.glb",
  "06-america-pacificwide-crm.glb",
  "07-open-chatting-wave-asean.glb",
  "08-irroom-wave-asean.glb",
  "09-moa-group-wave-asean.glb",
  "10-qa-game-one-mount.glb",
  "11-urbanfox-ecommerce.glb",
  "12-mystays-hotel.glb",
  "13-asus-ecommerce.glb",
] as const;

/** Ordered project cards → Project_01 … Project_13 on portfolio-map.glb */
export const featuredProjectSteles: SteleMarker[] = STELE_FILES.map((file, index) => {
  const project = projects[index];
  return {
    id: project?.id ?? `stele-${index + 1}`,
    index,
    anchorName: `Project_${String(index + 1).padStart(2, "0")}`,
    modelUrl: `/models/stele/${file}`,
    project,
  };
}).filter((stele): stele is SteleMarker => Boolean(stele.project));

export const CAR_MODEL_URL = "/models/rigged-car.glb";
export const FEATURED_PROJECTS_MAP_URL = "/models/maps/portfolio-map.glb";
export const VEGETATION_KIT_URL = "/models/maps/vegetation.glb";
export const STREET_PROPS_KIT_URL = "/models/maps/street-props.glb";
export const PROJECT_DISPLAY_URL = "/models/maps/project-display.glb";

export const SPAWN_CAR_NODE = "Spawn_Car";
export const CARD_MOUNT_NODE = "Card_Mount";
export const STELE_INTERACT_RADIUS = 4.2;
