// Four target dummies: a post, a torso and a head. A head shot kills outright, three torso
// shots do. A downed dummy falls over, then stands back up four seconds later.
import * as THREE from 'three';
import { PALETTE } from './palette.js';

const SPAWNS = [
  [-4.6, -9.2],
  [4.6, -9.2],
  [0, -7.6],
  [7.6, -6.2],
];
const HEALTH = 100;
const RESPAWN_SECONDS = 4;
const FALL_SECONDS = 0.4;

export function createTargets(scene) {
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.ink), roughness: 0.6, metalness: 0.05 });
  const headMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.accent), roughness: 0.45, metalness: 0.1 });
  const standMaterial = new THREE.MeshStandardMaterial({ color: new THREE.Color(PALETTE.hairline), roughness: 0.85 });
  const torsoGeometry = new THREE.BoxGeometry(0.52, 0.78, 0.3);
  const headGeometry = new THREE.SphereGeometry(0.155, 16, 12);\r
  const postGeometry = new THREE.BoxGeometry(0.1, 0.55, 0.1);\r
  const baseGeometry = new THREE.BoxGeometry(0.5, 0.08, 0.5);

  const items = [];
  const hitMeshes = [];
  let now = 0;

  for (let index = 0; index < SPAWNS.length; index += 1) {
    const [x, z] = SPAWNS[index];
    const group = new THREE.Group();
    group.position.set(x, 0, z);

    const base = new THREE.Mesh(baseGeometry, standMaterial);
    base.position.y = 0.04;
    const post = new THREE.Mesh(postGeometry, standMaterial);
    post.position.y = 0.3;
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 1.0;
    torso.userData.part = 'torso';
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.53;
    head.userData.part = 'head';
    group.add(base, post, torso, head);
    group.traverse((mesh) => {\r
      if (mesh.isMesh) {\r
        mesh.castShadow = true;\r
        mesh.receiveShadow = true;\r
      }\r
    });
    scene.add(group);

    const item = { group, torso, head, health: HEALTH, alive: true, fall: 0, respawnAt: 0, phase: index * 1.7, home: new THREE.Vector3(x, 0, z) };
    torso.userData.target = item;\r
    head.userData.target = item;\r
    hitMeshes.push(torso, head);\r
    items.push(item);
  }

  function damage(mesh, amount) {\r
    const item = mesh.userData.target;\r
    if (!item || !item.alive) return false;\r
    item.health -= amount;\r
    if (item.health > 0) return false;\r
    item.alive = false;\r
    item.fall = 0;\r
    item.respawnAt = now + RESPAWN_SECONDS;\r
    return true;\r
  }

  function step(dt, time) {\r
    now = time;\r
    for (const item of items) {\r
      if (item.alive) {\r
        item.group.rotation.y = Math.sin(time * 0.9 + item.phase) * 0.12;\r
        item.group.position.y = 0;\r
        continue;\r
      }\r
      item.fall = Math.min(1, item.fall + dt / FALL_SECONDS);\r
      item.group.rotation.x = -item.fall * 1.45;\r
      item.group.position.y = -item.fall * 0.08;\r
      if (time >= item.respawnAt) {\r
        item.alive = true;\r
        item.health = HEALTH;\r
        item.fall = 0;\r
        item.group.rotation.x = 0;\r
        item.group.position.y = 0;\r
      }\r
    }\r
  }

  return {\r
    items,\r
    hitMeshes,\r
    damage,\r
    step,\r
    remaining() {\r
      return items.filter((item) => item.alive).length;\r
    },\r
    aimPoint(index) {\r
      const item = items[index % items.length];\r
      return new THREE.Vector3(item.group.position.x, item.torso.position.y, item.group.position.z);\r
    },\r
    reset() {\r
      for (const item of items) {\r
        item.alive = true;\r
        item.health = HEALTH;\r
        item.fall = 0;\r
        item.group.rotation.set(0, 0, 0);\r
        item.group.position.copy(item.home);\r
      }\r
    },\r
  };\r
}
