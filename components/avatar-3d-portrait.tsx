"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// CC0 cartoon toaster-head robot (vibeassets) — turquoise / chrome / red, 10 clips.
const MODEL_URL = "/models/toaster-robot.glb";

type PointerNorm = { x: number; y: number };

type Avatar3DPortraitProps = {
  className?: string;
  pointer?: PointerNorm;
};

export function Avatar3DPortrait({ className, pointer }: Avatar3DPortraitProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<PointerNorm>({ x: 50, y: 50 });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (pointer) pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frameId = 0;
    let tiltRoot: THREE.Group | null = null;
    let mixer: THREE.AnimationMixer | null = null;

    const width = mount.clientWidth || 224;
    const height = mount.clientHeight || 224;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.05, 100);
    camera.position.set(0, 0.15, 2.35);
    camera.lookAt(0, 0.12, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xe0f7ff, 0x2a1040, 1.05);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.55);
    key.position.set(2.4, 3.4, 2.6);
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xff9ad5, 0.55);
    fill.position.set(-2.6, 1.4, 1.2);
    scene.add(fill);

    const rim = new THREE.PointLight(0x67e8f9, 1.25, 8);
    rim.position.set(0, 1.1, -1.6);
    scene.add(rim);

    const accent = new THREE.PointLight(0xf472b6, 0.7, 7);
    accent.position.set(-1.2, 0.4, 1.1);
    scene.add(accent);

    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };
    const clock = new THREE.Clock();

    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
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
            // Keep original colorful maps; add a soft emissive lift for neon feel.
            mat.roughness = Math.min(mat.roughness ?? 0.5, 0.65);
            mat.metalness = Math.max(mat.metalness ?? 0.15, 0.12);
            if (mat.map) {
              mat.emissiveMap = mat.map;
              mat.emissive = new THREE.Color("#ffffff");
              mat.emissiveIntensity = 0.22;
            }
            mat.side = THREE.FrontSide;
            mat.needsUpdate = true;
          });
        });

        root.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());

        // Portrait crop: head + upper torso fill the circular frame.
        const scale = 1.55 / Math.max(size.x * 0.95, size.y * 0.62);
        root.scale.setScalar(scale);
        root.updateMatrixWorld(true);

        const framed = new THREE.Box3().setFromObject(root);
        const framedSize = framed.getSize(new THREE.Vector3());
        const framedCenter = framed.getCenter(new THREE.Vector3());
        const focusY = framed.min.y + framedSize.y * 0.72;

        root.position.set(-framedCenter.x, -focusY, -framedCenter.z);
        root.rotation.y = 0;

        tiltRoot = new THREE.Group();
        tiltRoot.add(root);
        scene.add(tiltRoot);

        if (gltf.animations?.length) {
          mixer = new THREE.AnimationMixer(root);
          const idle =
            gltf.animations.find((clip) => /idle/i.test(clip.name)) ??
            gltf.animations.find((clip) => /wave/i.test(clip.name)) ??
            gltf.animations[0];
          const action = mixer.clipAction(idle);
          action.reset().fadeIn(0.35).play();
        }

        setReady(true);
      },
      undefined,
      () => {
        if (!disposed) setFailed(true);
      },
    );

    const onResize = () => {
      if (!mount) return;
      const nextW = mount.clientWidth || 224;
      const nextH = mount.clientHeight || 224;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      const p = pointerRef.current;

      targetRotation.y = ((p.x - 50) / 50) * 0.5;
      targetRotation.x = ((p.y - 50) / 50) * 0.28;

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;

      if (tiltRoot) {
        tiltRoot.rotation.x = currentRotation.x;
        tiltRoot.rotation.y = currentRotation.y;
        tiltRoot.position.y = Math.sin(t * 1.15) * 0.02;
      }

      mixer?.update(delta);
      rim.intensity = 1.05 + Math.sin(t * 1.5) * 0.2;
      accent.intensity = 0.55 + Math.sin(t * 1.1 + 1) * 0.15;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
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
  }, []);

  return (
    <div className={className}>
      <div ref={mountRef} className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className={`pointer-events-none absolute inset-0 rounded-full bg-slate-950/40 transition-opacity duration-500 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
      {!ready && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-8 w-8 animate-pulse rounded-full border border-cyan-300/40 border-t-cyan-300" />
        </div>
      )}
      {failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-cyan-200/70">
          Avatar unavailable
        </div>
      )}
    </div>
  );
}
