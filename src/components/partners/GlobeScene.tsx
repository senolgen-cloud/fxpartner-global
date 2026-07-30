"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { QuadraticBezierLine } from "@react-three/drei";
import * as THREE from "three";

// Mirrors the brand tokens in globals.css (--signal, --gold, --ink,
// --ink-soft). Hardcoded here since this scene renders client-only, inside
// a WebGL canvas that can't read CSS custom properties directly.
const SIGNAL = "#2f6ff0";
const GOLD = "#c9a227";
const INK_SOFT = "#17191c";

const GLOBE_RADIUS = 1.6;

// A handful of real-world city coordinates, used only to place "node"
// points on the globe in a way that reads as a genuine global network.
const NODES: { lat: number; lon: number }[] = [
  { lat: 51.5, lon: -0.1 }, // London
  { lat: 40.7, lon: -74.0 }, // New York
  { lat: 25.2, lon: 55.3 }, // Dubai
  { lat: 1.35, lon: 103.8 }, // Singapore
  { lat: -33.9, lon: 151.2 }, // Sydney
  { lat: -26.2, lon: 28.0 }, // Johannesburg
  { lat: -23.6, lon: -46.6 }, // São Paulo
  { lat: 35.7, lon: 139.7 }, // Tokyo
  { lat: 41.0, lon: 28.9 }, // Istanbul
  { lat: 19.1, lon: 72.9 }, // Mumbai
  { lat: 52.5, lon: 13.4 }, // Berlin
  { lat: 1.3, lon: -47.9 }, // (Americas spread)
];

const ARC_PAIRS: [number, number][] = [
  [0, 1],
  [0, 8],
  [1, 6],
  [2, 9],
  [3, 4],
  [2, 3],
  [7, 3],
  [10, 0],
  [5, 2],
];

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function Nodes() {
  const positions = useMemo(
    () => NODES.map((n) => latLonToVector3(n.lat, n.lon, GLOBE_RADIUS * 1.01)),
    []
  );
  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const scale = 1 + Math.sin(t * 1.6 + i) * 0.25;
      mesh.scale.setScalar(scale);
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            if (el) meshRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshBasicMaterial color={i % 5 === 0 ? GOLD : SIGNAL} />
        </mesh>
      ))}
    </>
  );
}

function Arcs() {
  const positions = useMemo(
    () => NODES.map((n) => latLonToVector3(n.lat, n.lon, GLOBE_RADIUS * 1.01)),
    []
  );

  return (
    <>
      {ARC_PAIRS.map(([a, b], i) => {
        const start = positions[a];
        const end = positions[b];
        const mid = start
          .clone()
          .add(end)
          .multiplyScalar(0.5)
          .normalize()
          .multiplyScalar(GLOBE_RADIUS * 1.55);
        return (
          <QuadraticBezierLine
            key={i}
            start={start}
            end={end}
            mid={mid}
            color={SIGNAL}
            lineWidth={1}
            transparent
            opacity={0.55}
            dashed
            dashSize={0.05}
            dashScale={2}
            gapSize={0.03}
          />
        );
      })}
    </>
  );
}

function GlobeGroup() {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={group}>
      {/* Solid inner core, glowing through the wireframe shell */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS * 0.97, 48, 48]} />
        <meshStandardMaterial
          color={INK_SOFT}
          emissive={SIGNAL}
          emissiveIntensity={0.12}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>
      {/* Wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[GLOBE_RADIUS, 3]} />
        <meshBasicMaterial color={SIGNAL} wireframe transparent opacity={0.22} />
      </mesh>
      <Nodes />
      <Arcs />
    </group>
  );
}

function PointerCamera() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 5));

  useFrame(() => {
    target.current.x = pointer.x * 0.6;
    target.current.y = pointer.y * 0.35 + 0.2;
    target.current.z = 5;
    camera.position.lerp(target.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function GlobeScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.2, 5], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 3, 5]} intensity={1.1} color={SIGNAL} />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color={GOLD} />
      <GlobeGroup />
      <PointerCamera />
    </Canvas>
  );
}
