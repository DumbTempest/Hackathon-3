"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

function AnimatedShelf() {
  const { scene } = useGLTF("/models/model1.glb");
  const bookRef = useRef<THREE.Object3D | null>(null);

  const progress = useRef(0); // 0 → 1 animation progress

  useEffect(() => {
    const book = scene.getObjectByName("mesh1437755864_1");
    if (book) {
      bookRef.current = book;
    }
  }, [scene]);

  useFrame((_, delta) => {
    if (!bookRef.current) return;

    if (progress.current < 1) {
      progress.current += delta * 0.5; // speed
    }

    const book = bookRef.current;

    // --- Stage 1: Slide Out (0 → 0.5)
    if (progress.current <= 0.5) {
      const slideProgress = progress.current / 0.5;
      book.position.z = THREE.MathUtils.lerp(0, 2, slideProgress);
    }

    // --- Stage 2: Rotate (0.5 → 1)
    if (progress.current > 0.5) {
      const rotateProgress = (progress.current - 0.5) / 0.5;
      book.rotation.y = THREE.MathUtils.lerp(0, Math.PI / 2, rotateProgress);
    }
  });

  return <primitive object={scene} scale={2} />;
}

export default function Book_Animation() {
  return (
    <main className="h-screen w-screen bg-white overflow-hidden">
      <Canvas className="bg-transparent" camera={{ position: [0, 2, 6], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        <Suspense fallback={null}>
          <AnimatedShelf />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </main>
  );
}