"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useWindowPointer } from "@/hooks/use-window-pointer";

/**
 * Three drifting layers of "glowing dust" at different depths, gently
 * parallaxing opposite to the cursor for a sense of depth behind the page
 * content. Uses drei's instanced `Sparkles` (a handful of draw calls total)
 * rather than a bespoke particle system, keeping GPU cost negligible.
 */
function DustField() {
  const group = useRef<THREE.Group>(null);
  const pointer = useWindowPointer();

  useFrame(() => {
    if (!group.current) return;
    const { x, y } = pointer.current;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, -x * 1.1, 0.025);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -y * 0.7, 0.025);
    group.current.rotation.z = THREE.MathUtils.lerp(group.current.rotation.z, x * 0.03, 0.02);
  });

  return (
    <group ref={group}>
      <Sparkles count={70} scale={[15, 9, 4]} size={2.2} speed={0.22} opacity={0.6} color="#8f79ff" noise={1} position={[0, 0, -1]} />
      <Sparkles count={50} scale={[18, 10, 8]} size={1.6} speed={0.14} opacity={0.45} color="#00e5ff" noise={1.1} position={[0, 0, -4]} />
      <Sparkles count={35} scale={[20, 12, 12]} size={3} speed={0.09} opacity={0.3} color="#ff3df2" noise={0.9} position={[0, 0, -7]} />
    </group>
  );
}

export default function ParticleScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      camera={{ position: [0, 0, 10], fov: 55 }}
      className="!touch-none"
    >
      <DustField />
    </Canvas>
  );
}
