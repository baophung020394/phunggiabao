"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  CARD_MOUNT_NODE,
  CAR_MODEL_URL,
  FEATURED_PROJECTS_MAP_URL,
  PROJECT_DISPLAY_URL,
  SPAWN_CAR_NODE,
  STELE_INTERACT_RADIUS,
  STREET_PROPS_KIT_URL,
  VEGETATION_KIT_URL,
  featuredProjectSteles,
  type SteleMarker,
} from "@/lib/playground-data";

type FeaturedProjectsSceneProps = {
  onNearbySteleChange?: (stele: SteleMarker | null) => void;
  interactRequestId?: number;
  onInteract?: (stele: SteleMarker) => void;
};

type Keys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

type CircleCollider = {
  x: number;
  z: number;
  r: number;
};

type KnockableProp = {
  root: THREE.Object3D;
  x: number;
  z: number;
  r: number;
  vx: number;
  vz: number;
  yawSpin: number;
  tip: number;
  tipAxisX: number;
  tipAxisZ: number;
  settled: boolean;
};

type MapBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

const CAR_RADIUS = 1.55;

/** Horizontal collision radius per decor template (metres). */
const COLLIDER_RADIUS: Record<string, number> = {
  Tree_Broadleaf: 1.9,
  Tree_Pine: 1.25,
  Bush: 1.05,
  Rock: 1.55,
  Street_Lamp: 0.55,
  Wayfinding_Sign: 0.85,
  Traffic_Cone: 0.55,
  Barrier: 1.55,
};

const KNOCKABLE_TEMPLATES = new Set(["Barrier", "Traffic_Cone"]);

const DISPLAY_COLLIDER_RADIUS = 1.85;

/** Baked landmarks inside portfolio-map.glb (fountain plaza + boom gate). */
const MAP_LANDMARK_COLLIDERS: CircleCollider[] = [
  // Lake plaza monument (Hình 1)
  { x: 0, z: -15, r: 2.6 },
  // Benches around the plaza ring (~r 8.6)
  ...Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return { x: Math.cos(a) * 8.6, z: -15 + Math.sin(a) * 8.6, r: 1.15 };
  }),
  // Boom gate post + arm near spawn approach (Hình 2)
  { x: 6.7, z: 24.2, r: 1.7 },
  { x: 7.6, z: 26.5, r: 1.9 },
  { x: 8.2, z: 28.8, r: 1.5 },
];

function enableShadows(root: THREE.Object3D, cast: boolean, receive: boolean) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    child.castShadow = cast;
    child.receiveShadow = receive;
  });
}

type LoadedGltf = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

function loadGltf(loader: GLTFLoader, url: string) {
  return new Promise<LoadedGltf>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => resolve({ scene: gltf.scene, animations: gltf.animations ?? [] }),
      undefined,
      reject,
    );
  });
}

function cloneTemplate(source: THREE.Object3D | undefined, name: string) {
  if (!source) return null;
  const clone = source.clone(true);
  clone.name = name;
  clone.position.set(0, 0, 0);
  clone.rotation.set(0, 0, 0);
  clone.scale.set(1, 1, 1);
  return clone;
}

function frameCardOnMount(card: THREE.Object3D, targetHeight = 1.35) {
  card.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(card);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  card.scale.setScalar(scale);
  card.updateMatrixWorld(true);
  const framed = new THREE.Box3().setFromObject(card);
  const framedCenter = framed.getCenter(new THREE.Vector3());
  card.position.set(-framedCenter.x, -framed.min.y, -framedCenter.z);
}

