'use client';

import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';

const BOUQUET_MODEL = '/3dmodels/bouqet/bouquet.glb';

function BouquetModel() {
  const gltf = useGLTF(BOUQUET_MODEL, true);

  useEffect(() => {
    const scene = gltf.scene;

    console.log('=== BOUQUET SCENE HIERARCHY ===');
    console.log('Full scene:', scene);

    scene.traverse((child) => {
      const depth = getDepth(child, scene);
      const indent = '  '.repeat(depth);
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        console.log(
          `${indent}[MESH] "${mesh.name}" | vertices: ${mesh.geometry.attributes.position?.count} | material: ${mat.name} | color: ${mat.color ? '#' + mat.color.getHexString() : 'none'} | hasTexture: ${!!mat.map}`
        );
        console.log(`${indent}  geometry.attributes:`, Object.keys(mesh.geometry.attributes));
        console.log(`${indent}  material:`, mat);
        console.log(`${indent}  worldPosition:`, mesh.getWorldPosition(new THREE.Vector3()));
      } else if (child.children.length > 0 || child.name) {
        console.log(`${indent}[${child.type}] "${child.name}" | children: ${child.children.length}`);
      }
    });

    console.log('=== ALL MESHES ARRAY ===');
    const meshes: THREE.Mesh[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    console.log('meshes:', meshes);
    console.log('mesh names:', meshes.map((m) => m.name));

    console.log('=== ALL MATERIALS ===');
    const materials = new Map<string, THREE.Material>();
    meshes.forEach((m) => {
      const mat = m.material as THREE.Material;
      materials.set(mat.name || mat.uuid, mat);
    });
    console.log('materials:', [...materials.values()]);

    console.log('=== ALL GROUPS ===');
    const groups: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.children.length > 0) groups.push(child);
    });
    console.log('groups:', groups);
    console.log('group names:', groups.map((g) => g.name));

    console.log('=== BOUNDING BOX ===');
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log('min:', box.min);
    console.log('max:', box.max);
    console.log('size:', size);
    console.log('center:', center);
  }, [gltf.scene]);

  // Normalize scene to fit viewport
  const scene = gltf.scene;
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2.5 / maxDim : 1;

  return (
    <primitive
      object={scene}
      scale={scale}
      position={[-center.x * scale, -center.y * scale, -center.z * scale]}
    />
  );
}

function getDepth(obj: THREE.Object3D, root: THREE.Object3D): number {
  let depth = 0;
  let current = obj;
  while (current.parent && current !== root) {
    depth++;
    current = current.parent;
  }
  return depth;
}

function LoadingSpinner() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
        <span className="text-sm text-gray-500 font-medium">Загрузка моделей...</span>
      </div>
    </Html>
  );
}

export default function BouquetScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 2.8], fov: 36 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{
        background: 'linear-gradient(180deg, #fefcfb 0%, #fce4ec 100%)',
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />
      <hemisphereLight args={['#fff5f5', '#e8e8e8', 0.5]} />

      <Suspense fallback={<LoadingSpinner />}>
        <group position={[0, -0.3, 0]}>
          <BouquetModel />
        </group>
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 0.2, 0]}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}

useGLTF.preload(BOUQUET_MODEL, true);
