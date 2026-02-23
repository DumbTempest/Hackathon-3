"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { Suspense, useRef, useState, useMemo } from "react";
import * as THREE from "three";

/* ---------------- PAGE COMPONENT ---------------- */

function Page({
  index,
  currentPage,
  content,
}: {
  index: number;
  currentPage: number;
  content: React.ReactNode;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;

    const flipped = index < currentPage;
    const targetRotation = flipped ? -Math.PI : 0;

    ref.current.rotation.y = THREE.MathUtils.lerp(
      ref.current.rotation.y,
      targetRotation,
      0.15
    );
  });

  return (
    <mesh
      ref={ref}
      position={[index * 0.015, 0, 0]} // slight stack offset
      castShadow
      receiveShadow
    >
      <boxGeometry args={[3, 4, 0.02]} />
      <meshStandardMaterial color="white" />

      {/* Page Content */}
      <Html
        transform
        position={[0, 0, 0.011]}
        style={{
          width: "600px",
          height: "800px",
          background: "white",
        }}
      >
        <div
          style={{
            padding: "30px",
            fontFamily: "serif",
          }}
        >
          {content}
        </div>
      </Html>
    </mesh>
  );
}

/* ---------------- FLIPBOOK ---------------- */

function FlipBook() {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => (
        <div key={i}>
          <h1>Page {i + 1}</h1>
          <p>
            This is content for page {i + 1}. You can put text, images,
            components, or anything here.
          </p>
        </div>
      )),
    []
  );

  return (
    <group>
      {/* Book Base */}
      <mesh position={[0, 0, -0.2]} receiveShadow>
        <boxGeometry args={[3.2, 4.2, 0.3]} />
        <meshStandardMaterial color="#6b3f1d" />
      </mesh>

      {/* Pages */}
      {pages.map((content, i) => (
        <Page
          key={i}
          index={i}
          currentPage={currentPage}
          content={content}
        />
      ))}

      {/* Controls */}
      <Html position={[0, -3, 0]}>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(p - 1, 0))
            }
            style={{
              padding: "8px 16px",
              background: "black",
              color: "white",
            }}
          >
            Prev
          </button>

          <button
            onClick={() =>
              setCurrentPage((p) =>
                Math.min(p + 1, pages.length)
              )
            }
            style={{
              padding: "8px 16px",
              background: "black",
              color: "white",
            }}
          >
            Next
          </button>
        </div>
      </Html>
    </group>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function FlipBookPage() {
  return (
    <main className="h-screen w-screen">
      <Canvas
        shadows
        camera={{ position: [0, 0, 9], fov: 50 }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
        />

        <Suspense fallback={null}>
          <FlipBook />
        </Suspense>

        <OrbitControls />
      </Canvas>
    </main>
  );
}