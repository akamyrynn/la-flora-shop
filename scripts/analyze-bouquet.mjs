// Run with: node scripts/analyze-bouquet.mjs
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

const filePath = process.argv[2] || './public/3dmodels/bouqet/Meshy_AI_Radiant_Roses_0206171322_generate.glb';

const buffer = fs.readFileSync(filePath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const loader = new GLTFLoader();

function getDepth(obj) {
  let d = 0, c = obj;
  while (c.parent) { d++; c = c.parent; }
  return d;
}

loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;

  console.log('=== FULL SCENE HIERARCHY ===');
  let meshIndex = 0;
  scene.traverse((child) => {
    const indent = '  '.repeat(getDepth(child));
    const type = child.type;
    const name = child.name || '(unnamed)';

    if (child.isMesh) {
      meshIndex++;
      const mat = child.material;
      const matName = mat ? mat.name : 'unnamed';
      const color = (mat && mat.color) ? '#' + mat.color.getHexString() : 'none';
      const hasTexture = mat && mat.map ? true : false;
      const verts = (child.geometry && child.geometry.attributes && child.geometry.attributes.position)
        ? child.geometry.attributes.position.count : 0;
      const bb = new THREE.Box3().setFromObject(child);
      const size = new THREE.Vector3();
      bb.getSize(size);
      console.log(`${indent}[MESH #${meshIndex}] ${name} | mat: ${matName} | color: ${color} | tex: ${hasTexture} | verts: ${verts} | size: ${size.x.toFixed(3)}x${size.y.toFixed(3)}x${size.z.toFixed(3)}`);
    } else {
      const childCount = child.children.length;
      console.log(`${indent}[${type}] ${name} (children: ${childCount})`);
    }
  });

  console.log('\n=== MATERIALS SUMMARY ===');
  const materials = new Map();
  scene.traverse((child) => {
    if (child.isMesh) {
      const mat = child.material;
      const key = mat ? mat.name : 'unnamed';
      if (!materials.has(key)) {
        materials.set(key, {
          color: (mat && mat.color) ? '#' + mat.color.getHexString() : 'none',
          hasMap: mat && mat.map ? true : false,
          hasNormalMap: mat && mat.normalMap ? true : false,
          metalness: mat ? mat.metalness : null,
          roughness: mat ? mat.roughness : null,
          meshes: []
        });
      }
      materials.get(key).meshes.push(child.name || '(unnamed)');
    }
  });

  for (const [name, info] of materials) {
    console.log(`\nMaterial: ${name}`);
    console.log(`  Color: ${info.color} | Map: ${info.hasMap} | Normal: ${info.hasNormalMap} | Metalness: ${info.metalness} | Roughness: ${info.roughness}`);
    console.log(`  Used by meshes: ${info.meshes.join(', ')}`);
  }

  console.log('\n=== TOP-LEVEL CHILDREN ===');
  scene.children.forEach((child, i) => {
    console.log(`${i}: [${child.type}] ${child.name || '(unnamed)'} — direct children: ${child.children.length}`);
  });

  // Also print group-level info for easy understanding
  console.log('\n=== GROUPS WITH THEIR MESHES ===');
  scene.traverse((child) => {
    if ((child.isGroup || child.isObject3D) && child.children.length > 0) {
      const meshChildren = [];
      child.children.forEach((c) => {
        if (c.isMesh) {
          meshChildren.push(c.name || '(unnamed)');
        }
      });
      if (meshChildren.length > 0) {
        console.log(`\nGroup: "${child.name || '(unnamed)'}"`);
        console.log(`  Mesh children: ${meshChildren.join(', ')}`);
      }
    }
  });

}, (err) => console.error('Parse error:', err));
