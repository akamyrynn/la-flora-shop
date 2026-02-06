// Deep analysis of GLB model
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import fs from 'fs';

const filePath = process.argv[2] || './public/3dmodels/bouqet/Meshy_AI_Radiant_Roses_0206171322_generate.glb';

const buffer = fs.readFileSync(filePath);
const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
const loader = new GLTFLoader();

loader.parse(arrayBuffer, '', (gltf) => {
  const scene = gltf.scene;

  console.log('=== GLTF INFO ===');
  console.log('Animations:', gltf.animations.length);
  console.log('Cameras:', gltf.cameras.length);

  if (gltf.parser) {
    console.log('Parser associations count:', gltf.parser.associations ? gltf.parser.associations.size : 'N/A');
  }

  scene.traverse((child) => {
    if (child.isMesh) {
      console.log('\n=== MESH:', child.name, '===');

      const geo = child.geometry;
      console.log('Geometry type:', geo.type);
      console.log('Index:', geo.index ? `${geo.index.count} indices` : 'none');

      console.log('\nAttributes:');
      for (const [attrName, attr] of Object.entries(geo.attributes)) {
        console.log(`  ${attrName}: count=${attr.count}, itemSize=${attr.itemSize}, type=${attr.array.constructor.name}`);
      }

      console.log('\nGroups (submeshes):');
      if (geo.groups && geo.groups.length > 0) {
        geo.groups.forEach((g, i) => {
          console.log(`  Group ${i}: start=${g.start}, count=${g.count}, materialIndex=${g.materialIndex}`);
        });
      } else {
        console.log('  No groups (single draw call)');
      }

      console.log('\nMorphTargets:');
      if (geo.morphAttributes && Object.keys(geo.morphAttributes).length > 0) {
        for (const [key, targets] of Object.entries(geo.morphAttributes)) {
          console.log(`  ${key}: ${targets.length} targets`);
        }
      } else {
        console.log('  None');
      }

      console.log('\nMaterial:');
      const mat = child.material;
      if (Array.isArray(mat)) {
        console.log('  MULTI-MATERIAL:', mat.length, 'materials');
        mat.forEach((m, i) => {
          console.log(`  [${i}] ${m.name} | type: ${m.type} | color: ${m.color ? '#' + m.color.getHexString() : 'none'}`);
        });
      } else {
        console.log('  Type:', mat.type);
        console.log('  Name:', mat.name);
        console.log('  Color:', mat.color ? '#' + mat.color.getHexString() : 'none');
        console.log('  Map (baseColor):', mat.map ? 'YES' : 'no');
        console.log('  NormalMap:', mat.normalMap ? 'YES' : 'no');
        console.log('  RoughnessMap:', mat.roughnessMap ? 'YES' : 'no');
        console.log('  MetalnessMap:', mat.metalnessMap ? 'YES' : 'no');
        console.log('  EmissiveMap:', mat.emissiveMap ? 'YES' : 'no');
        console.log('  AOMap:', mat.aoMap ? 'YES' : 'no');
        console.log('  Metalness:', mat.metalness);
        console.log('  Roughness:', mat.roughness);
        console.log('  Opacity:', mat.opacity);
        console.log('  Transparent:', mat.transparent);
        console.log('  DoubleSide:', mat.side === THREE.DoubleSide);
        console.log('  VertexColors:', mat.vertexColors);
      }

      // Check for vertex colors
      if (geo.attributes.color) {
        console.log('\n  VERTEX COLORS FOUND!');
        const colors = geo.attributes.color;
        // Sample some colors
        const uniqueColors = new Set();
        for (let i = 0; i < Math.min(colors.count, 10000); i += 100) {
          const r = colors.getX(i).toFixed(2);
          const g = colors.getY(i).toFixed(2);
          const b = colors.getZ(i).toFixed(2);
          uniqueColors.add(`${r},${g},${b}`);
        }
        console.log('  Sample unique colors (from first 10k verts):', uniqueColors.size);
        for (const c of [...uniqueColors].slice(0, 20)) {
          console.log(`    rgb(${c})`);
        }
      }

      // Check bounding box
      geo.computeBoundingBox();
      const bb = geo.boundingBox;
      console.log(`\n  Bounding box: (${bb.min.x.toFixed(3)}, ${bb.min.y.toFixed(3)}, ${bb.min.z.toFixed(3)}) to (${bb.max.x.toFixed(3)}, ${bb.max.y.toFixed(3)}, ${bb.max.z.toFixed(3)})`);

      // Total vertex count
      console.log(`  Total vertices: ${geo.attributes.position.count}`);
      console.log(`  Total triangles: ${geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3}`);
    }
  });

}, (err) => console.error('Parse error:', err));
