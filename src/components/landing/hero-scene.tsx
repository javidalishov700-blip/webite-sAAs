"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const GRID_SIZE = 11;
const CELL = 0.34;
const FINDER = 3;

function buildPattern(): boolean[][] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const grid: boolean[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));

  const stampFinder = (ox: number, oy: number) => {
    for (let y = 0; y < FINDER; y++) {
      for (let x = 0; x < FINDER; x++) {
        const edge = x === 0 || x === FINDER - 1 || y === 0 || y === FINDER - 1;
        grid[oy + y][ox + x] = edge || (x === 1 && y === 1);
      }
    }
  };
  stampFinder(0, 0);
  stampFinder(GRID_SIZE - FINDER, 0);
  stampFinder(0, GRID_SIZE - FINDER);

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const inTopLeft = x < FINDER + 1 && y < FINDER + 1;
      const inTopRight = x > GRID_SIZE - FINDER - 2 && y < FINDER + 1;
      const inBottomLeft = x < FINDER + 1 && y > GRID_SIZE - FINDER - 2;
      if (inTopLeft || inTopRight || inBottomLeft) continue;
      grid[y][x] = rand() > 0.56;
    }
  }
  return grid;
}

function QrModules({ hovering }: { hovering: MutableRefObject<boolean> }) {
  const groupRef = useRef<THREE.Group>(null);
  const pattern = useMemo(buildPattern, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const over = hovering.current;
    const targetY = over ? state.pointer.x * 0.55 : 0;
    const targetX = over ? -state.pointer.y * 0.32 : 0;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.1);
  });

  const cells = useMemo(() => {
    const out: { x: number; y: number; delay: number; accent: boolean }[] = [];
    const offset = (GRID_SIZE * CELL) / 2;
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!pattern[y][x]) continue;
        const isFinderCorner =
          (x < FINDER + 1 && y < FINDER + 1) ||
          (x > GRID_SIZE - FINDER - 2 && y < FINDER + 1) ||
          (x < FINDER + 1 && y > GRID_SIZE - FINDER - 2);
        out.push({
          x: x * CELL - offset,
          y: -(y * CELL - offset),
          delay: (x + y) * 0.05,
          accent: isFinderCorner,
        });
      }
    }
    return out;
  }, [pattern]);

  return (
    <group ref={groupRef}>
      {/* Brushed-metal backplate, lit by the procedural environment below */}
      <RoundedBox args={[GRID_SIZE * CELL + 0.5, GRID_SIZE * CELL + 0.5, 0.12]} radius={0.35} smoothness={4} position={[0, 0, -0.3]}>
        <meshPhysicalMaterial
          color="#0b0b18"
          metalness={0.9}
          roughness={0.28}
          clearcoat={1}
          clearcoatRoughness={0.2}
          envMapIntensity={1.4}
        />
      </RoundedBox>
      {/* Frosted glass cover pane, sitting just in front of the metal plate */}
      <RoundedBox args={[GRID_SIZE * CELL + 0.62, GRID_SIZE * CELL + 0.62, 0.04]} radius={0.4} smoothness={4} position={[0, 0, -0.36]}>
        <meshPhysicalMaterial
          color="#8f79ff"
          transparent
          opacity={0.16}
          roughness={0.05}
          metalness={0}
          clearcoat={1}
          transmission={0.9}
          thickness={0.4}
          ior={1.2}
          envMapIntensity={1.2}
        />
      </RoundedBox>
      {cells.map((cell, i) => (
        <Float key={i} speed={2} floatIntensity={0.35} rotationIntensity={0.08} floatingRange={[-0.03, 0.03]}>
          <RoundedBox
            args={[CELL * 0.82, CELL * 0.82, cell.accent ? 0.36 : 0.22]}
            radius={0.05}
            smoothness={2}
            position={[cell.x, cell.y, cell.accent ? 0.05 : 0]}
          >
            <meshPhysicalMaterial
              color={cell.accent ? "#00e5ff" : "#8f79ff"}
              emissive={cell.accent ? "#00e5ff" : "#7c5cff"}
              emissiveIntensity={cell.accent ? 1.1 : 0.55}
              metalness={0.4}
              roughness={0.3}
              clearcoat={0.6}
              clearcoatRoughness={0.25}
              envMapIntensity={1}
            />
          </RoundedBox>
        </Float>
      ))}
      <Sparkles count={45} scale={[6, 6, 3]} size={1.8} speed={0.3} opacity={0.7} color="#c9bfff" noise={0.6} />
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 3, 5]} intensity={60} color="#8f79ff" />
      <pointLight position={[-5, -3, 3]} intensity={40} color="#00e5ff" />
      <pointLight position={[0, 0, 6]} intensity={25} color="#ffffff" />
    </>
  );
}

/** Fully procedural (no external HDRI fetch) environment rig for realistic
 *  metal/glass reflections, tinted to the brand's violet/cyan/magenta palette. */
function BrandEnvironment() {
  return (
    <Environment resolution={128}>
      <Lightformer intensity={3} color="#8f79ff" position={[0, 4, -4]} scale={[8, 4, 1]} />
      <Lightformer intensity={2} color="#00e5ff" position={[-4, -2, 3]} scale={[5, 3, 1]} />
      <Lightformer intensity={1.4} color="#ff3df2" position={[4, 1, 4]} scale={[4, 4, 1]} />
      <Lightformer intensity={1} color="#ffffff" position={[0, -4, 4]} scale={[6, 2, 1]} />
    </Environment>
  );
}

export default function HeroScene() {
  const hovering = useRef(false);
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      className="!touch-none"
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
      }}
    >
      <Lights />
      <BrandEnvironment />
      <Float speed={1.4} floatIntensity={0.6} rotationIntensity={0}>
        <QrModules hovering={hovering} />
      </Float>
      <fog attach="fog" args={["#06060b", 8, 16]} />
    </Canvas>
  );
}
