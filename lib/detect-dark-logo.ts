import * as THREE from "three";

/** Relative luminance in linear RGB (sRGB components 0–1). */
export function luminance(color: THREE.Color): number {
  return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;
}

function sampleTextureLuminance(map: THREE.Texture | null | undefined): number | null {
  if (!map?.image) return null;

  const image = map.image as CanvasImageSource & { width?: number; height?: number };
  const width = Number(image.width) || 0;
  const height = Number(image.height) || 0;
  if (!width || !height) return null;

  try {
    const canvas = document.createElement("canvas");
    const size = 32;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(image as CanvasImageSource, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] / 255;
      if (a < 0.15) continue;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      sum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
      count += 1;
    }
    return count ? sum / count : null;
  } catch {
    return null;
  }
}

function materialSamples(mat: THREE.Material): number[] {
  const samples: number[] = [];
  const anyMat = mat as THREE.MeshStandardMaterial;

  if (anyMat.color instanceof THREE.Color) {
    samples.push(luminance(anyMat.color));
  }

  const mapLum = sampleTextureLuminance(anyMat.map);
  if (mapLum != null) samples.push(mapLum);

  if (anyMat.emissive instanceof THREE.Color && (anyMat.emissiveIntensity ?? 0) > 0.05) {
    samples.push(luminance(anyMat.emissive) * Math.min(1, anyMat.emissiveIntensity ?? 1));
  }

  return samples;
}

/**
 * Detect whether a loaded logo/model is too dark for a dark UI background.
 * Uses material colors + optional texture sampling; area-weighted by mesh bbox volume.
 */
export function detectDarkLogo(
  root: THREE.Object3D,
  options?: { avgThreshold?: number; darkShareThreshold?: number },
): boolean {
  const avgThreshold = options?.avgThreshold ?? 0.42;
  const darkShareThreshold = options?.darkShareThreshold ?? 0.45;

  let weightedSum = 0;
  let weightTotal = 0;
  let darkWeight = 0;

  root.updateMatrixWorld(true);

  root.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh) || !obj.visible) return;

    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const weight = Math.max(size.x * size.y * size.z, 0.0001);

    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    const samples = mats.flatMap((mat) => materialSamples(mat));
    if (!samples.length) return;

    const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    weightedSum += avg * weight;
    weightTotal += weight;
    if (avg < 0.28) darkWeight += weight;
  });

  if (weightTotal <= 0) return true;

  const avgLum = weightedSum / weightTotal;
  const darkShare = darkWeight / weightTotal;

  return avgLum < avgThreshold || darkShare >= darkShareThreshold;
}
