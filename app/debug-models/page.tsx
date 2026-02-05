'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import Link from 'next/link';
import { ArrowLeft, Copy, Check } from 'lucide-react';

interface MeshInfo {
  name: string;
  materialName: string;
  color: string | null;
  hasTexture: boolean;
  vertexCount: number;
  path: string;
}

function ModelAnalyzer({ modelPath, onAnalyzed }: { modelPath: string; onAnalyzed: (info: MeshInfo[]) => void }) {
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    const meshes: MeshInfo[] = [];

    const getPath = (obj: THREE.Object3D): string => {
      const parts: string[] = [];
      let current: THREE.Object3D | null = obj;
      while (current && current.parent) {
        parts.unshift(current.name || current.type);
        current = current.parent;
      }
      return parts.join(' > ');
    };

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial;
        meshes.push({
          name: child.name || 'unnamed',
          materialName: mat?.name || 'unnamed',
          color: mat?.color ? `#${mat.color.getHexString()}` : null,
          hasTexture: !!(mat?.map),
          vertexCount: child.geometry?.attributes?.position?.count || 0,
          path: getPath(child),
        });
      }
    });

    onAnalyzed(meshes);
  }, [scene, onAnalyzed]);

  return (
    <Center>
      <primitive object={scene} scale={1} />
    </Center>
  );
}

const models = [
  { name: 'Букет', path: '/3dmodels/bouqet/wrapped_flower_bouquet.glb' },
  { name: 'Роза', path: '/3dmodels/flowers/pink_rose.glb' },
  { name: 'Сакура', path: '/3dmodels/flowers/cc0__youko_sakura_prunus_yoko.glb' },
];

export default function DebugModelsPage() {
  const [selectedModel, setSelectedModel] = useState(0);
  const [meshInfo, setMeshInfo] = useState<MeshInfo[]>([]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = JSON.stringify(meshInfo, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="border-b border-gray-700 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
          <span>Назад</span>
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 h-[calc(100vh-57px)]">
        {/* 3D View */}
        <div className="bg-gray-800">
          <div className="flex gap-2 p-4 bg-gray-900">
            {models.map((m, i) => (
              <button
                key={m.path}
                onClick={() => {
                  setSelectedModel(i);
                  setMeshInfo([]);
                }}
                className={`px-4 py-2 rounded-lg text-sm ${
                  selectedModel === i
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          <div className="h-[500px]">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <Suspense fallback={null}>
                <ModelAnalyzer
                  key={models[selectedModel].path}
                  modelPath={models[selectedModel].path}
                  onAnalyzed={setMeshInfo}
                />
              </Suspense>
              <OrbitControls />
            </Canvas>
          </div>
        </div>

        {/* Info Panel */}
        <div className="bg-gray-900 overflow-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Структура: {models[selectedModel].name}
            </h2>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm hover:bg-gray-600"
            >
              {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Скопировано!' : 'Копировать JSON'}
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Всего мешей: <span className="text-white font-bold">{meshInfo.length}</span></p>
            <p className="text-gray-400">С текстурами: <span className="text-white font-bold">{meshInfo.filter(m => m.hasTexture).length}</span></p>
            <p className="text-gray-400">С цветом: <span className="text-white font-bold">{meshInfo.filter(m => m.color).length}</span></p>
          </div>

          <div className="space-y-2">
            {meshInfo.map((mesh, i) => (
              <div key={i} className="p-3 bg-gray-800 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-blue-400">{mesh.name}</span>
                  {mesh.color && (
                    <span
                      className="w-4 h-4 rounded border border-gray-600"
                      style={{ backgroundColor: mesh.color }}
                    />
                  )}
                </div>
                <p className="text-gray-500 text-xs font-mono mb-1">{mesh.path}</p>
                <div className="flex gap-4 text-xs text-gray-400">
                  <span>Material: {mesh.materialName}</span>
                  <span>{mesh.vertexCount} vertices</span>
                  {mesh.hasTexture && <span className="text-yellow-400">📷 texture</span>}
                </div>
              </div>
            ))}
          </div>

          {meshInfo.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold mb-2">Вывод для конфигуратора:</h3>
              <div className="p-4 bg-gray-800 rounded-lg text-sm">
                {meshInfo.filter(m => m.color || !m.hasTexture).length > 0 ? (
                  <p className="text-green-400">✅ Можно менять цвета у {meshInfo.filter(m => m.color).length} мешей</p>
                ) : (
                  <p className="text-yellow-400">⚠️ Все меши текстурированы - сложнее менять цвет</p>
                )}
                {meshInfo.some(m => m.name.toLowerCase().includes('flower') || m.name.toLowerCase().includes('petal')) && (
                  <p className="text-green-400">✅ Есть именованные части цветов</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
