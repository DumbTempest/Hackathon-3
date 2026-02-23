"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Text } from "@react-three/drei";
import { Suspense } from "react";

function Model() {
  const { scene } = useGLTF("/models/model1.glb");

  return (
    <primitive
      object={scene}
      scale={2}
      position={[0, 0, 0]}
    />
  );
}

function ModelWithText() {
  const { scene } = useGLTF("/models/model1.glb");

  return (
    <>
      <primitive
        object={scene}
        scale={2}
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
      />

      {/* 3D Text */}
      <Text
        position={[0, 2, 0]}   // adjust position
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        My Shelf
      </Text>
    </>
  );
}

export default function Home() {
  return (
    <main className="absolute h-screen w-screen bg-transparent overflow-hidden">

  <Canvas
    className="relative inset-0 z-10"
    camera={{ position: [0, 2, 5], fov: 50 }}
  >
    <ambientLight intensity={0.8} />
    <directionalLight position={[5, 0, 0]} intensity={1} />

    <Suspense fallback={null}>
      <Model />
    </Suspense>
    <Suspense fallback={null}>
  <ModelWithText />
</Suspense>

    <OrbitControls />
  </Canvas>

  <div className="absolute z-10 flex h-full flex-col items-center justify-center text-white text-center px-6 top-10 pointer-events-none">
    <h1 className="text-5xl md:text-7xl font-bold">
      My 3D Showcase
    </h1>

    <p className="mt-6 text-lg md:text-xl max-w-xl opacity-80">
      Built with Next.js, React Three Fiber, and GLB models.
    </p>

    <button className="mt-8 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:scale-105 transition">
      Explore
    </button>
  </div>

</main>
  );
}