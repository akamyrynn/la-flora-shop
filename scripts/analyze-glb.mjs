// Run with: node scripts/analyze-glb.mjs
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';
import path from 'path';

const modelsDir = './public/3dmodels';

async function analyzeGLB(filePath) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Analyzing: ${filePath}`);
  console.log('='.repeat(60));

  const buffer = fs.readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', (gltf) => {
      const scene = gltf.scene;

      console.log('\n📦 Scene structure:');

      let meshCount = 0;
      let materialCount = 0;
      const materials = new Set();
      const meshes = [];

      scene.traverse((child) => {
        const indent = '  '.repeat(getDepth(child, scene));

        if (child instanceof THREE.Mesh) {
          meshCount++;
          const mat = child.material;
          const matName = mat?.name || 'unnamed';
          materials.add(matName);

          meshes.push({
            name: child.name || `mesh_${meshCount}`,
            material: matName,
            hasTexture: !!mat?.map,
            color: mat?.color ? `#${mat.color.getHexString()}` : null,
            vertexCount: child.geometry?.attributes?.position?.count || 0,
          });

          console.log(`${indent}🔷 Mesh: "${child.name || 'unnamed'}" (${child.geometry?.attributes?.position?.count || 0} vertices)`);
          console.log(`${indent}   Material: ${matName}`);
          if (mat?.color) console.log(`${indent}   Color: #${mat.color.getHexString()}`);
          if (mat?.map) console.log(`${indent}   Has texture map`);
        } else if (child instanceof THREE.Group || child instanceof THREE.Object3D) {
          if (child.name) {
            console.log(`${indent}📁 Group: "${child.name}"`);
          }
        }
      });

      console.log('\n📊 Summary:');
      console.log(`   Total meshes: ${meshCount}`);
      console.log(`   Unique materials: ${materials.size}`);
      console.log(`   Materials: ${[...materials].join(', ')}`);

      // Check if model is suitable for customization
      console.log('\n🎨 Customization potential:');
      const hasNamedMeshes = meshes.some(m => m.name && !m.name.startsWith('mesh_'));
      const hasColors = meshes.some(m => m.color);
      const hasTextures = meshes.some(m => m.hasTexture);

      console.log(`   Named meshes: ${hasNamedMeshes ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   Color materials: ${hasColors ? 'Yes ✅' : 'No ❌'}`);
      console.log(`   Textured: ${hasTextures ? 'Yes ✅' : 'No ❌'}`);

      if (meshes.length <= 20) {
        console.log('\n📋 All meshes:');
        meshes.forEach((m, i) => {
          console.log(`   ${i + 1}. ${m.name} | ${m.material} | ${m.color || 'textured'} | ${m.vertexCount} verts`);
        });
      }

      resolve({ meshCount, materials: [...materials], meshes });
    }, reject);
  });
}

function getDepth(obj, root) {
  let depth = 0;
  let current = obj;
  while (current.parent && current !== root) {
    depth++;
    current = current.parent;
  }
  return depth;
}

async function main() {
  const files = [
    path.join(modelsDir, 'bouqet/wrapped_flower_bouquet.glb'),
    path.join(modelsDir, 'flowers/pink_rose.glb'),
    path.join(modelsDir, 'flowers/cc0__youko_sakura_prunus_yoko.glb'),
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      await analyzeGLB(file);
    } else {
      console.log(`File not found: ${file}`);
    }
  }
}

main().catch(console.error);