export function FeaturedProjectsScene({
  onNearbySteleChange,
  interactRequestId = 0,
  onInteract,
}: FeaturedProjectsSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const nearbyRef = useRef<SteleMarker | null>(null);
  const onNearbyRef = useRef(onNearbySteleChange);
  const onInteractRef = useRef(onInteract);
  const [loadLabel, setLoadLabel] = useState("Booting town…");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onNearbyRef.current = onNearbySteleChange;
  }, [onNearbySteleChange]);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    if (!interactRequestId) return;
    const nearby = nearbyRef.current;
    if (nearby) onInteractRef.current?.(nearby);
  }, [interactRequestId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;
    const steleRoots: Array<{ marker: SteleMarker; root: THREE.Object3D }> = [];
    const colliders: CircleCollider[] = [...MAP_LANDMARK_COLLIDERS];
    const knockables: KnockableProp[] = [];
    const mapBounds: MapBounds = { minX: -48, maxX: 48, minZ: -38, maxZ: 38 };
    const keys: Keys = { up: false, down: false, left: false, right: false };
    const worldPos = new THREE.Vector3();
    const tipEuler = new THREE.Euler();
    const tipQuat = new THREE.Quaternion();
    const tipAxis = new THREE.Vector3();
    const tipSpinQuat = new THREE.Quaternion();

    const addCollider = (x: number, z: number, r: number) => {
      if (r <= 0) return;
      colliders.push({ x, z, r });
    };

    const separateFromCircle = (cx: number, cz: number, radius: number) => {
      const dx = carPivot.position.x - cx;
      const dz = carPivot.position.z - cz;
      const minDist = CAR_RADIUS + radius;
      const distSq = dx * dx + dz * dz;
      if (distSq >= minDist * minDist) return false;
      if (distSq < 1e-8) {
        carPivot.position.x = cx + minDist;
        return true;
      }
      const dist = Math.sqrt(distSq);
      const push = (minDist - dist) / dist;
      carPivot.position.x += dx * push;
      carPivot.position.z += dz * push;
      return true;
    };

    const hitKnockable = (prop: KnockableProp) => {
      if (prop.settled) return;
      const impact = Math.max(Math.abs(carVelocity.speed), 3);
      const fx = -Math.sin(carHeading.yaw);
      const fz = -Math.cos(carHeading.yaw);
      // Prefer car forward as launch direction; fall back to separation normal.
      let nx = carPivot.position.x - prop.x;
      let nz = carPivot.position.z - prop.z;
      const nLen = Math.hypot(nx, nz) || 1;
      nx /= nLen;
      nz /= nLen;
      const launchX = fx * 0.65 + nx * 0.35;
      const launchZ = fz * 0.65 + nz * 0.35;
      const launchLen = Math.hypot(launchX, launchZ) || 1;
      prop.vx = (launchX / launchLen) * impact * 1.35;
      prop.vz = (launchZ / launchLen) * impact * 1.35;
      prop.yawSpin = (Math.random() > 0.5 ? 1 : -1) * (2.2 + impact * 0.35);
      prop.tipAxisX = -nz;
      prop.tipAxisZ = nx;
      prop.tip = Math.max(prop.tip, 0.15);
      carVelocity.speed *= 0.72;
    };

    const resolveCarPhysics = () => {
      let blocked = false;

      for (const collider of colliders) {
        if (separateFromCircle(collider.x, collider.z, collider.r)) blocked = true;
      }

      for (const prop of knockables) {
        if (prop.settled && prop.tip > 1.0) continue;
        const dx = carPivot.position.x - prop.x;
        const dz = carPivot.position.z - prop.z;
        const minDist = CAR_RADIUS + prop.r;
        if (dx * dx + dz * dz >= minDist * minDist) continue;

        if (!prop.settled && Math.abs(carVelocity.speed) > 1.8) {
          hitKnockable(prop);
        }
        if (separateFromCircle(prop.x, prop.z, prop.r * (prop.settled ? 0.45 : 1))) {
          blocked = true;
        }
      }

      if (carPivot.position.x < mapBounds.minX) {
        carPivot.position.x = mapBounds.minX;
        blocked = true;
      } else if (carPivot.position.x > mapBounds.maxX) {
        carPivot.position.x = mapBounds.maxX;
        blocked = true;
      }
      if (carPivot.position.z < mapBounds.minZ) {
        carPivot.position.z = mapBounds.minZ;
        blocked = true;
      } else if (carPivot.position.z > mapBounds.maxZ) {
        carPivot.position.z = mapBounds.maxZ;
        blocked = true;
      }

      if (blocked) carVelocity.speed *= 0.55;
    };

    const updateKnockables = (delta: number) => {
      for (const prop of knockables) {
        if (prop.settled && Math.abs(prop.vx) < 0.05 && Math.abs(prop.vz) < 0.05) continue;

        prop.x += prop.vx * delta;
        prop.z += prop.vz * delta;
        prop.vx *= Math.exp(-3.2 * delta);
        prop.vz *= Math.exp(-3.2 * delta);

        if (prop.tip < Math.PI * 0.52 && (Math.abs(prop.vx) + Math.abs(prop.vz) > 0.4 || prop.tip > 0)) {
          prop.tip = Math.min(Math.PI * 0.52, prop.tip + delta * (1.8 + Math.hypot(prop.vx, prop.vz) * 0.15));
        }

        prop.root.position.x = prop.x;
        prop.root.position.z = prop.z;
        prop.root.position.y = Math.sin(Math.min(prop.tip, Math.PI * 0.5)) * 0.35;

        const baseYaw = prop.root.userData.baseYaw ?? 0;
        tipEuler.set(0, baseYaw + prop.yawSpin * prop.tip, 0);
        tipSpinQuat.setFromEuler(tipEuler);
        tipAxis.set(prop.tipAxisX, 0, prop.tipAxisZ);
        if (tipAxis.lengthSq() < 1e-6) tipAxis.set(1, 0, 0);
        tipAxis.normalize();
        tipQuat.setFromAxisAngle(tipAxis, prop.tip);
        prop.root.quaternion.copy(tipQuat).multiply(tipSpinQuat);

        if (prop.tip >= Math.PI * 0.48 && Math.hypot(prop.vx, prop.vz) < 0.35) {
          prop.settled = true;
          prop.vx = 0;
          prop.vz = 0;
        }

        // Keep knocked props inside map soft bounds.
        prop.x = THREE.MathUtils.clamp(prop.x, mapBounds.minX, mapBounds.maxX);
        prop.z = THREE.MathUtils.clamp(prop.z, mapBounds.minZ, mapBounds.maxZ);
      }
    };

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a1628");
    scene.fog = new THREE.Fog("#0a1628", 55, 140);

    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 320);
    camera.position.set(9, 18, 52);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc8e7ff, 0x1a2a18, 0.9));

    const sun = new THREE.DirectionalLight(0xfff1d6, 1.45);
    sun.position.set(36, 55, 22);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 160;
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    scene.add(sun);

    const neon = new THREE.PointLight(0x22d3ee, 1.05, 70);
    neon.position.set(0, 10, 0);
    scene.add(neon);

    const carPivot = new THREE.Group();
    scene.add(carPivot);

    const carBeacon = new THREE.PointLight(0x22d3ee, 1.35, 14);
    carBeacon.position.set(0, 2.1, 0);
    carPivot.add(carBeacon);

    let carMixer: THREE.AnimationMixer | null = null;
    let wheelAction: THREE.AnimationAction | null = null;
    let cameraSnapped = false;
    const carVelocity = { speed: 0 };
    // glTF forward is -Z; yaw 0 faces into the map from Spawn_Car toward the exhibits.
    const carHeading = { yaw: 0 };
    // Chase cam: high + behind so ArrowUp = into the screen and the town stays readable.
    const cameraBack = 20;
    const cameraHeight = 14;
    const lookAheadDist = 10;
    const lookTarget = new THREE.Vector3();
    const desiredCam = new THREE.Vector3();
    const clock = new THREE.Clock();
    const loader = new GLTFLoader();

    const syncChaseCamera = (hard = false, delta = 1 / 60) => {
      const yaw = carHeading.yaw;
      // Behind the car = opposite of forward (-Z at yaw 0) → +Z local.
      desiredCam.set(
        carPivot.position.x + Math.sin(yaw) * cameraBack,
        carPivot.position.y + cameraHeight,
        carPivot.position.z + Math.cos(yaw) * cameraBack,
      );
      lookTarget.set(
        carPivot.position.x - Math.sin(yaw) * lookAheadDist,
        carPivot.position.y + 1.4,
        carPivot.position.z - Math.cos(yaw) * lookAheadDist,
      );
      if (hard) {
        camera.position.copy(desiredCam);
      } else {
        camera.position.lerp(desiredCam, 1 - Math.exp(-10 * delta));
      }
      camera.lookAt(lookTarget);
    };

    const resize = () => {
      if (!mount) return;
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const setNearby = (next: SteleMarker | null) => {
      if (nearbyRef.current?.id === next?.id) return;
      nearbyRef.current = next;
      onNearbyRef.current?.(next);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.up = true;
          event.preventDefault();
          break;
        case "ArrowDown":
        case "KeyS":
          keys.down = true;
          event.preventDefault();
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.left = true;
          event.preventDefault();
          break;
        case "ArrowRight":
        case "KeyD":
          keys.right = true;
          event.preventDefault();
          break;
        case "Enter":
          if (nearbyRef.current) {
            event.preventDefault();
            onInteractRef.current?.(nearbyRef.current);
          }
          break;
        default:
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keys.up = false;
          break;
        case "ArrowDown":
        case "KeyS":
          keys.down = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          keys.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          keys.right = false;
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const placeDecor = (
      templates: Record<string, THREE.Object3D | undefined>,
      parent: THREE.Group,
      placements: Array<{
        template: string;
        x: number;
        z: number;
        y?: number;
        rotY?: number;
        scale?: number;
      }>,
    ) => {
      for (const item of placements) {
        const clone = cloneTemplate(templates[item.template], `${item.template}_${item.x}_${item.z}`);
        if (!clone) continue;
        clone.position.set(item.x, item.y ?? 0, item.z);
        clone.rotation.y = item.rotY ?? 0;
        clone.userData.baseYaw = item.rotY ?? 0;
        if (item.scale) clone.scale.setScalar(item.scale);
        enableShadows(clone, true, true);
        parent.add(clone);

        const baseRadius = COLLIDER_RADIUS[item.template];
        if (!baseRadius) continue;
        const radius = baseRadius * (item.scale ?? 1);

        if (KNOCKABLE_TEMPLATES.has(item.template)) {
          knockables.push({
            root: clone,
            x: item.x,
            z: item.z,
            r: radius,
            vx: 0,
            vz: 0,
            yawSpin: 0,
            tip: 0,
            tipAxisX: 1,
            tipAxisZ: 0,
            settled: false,
          });
        } else {
          addCollider(item.x, item.z, radius);
        }
      }
    };

    (async () => {
      try {
        setLoadLabel("Loading portfolio map…");
        const mapGltf = await loadGltf(loader, FEATURED_PROJECTS_MAP_URL);
        if (disposed) return;
        const mapRoot = mapGltf.scene;
        enableShadows(mapRoot, true, true);
        scene.add(mapRoot);

        const terrain =
          mapRoot.getObjectByName("Portfolio_World_Static") ?? mapRoot;
        terrain.updateWorldMatrix(true, true);
        const terrainBox = new THREE.Box3().setFromObject(terrain);
        const inset = 3.2;
        mapBounds.minX = terrainBox.min.x + inset;
        mapBounds.maxX = terrainBox.max.x - inset;
        mapBounds.minZ = terrainBox.min.z + inset;
        mapBounds.maxZ = terrainBox.max.z - inset;

        const spawn = mapRoot.getObjectByName(SPAWN_CAR_NODE);
        if (spawn) {
          spawn.getWorldPosition(worldPos);
          carPivot.position.copy(worldPos);
        } else {
          carPivot.position.set(9, 0.03, 31);
        }
        carHeading.yaw = 0;
        carPivot.rotation.y = carHeading.yaw;
        syncChaseCamera(true);

        setLoadLabel("Dressing streets & vegetation…");
        const [vegGltf, propsGltf] = await Promise.all([
          loadGltf(loader, VEGETATION_KIT_URL),
          loadGltf(loader, STREET_PROPS_KIT_URL),
        ]);
        if (disposed) return;

        const vegTemplates = {
          Tree_Broadleaf: vegGltf.scene.getObjectByName("Tree_Broadleaf"),
          Tree_Pine: vegGltf.scene.getObjectByName("Tree_Pine"),
          Bush: vegGltf.scene.getObjectByName("Bush"),
          Grass_Clump: vegGltf.scene.getObjectByName("Grass_Clump"),
          Rock: vegGltf.scene.getObjectByName("Rock"),
        };
        const propTemplates = {
          Street_Lamp: propsGltf.scene.getObjectByName("Street_Lamp"),
          Wayfinding_Sign: propsGltf.scene.getObjectByName("Wayfinding_Sign"),
          Traffic_Cone: propsGltf.scene.getObjectByName("Traffic_Cone"),
          Barrier: propsGltf.scene.getObjectByName("Barrier"),
          Crosswalk: propsGltf.scene.getObjectByName("Crosswalk"),
        };

        const decor = new THREE.Group();
        decor.name = "MapDecor";
        scene.add(decor);

        // Ring vegetation around the drive loop + lake edge accents.
        placeDecor(vegTemplates, decor, [
          { template: "Tree_Broadleaf", x: -42, z: -18, rotY: 0.4 },
          { template: "Tree_Broadleaf", x: -38, z: 8, rotY: 1.1, scale: 1.1 },
          { template: "Tree_Broadleaf", x: -44, z: 22, rotY: -0.6 },
          { template: "Tree_Broadleaf", x: 40, z: -20, rotY: 0.8 },
          { template: "Tree_Broadleaf", x: 44, z: 6, rotY: -0.3, scale: 1.05 },
          { template: "Tree_Broadleaf", x: 38, z: 24, rotY: 1.4 },
          { template: "Tree_Pine", x: -28, z: -28, rotY: 0.2 },
          { template: "Tree_Pine", x: -12, z: -32, rotY: 0.9 },
          { template: "Tree_Pine", x: 12, z: -34, rotY: -0.5 },
          { template: "Tree_Pine", x: 30, z: -28, rotY: 1.2 },
          { template: "Tree_Pine", x: -34, z: 32, rotY: 0.5 },
          { template: "Tree_Pine", x: 34, z: 34, rotY: -1.0 },
          { template: "Bush", x: -22, z: 18, rotY: 0.3, scale: 1.2 },
          { template: "Bush", x: -8, z: 22, rotY: 1.1 },
          { template: "Bush", x: 10, z: 20, rotY: -0.7 },
          { template: "Bush", x: 24, z: 16, rotY: 0.4 },
          { template: "Bush", x: -18, z: -18, scale: 1.15 },
          { template: "Bush", x: 16, z: -20, rotY: 0.8 },
          { template: "Grass_Clump", x: -26, z: 10, scale: 1.3 },
          { template: "Grass_Clump", x: -14, z: 14, scale: 1.1 },
          { template: "Grass_Clump", x: 6, z: 12, scale: 1.2 },
          { template: "Grass_Clump", x: 20, z: 8, scale: 1.15 },
          { template: "Grass_Clump", x: -6, z: -24, scale: 1.25 },
          { template: "Grass_Clump", x: 8, z: -26, scale: 1.1 },
          { template: "Rock", x: -40, z: -6, rotY: 0.5, scale: 1.2 },
          { template: "Rock", x: 42, z: -8, rotY: -0.8, scale: 1.1 },
          { template: "Rock", x: -20, z: 36, rotY: 1.2 },
          { template: "Rock", x: 18, z: 38, rotY: 0.3, scale: 1.15 },
          { template: "Rock", x: 0, z: -36, rotY: 0.7 },
        ]);

        // Street furniture along the loop + exhibit frontage.
        placeDecor(propTemplates, decor, [
          { template: "Street_Lamp", x: -32, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: -20, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: -8, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: 4, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: 16, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: 28, z: 4, rotY: Math.PI * 0.5 },
          { template: "Street_Lamp", x: -32, z: -8, rotY: -Math.PI * 0.5 },
          { template: "Street_Lamp", x: -10, z: -8, rotY: -Math.PI * 0.5 },
          { template: "Street_Lamp", x: 12, z: -8, rotY: -Math.PI * 0.5 },
          { template: "Street_Lamp", x: 30, z: -8, rotY: -Math.PI * 0.5 },
          { template: "Street_Lamp", x: 4, z: 28, rotY: Math.PI },
          { template: "Street_Lamp", x: 14, z: 28, rotY: Math.PI },
          { template: "Wayfinding_Sign", x: 6, z: 26, rotY: Math.PI },
          { template: "Wayfinding_Sign", x: -34, z: 0, rotY: Math.PI * 0.5 },
          { template: "Wayfinding_Sign", x: 34, z: 0, rotY: -Math.PI * 0.5 },
          { template: "Crosswalk", x: 9, z: 24, rotY: 0 },
          { template: "Crosswalk", x: -24, z: -1.2, rotY: Math.PI * 0.5 },
          { template: "Crosswalk", x: 0, z: -1.2, rotY: Math.PI * 0.5 },
          { template: "Crosswalk", x: 24, z: -1.2, rotY: Math.PI * 0.5 },
          // Knockable roadside props — hit to tip / scatter (Hình 3).
          { template: "Barrier", x: -36, z: 14, rotY: Math.PI * 0.15 },
          { template: "Barrier", x: 36, z: 14, rotY: -Math.PI * 0.15 },
          { template: "Barrier", x: -36, z: -16, rotY: -Math.PI * 0.1 },
          { template: "Barrier", x: 36, z: -16, rotY: Math.PI * 0.1 },
          { template: "Barrier", x: 4, z: 18, rotY: 0.2 },
          { template: "Barrier", x: 14, z: 18, rotY: -0.15 },
          { template: "Barrier", x: -10, z: 8, rotY: Math.PI * 0.5 },
          { template: "Traffic_Cone", x: 7, z: 29, scale: 1.1 },
          { template: "Traffic_Cone", x: 11, z: 29, scale: 1.1 },
          { template: "Traffic_Cone", x: 7.5, z: 33, scale: 1.05 },
          { template: "Traffic_Cone", x: 10.5, z: 33, scale: 1.05 },
          { template: "Traffic_Cone", x: -12, z: 2, scale: 1.05 },
          { template: "Traffic_Cone", x: 12, z: 2, scale: 1.05 },
          { template: "Traffic_Cone", x: 5, z: 20, scale: 1.1 },
          { template: "Traffic_Cone", x: 13, z: 20, scale: 1.1 },
        ]);

        setLoadLabel("Placing project pedestals…");
        const displayGltf = await loadGltf(loader, PROJECT_DISPLAY_URL);
        if (disposed) return;
        const displayRoot =
          displayGltf.scene.getObjectByName("Project_Display") ?? displayGltf.scene;

        const pedestalGroup = new THREE.Group();
        pedestalGroup.name = "ProjectPedestals";
        scene.add(pedestalGroup);

        await Promise.all(
          featuredProjectSteles.map(
            (marker) =>
              new Promise<void>((resolve) => {
                const anchor = mapRoot.getObjectByName(marker.anchorName);
                if (!anchor) {
                  resolve();
                  return;
                }

                anchor.updateWorldMatrix(true, false);
                const anchorPos = new THREE.Vector3();
                anchor.getWorldPosition(anchorPos);

                const display = displayRoot.clone(true);
                enableShadows(display, true, true);
                // Sit pedestal on ground under the Project_XX mount height.
                display.position.set(anchorPos.x, 0, anchorPos.z);
                // Face toward the road (roughly +Z / spawn side).
                display.rotation.y = Math.PI;
                pedestalGroup.add(display);
                addCollider(anchorPos.x, anchorPos.z, DISPLAY_COLLIDER_RADIUS);

                const mount = display.getObjectByName(CARD_MOUNT_NODE) ?? display;
                const interactRoot = new THREE.Group();
                interactRoot.name = `Interact_${marker.anchorName}`;
                display.add(interactRoot);
                interactRoot.position.copy(mount.position);

                loader.load(
                  marker.modelUrl,
                  (gltf) => {
                    if (disposed) return resolve();
                    const card = gltf.scene;
                    enableShadows(card, true, false);
                    frameCardOnMount(card, 1.25);
                    mount.add(card);

                    const glow = new THREE.PointLight(0x67e8f9, 0.5, 7);
                    glow.position.set(0, 0.4, 0.4);
                    mount.add(glow);

                    const ring = new THREE.Mesh(
                      new THREE.RingGeometry(1.2, 1.45, 40),
                      new THREE.MeshBasicMaterial({
                        color: "#22d3ee",
                        transparent: true,
                        opacity: 0.32,
                        side: THREE.DoubleSide,
                        depthWrite: false,
                      }),
                    );
                    ring.rotation.x = -Math.PI / 2;
                    ring.position.y = 0.04;
                    display.add(ring);

                    steleRoots.push({ marker, root: display });
                    resolve();
                  },
                  undefined,
                  () => {
                    steleRoots.push({ marker, root: display });
                    resolve();
                  },
                );
              }),
          ),
        );
        if (disposed) return;

        setLoadLabel("Spawning car…");
        const carGltf = await loadGltf(loader, CAR_MODEL_URL);
        if (disposed) return;
        const car = carGltf.scene;
        enableShadows(car, true, false);
        car.scale.setScalar(1);
        // Keep native glTF facing (-Z) so nose matches ArrowUp forward.
        car.rotation.y = 0;
        carPivot.add(car);
        syncChaseCamera(true);
        cameraSnapped = true;

        if (carGltf.animations.length) {
          carMixer = new THREE.AnimationMixer(car);
          const clip =
            carGltf.animations.find((item) => /wheel/i.test(item.name)) ?? carGltf.animations[0];
          wheelAction = carMixer.clipAction(clip);
          wheelAction.play();
          wheelAction.timeScale = 0;
        }

        setReady(true);
        setLoadLabel("");
      } catch {
        if (!disposed) setFailed(true);
      }
    })();

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      const accel = 16;
      const brake = 26;
      const friction = 8;
      const maxSpeed = 14;
      const steerRate = 2.0;

      if (keys.up) carVelocity.speed = Math.min(maxSpeed, carVelocity.speed + accel * delta);
      else if (keys.down) carVelocity.speed = Math.max(-maxSpeed * 0.45, carVelocity.speed - brake * delta);
      else if (carVelocity.speed > 0) carVelocity.speed = Math.max(0, carVelocity.speed - friction * delta);
      else if (carVelocity.speed < 0) carVelocity.speed = Math.min(0, carVelocity.speed + friction * delta);

      const turn = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
      if (turn !== 0) {
        // Keep some steer authority even when nearly stopped so you can re-aim.
        const steerScale = THREE.MathUtils.clamp(Math.abs(carVelocity.speed) / 5, 0.45, 1);
        carHeading.yaw += turn * steerRate * delta * steerScale * Math.sign(carVelocity.speed || 1);
      }

      carPivot.rotation.y = carHeading.yaw;
      // Sub-step movement so fast hits don't tunnel through props / landmarks.
      const steps = Math.max(1, Math.ceil(Math.abs(carVelocity.speed) * delta / 0.35));
      const stepDt = delta / steps;
      for (let i = 0; i < steps; i++) {
        carPivot.position.x += -Math.sin(carHeading.yaw) * carVelocity.speed * stepDt;
        carPivot.position.z += -Math.cos(carHeading.yaw) * carVelocity.speed * stepDt;
        resolveCarPhysics();
      }
      updateKnockables(delta);

      if (wheelAction) {
        wheelAction.timeScale = THREE.MathUtils.clamp(carVelocity.speed / 4, -2.5, 2.5);
      }
      carMixer?.update(delta);

      syncChaseCamera(!cameraSnapped, delta);
      cameraSnapped = true;

      neon.position.set(carPivot.position.x, 8, carPivot.position.z);
      neon.intensity = 0.85 + Math.sin(t * 2.2) * 0.15;
      carBeacon.intensity = 1.1 + Math.sin(t * 3.1) * 0.25;

      let closest: SteleMarker | null = null;
      let closestDist = STELE_INTERACT_RADIUS;
      for (const entry of steleRoots) {
        entry.root.getWorldPosition(worldPos);
        const dist = Math.hypot(worldPos.x - carPivot.position.x, worldPos.z - carPivot.position.z);
        const active = dist < STELE_INTERACT_RADIUS;
        entry.root.traverse((child) => {
          if (child instanceof THREE.PointLight) {
            child.intensity = active ? 1.3 + Math.sin(t * 6) * 0.25 : 0.45;
          }
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.RingGeometry) {
            const mat = child.material as THREE.MeshBasicMaterial;
            mat.opacity = active ? 0.78 : 0.28;
            child.scale.setScalar(active ? 1.12 + Math.sin(t * 5) * 0.04 : 1);
          }
        });
        if (dist < closestDist) {
          closestDist = dist;
          closest = entry.marker;
        }
      }
      setNearby(closest);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      resizeObserver.disconnect();
      carMixer?.stopAllAction();
      carMixer = null;
      renderer.dispose();
      scene.traverse((obj) => {
        if (!(obj instanceof THREE.Mesh)) return;
        obj.geometry?.dispose();
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((mat) => mat?.dispose?.());
      });
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      setNearby(null);
    };
  }, []);

  return (
    <div className="relative h-full w-full bg-[#0a1628]">
      <div ref={mountRef} className="absolute inset-0" />
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0a1628]/90">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
          <p className="text-sm text-cyan-100/80">{loadLabel}</p>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a1628] text-sm text-rose-200">
          Failed to load portfolio map.
        </div>
      )}
    </div>
  );
}
