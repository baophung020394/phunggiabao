"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { ExperienceTheme } from "@/lib/data";
import { detectDarkLogo } from "@/lib/detect-dark-logo";
import { cn } from "@/lib/utils";

type ExperienceModel3DProps = {
  theme: ExperienceTheme;
  active?: boolean;
  className?: string;
  /** Fired once the model is inspected — true when a light card backdrop is needed. */
  onNeedsLightBg?: (needsLightBg: boolean) => void;
};

const MODEL_BY_THEME: Record<ExperienceTheme, string> = {
  blockchain: "/models/lumberworks-logo.glb",
  "japan-outsource": "/models/rikkei-logo.glb",
  "korea-fintech": "/models/wave-asean-logo.glb",
  ewallet: "/models/one-mount-logo.glb",
  "vietnam-outsource": "/models/smartosc-logo.glb",
  "english-center": "/models/apollo-english-logo.glb",
};

function frameModel(root: THREE.Object3D, targetSize = 1.55) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const scale = targetSize / maxDim;
  root.scale.setScalar(scale);
  root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
}

function addLightStage(parent: THREE.Group) {
  const plate = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.1),
    new THREE.MeshBasicMaterial({
      color: "#eef3f8",
      transparent: true,
      opacity: 0.96,
      depthWrite: false,
    }),
  );
  plate.position.z = -0.55;
  plate.renderOrder = -1;
  parent.add(plate);

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(1.05, 1.22, 48),
    new THREE.MeshBasicMaterial({
      color: "#c9d6e5",
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  rim.position.z = -0.54;
  rim.renderOrder = -1;
  parent.add(rim);
}

export function ExperienceModel3D({
  theme,
  active = false,
  className,
  onNeedsLightBg,
}: ExperienceModel3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [needsLightBg, setNeedsLightBg] = useState(false);
  const activeRef = useRef(active);
  const onNeedsLightBgRef = useRef(onNeedsLightBg);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    onNeedsLightBgRef.current = onNeedsLightBg;
  }, [onNeedsLightBg]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;
    let visible = true;
    let tiltRoot: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const width = mount.clientWidth || 320;
    const height = mount.clientHeight || 280;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.15, 3.1);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e1b4b, 1.05);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x67e8f9, 0.45);
    fill.position.set(-2, 1, 1.5);
    scene.add(fill);
    const rim = new THREE.PointLight(0xa78bfa, 0.85, 8);
    rim.position.set(0, 1.2, -1.5);
    scene.add(rim);

    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load(
      MODEL_BY_THEME[theme],
      (gltf) => {
        if (disposed) return;

        const root = gltf.scene;
        root.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = false;
          child.receiveShadow = false;
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach((mat) => {
            if (!(mat instanceof THREE.MeshStandardMaterial)) return;
            mat.roughness = Math.min(mat.roughness ?? 0.5, 0.7);
            mat.metalness = Math.max(mat.metalness ?? 0.1, 0.08);
            mat.needsUpdate = true;
          });
        });

        frameModel(root, 1.7);

        const isDark = detectDarkLogo(root);
        if (!disposed) {
          setNeedsLightBg(isDark);
          onNeedsLightBgRef.current?.(isDark);
        }

        tiltRoot = new THREE.Group();
        if (isDark) {
          addLightStage(tiltRoot);
          // Lift exposure/lights so black logo edges stay readable on the plate.
          renderer.toneMappingExposure = 1.35;
          hemi.intensity = 1.25;
          key.intensity = 1.7;
          fill.color.set("#ffffff");
          fill.intensity = 0.7;
        }
        tiltRoot.add(root);
        scene.add(tiltRoot);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(gltf.animations[0]);
          action.reset().fadeIn(0.3).play();
        }

        setReady(true);
      },
      undefined,
      () => {
        if (!disposed) {
          setFailed(true);
          onNeedsLightBgRef.current?.(false);
        }
      },
    );

    const onResize = () => {
      if (!mount) return;
      const nextW = mount.clientWidth || 320;
      const nextH = mount.clientHeight || 280;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    io.observe(mount);

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      if (!visible && !activeRef.current) return;

      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      const boost = activeRef.current ? 1.25 : 1;

      if (tiltRoot) {
        tiltRoot.rotation.y = t * 0.35 * boost;
        tiltRoot.position.y = Math.sin(t * 1.15) * 0.04;
      }

      mixer?.update(delta);
      rim.intensity = 0.7 + Math.sin(t * 1.4) * 0.18;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      io.disconnect();
      mixer?.stopAllAction();
      mixer = null;
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
    };
  }, [theme]);

  return (
    <div
      className={cn(
        className,
        needsLightBg &&
          "bg-[radial-gradient(circle_at_50%_45%,#f4f7fb_0%,#e6edf5_58%,#d7e2ee_100%)]",
      )}
    >
      <div ref={mountRef} className="absolute inset-0 overflow-hidden rounded-2xl" />
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-8 w-8 animate-pulse rounded-full border border-primary/40 border-t-primary" />
        </div>
      )}
      {failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
          Model unavailable
        </div>
      )}
    </div>
  );
}
