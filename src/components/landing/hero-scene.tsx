"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox } from "@react-three/drei";
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

function QrModules() {
  const groupRef = useRef<THREE.Group>(null);
  const pattern = useMemo(buildPattern, []);
  const { viewport } = useThree();
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0.35 + pointer.current.x * 0.35,
        0.04,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -0.15 + pointer.current.y * 0.2,
        0.04,
      );
    }
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

  void viewport;

  return (
    <group ref={groupRef} rotation={[-0.15, 0.35, 0]}>
      <RoundedBox args={[GRID_SIZE * CELL + 0.5, GRID_SIZE * CELL + 0.5, 0.12]} radius={0.35} smoothness={4} position={[0, 0, -0.3]}>
        <meshStandardMaterial color="#0b0b18" metalness={0.4} roughness={0.5} />
      </RoundedBox>
      {cells.map((cell, i) => (
        <Float key={i} speed={2} floatIntensity={0.35} rotationIntensity={0.08} floatingRange={[-0.03, 0.03]}>
          <RoundedBox
            args={[CELL * 0.82, CELL * 0.82, cell.accent ? 0.36 : 0.22]}
            radius={0.05}
            smoothness={2}
            position={[cell.x, cell.y, cell.accent ? 0.05 : 0]}
          >
            <meshStandardMaterial
              color={cell.accent ? "#00e5ff" : "#8f79ff"}
              emissive={cell.accent ? "#00e5ff" : "#7c5cff"}
              emissiveIntensity={cell.accent ? 1.1 : 0.55}
              metalness={0.3}
              roughness={0.35}
            />
          </RoundedBox>
        </Float>
      ))}
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

export default function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7.2], fov: 42 }}
      className="!touch-none"
    >
      <Lights />
      <Float speed={1.4} floatIntensity={0.6} rotationIntensity={0}>
        <QrModules />
      </Float>
      <fog attach="fog" args={["#06060b", 8, 16]} />
    </Canvas>
  );
}
