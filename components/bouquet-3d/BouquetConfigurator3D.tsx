'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ModelInfo {
  name: string;
  type: string;
  materialName?: string;
  color?: string;
}

interface BouquetModelProps {
  modelPath: string;
  onModelLoaded?: (info: ModelInfo[]) => void;
  selectedMesh?: string | null;
  newColor?: string;
}

function BouquetModel({ modelPath, onModelLoaded, selectedMesh, newColor }: BouquetModelProps) {
  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const meshInfo: ModelInfo[] = [];

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const material = child.material as THREE.MeshStandardMaterial;
        meshInfo.push({
          name: child.name || 'unnamed',
          type: child.type,
          materialName: material?.name || 'unnamed',
          color: material?.color ? `#${material.color.getHexString()}` : undefined,
        });

        // Log detailed info for debugging
        console.log(`Mesh: ${child.name}`, {
          material: material?.name,
          color: material?.color?.getHexString(),
          map: material?.map ? 'has texture' : 'no texture',
        });
      }
    });

    if (onModelLoaded) {
      onModelLoaded(meshInfo);
    }
  }, [scene, onModelLoaded]);

  // Apply color change to selected mesh
  useEffect(() => {
    if (selectedMesh && newColor) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === selectedMesh) {
          const material = child.material as THREE.MeshStandardMaterial;
          if (material && material.color) {
            material.color.set(newColor);
          }
        }
      });
    }
  }, [scene, selectedMesh, newColor]);

  return (
    <Center>
      <primitive
        ref={groupRef}
        object={scene}
        scale={1}
      />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#f0a0c0" wireframe />
    </mesh>
  );
}

interface BouquetConfigurator3DProps {
  modelPath?: string;
  onMeshSelect?: (meshName: string) => void;
}

export default function BouquetConfigurator3D({
  modelPath = '/3dmodels/bouqet/wrapped_flower_bouquet.glb',
  onMeshSelect
}: BouquetConfigurator3DProps) {
  const [meshList, setMeshList] = useState<ModelInfo[]>([]);
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#ff69b4');

  const handleModelLoaded = (info: ModelInfo[]) => {
    setMeshList(info);
    console.log('Model structure:', info);
  };

  const colorOptions = [
    { name: 'Розовый', value: '#ff69b4' },
    { name: 'Красный', value: '#dc2626' },
    { name: 'Белый', value: '#fefefe' },
    { name: 'Жёлтый', value: '#fbbf24' },
    { name: 'Фиолетовый', value: '#8b5cf6' },
    { name: 'Коралловый', value: '#f97316' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
      {/* 3D Canvas */}
      <div className="flex-1 bg-gradient-to-b from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <directionalLight position={[-10, -10, -5]} intensity={0.3} />

          <Suspense fallback={<LoadingFallback />}>
            <BouquetModel
              modelPath={modelPath}
              onModelLoaded={handleModelLoaded}
              selectedMesh={selectedMesh}
              newColor={selectedColor}
            />
            <Environment preset="studio" />
          </Suspense>

          <OrbitControls
            enablePan={false}
            minDistance={1}
            maxDistance={10}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>

      {/* Controls Panel */}
      <div className="w-full lg:w-80 bg-white rounded-2xl p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">Элементы модели</h3>

        {/* Color Picker */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Выберите цвет:</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  selectedColor === color.value
                    ? 'border-primary scale-110 shadow-lg'
                    : 'border-gray-300 hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Mesh List */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 mb-2 block">
            Нажмите на элемент чтобы изменить цвет:
          </label>
          {meshList.length === 0 ? (
            <p className="text-gray-400 text-sm">Загрузка модели...</p>
          ) : (
            meshList.map((mesh, index) => (
              <button
                key={`${mesh.name}-${index}`}
                onClick={() => {
                  setSelectedMesh(mesh.name);
                  if (onMeshSelect) onMeshSelect(mesh.name);
                }}
                className={`w-full text-left p-2 rounded-lg border transition-all ${
                  selectedMesh === mesh.name
                    ? 'border-primary bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {mesh.color && (
                    <span
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: mesh.color }}
                    />
                  )}
                  <span className="text-sm truncate">{mesh.name || `Mesh ${index + 1}`}</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500">
            Найдено элементов: {meshList.length}
          </p>
          {selectedMesh && (
            <p className="text-xs text-gray-500 mt-1">
              Выбран: {selectedMesh}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Preload the default model
useGLTF.preload('/3dmodels/bouqet/wrapped_flower_bouquet.glb');
