'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

// Types
export interface BouquetConfig {
  flowers: FlowerItem[];
  wrappingColor: string;
  ribbonColor: string;
  greeneryAmount: number;
}

export interface FlowerItem {
  type: 'rose' | 'sakura';
  count: number;
}

// Normalize model size
function normalizeModel(object: THREE.Object3D, targetSize: number): number {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  return maxDim > 0 ? targetSize / maxDim : 1;
}

// Helper to get index from smallplant mesh name (a=0, b=1, etc.)
function getSmallPlantIndex(name: string): number {
  // Names like: smallplant, smallplanta, smallplantb, etc.
  const match = name.match(/smallplant([a-k])?$/i);
  if (!match) return 0;
  if (!match[1]) return 0; // "smallplant" without letter = 0
  return match[1].toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

// Helper to get petal index from mesh name (petal_001 = 1, etc.)
function getPetalIndex(name: string): number {
  const match = name.match(/petal_(\d+)/i);
  return match ? parseInt(match[1], 10) : 0;
}

// The original bouquet model with color customization
function OriginalBouquetModel({ config }: { config: BouquetConfig }) {
  const { scene } = useGLTF('/3dmodels/bouqet/wrapped_flower_bouquet.glb');

  // Calculate total flowers from config
  const totalFlowers = config.flowers.reduce((sum, f) => sum + f.count, 0);

  const customizedScene = useMemo(() => {
    const cloned = scene.clone(true);

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (!mat) return;

        const meshName = (child.name || '').toLowerCase();
        const matName = (mat?.name || '').toLowerCase();

        // Clone material to avoid affecting original
        const newMat = mat.clone();

        // PETALS - flower heads (petal_001 to petal_014)
        const isPetal = meshName.startsWith('petal_');

        // PARCEL/WRAPPING - (inner, outer, Parcel material)
        const isParcel =
          meshName.includes('inner') ||
          meshName.includes('outer') ||
          matName.includes('parcel');

        // RIBBON - (ribbon, knot, Ribbons material)
        const isRibbon =
          meshName.includes('ribbon') ||
          meshName.includes('knot') ||
          matName.includes('ribbon');

        // LEAVES - (leaf_XXX, Leaves material)
        const isLeaf = meshName.startsWith('leaf_') || matName.includes('leaves');

        // SMALL PLANTS/GREENERY - (smallplant, SmallPlants material)
        const isSmallPlant = meshName.startsWith('smallplant');

        // SEPALS/STEMS - (sepal_, stems, Sepals material)
        const isSepal = meshName.includes('sepal') || meshName === 'stems';

        // Apply colors and visibility
        if (isParcel) {
          // Wrapping paper - apply selected color
          newMat.color.set(config.wrappingColor);
        } else if (isRibbon) {
          // Ribbon - apply ribbon color
          newMat.color.set(config.ribbonColor);
        } else if (isPetal) {
          // Show/hide petals based on flower count (max 14 petals in model)
          const petalIndex = getPetalIndex(meshName);
          child.visible = petalIndex <= totalFlowers;
        } else if (isSmallPlant) {
          // Show/hide greenery based on amount (0-12)
          const plantIndex = getSmallPlantIndex(meshName);
          child.visible = plantIndex < config.greeneryAmount;
          // Green tint
          newMat.color.set('#80b080');
        } else if (isLeaf) {
          // Show leaves proportionally to flowers
          const leafMatch = meshName.match(/leaf_(\d+)/);
          const leafIndex = leafMatch ? parseInt(leafMatch[1], 10) : 0;
          // Show 1 leaf per ~1.4 flowers (10 leaves for 14 flowers)
          child.visible = leafIndex <= Math.ceil(totalFlowers * 0.7);
          newMat.color.set('#90c090');
        } else if (isSepal) {
          // Sepals follow petals
          const sepalMatch = meshName.match(/sepal_(\d+)/);
          const sepalIndex = sepalMatch ? parseInt(sepalMatch[1], 10) : 0;
          child.visible = sepalIndex <= totalFlowers;
          newMat.color.set('#70a070');
        }

        child.material = newMat;
      }
    });

    // Center and scale
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const scale = normalizeModel(cloned, 1.5);

    cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    cloned.scale.setScalar(scale);

    return cloned;
  }, [scene, config.wrappingColor, config.ribbonColor, config.greeneryAmount, totalFlowers]);

  return <primitive object={customizedScene} />;
}

// Loading state
function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Загрузка...</span>
      </div>
    </Html>
  );
}

// Main component
export default function BouquetBuilder3D({ config }: { config: BouquetConfig }) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 1.8], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'linear-gradient(180deg, #fff9f9 0%, #ffe4e6 100%)' }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 7]} intensity={1} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <hemisphereLight args={['#fff5f5', '#f0f0f0', 0.5]} />

      <Suspense fallback={<LoadingSpinner />}>
        <group position={[0, -0.3, 0]}>
          <OriginalBouquetModel config={config} />
        </group>
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={0.8}
        maxDistance={4}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}

// Preload
useGLTF.preload('/3dmodels/bouqet/wrapped_flower_bouquet.glb');
