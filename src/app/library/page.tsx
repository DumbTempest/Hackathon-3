"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import Shelf from "@/components/custom/shelf";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ---------------- TECH STACK ---------------- */

const techStack = [
  { name: "JavaScript", color: "#f7df1e" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Go", color: "#00ADD8" },
  { name: "C++", color: "#00599C" },
  { name: "Rust", color: "#DEA584" },
  { name: "Python", color: "#3776AB" },
];

/* ---------------- CAMERA CONTROLLER ---------------- */

function CameraController({
  target,
  isZoomed,
}: {
  target: THREE.Vector3 | null;
  isZoomed: boolean;
}) {
  const { camera } = useThree();

  useFrame(() => {
    const targetZoom = isZoomed ? 160 : 90;

    camera.zoom = THREE.MathUtils.lerp(camera.zoom, targetZoom, 0.08);
    camera.updateProjectionMatrix();

    if (target) {
      camera.position.lerp(
        new THREE.Vector3(target.x, target.y + 0.5, target.z + 1.5),
        0.08
      );
      camera.lookAt(target);
    } else {
      camera.position.lerp(new THREE.Vector3(10, 10, 10), 0.08);
      camera.lookAt(0, 0, 0);
    }
  });

  return null;
}

/* ---------------- MAIN PAGE ---------------- */

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [overlayColor, setOverlayColor] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const shelfFromUrl = searchParams.get("shelf");
  const initialIndex =
    shelfFromUrl !== null ? Number(shelfFromUrl) - 1 : null;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    initialIndex
  );

  const shelves: [number, number, number][] = [
    [-4, 0, -2],
    [0, 0, -2],
    [4, 0, -2],
    [-4, 0, 2],
    [0, 0, 2],
    [4, 0, 2],
  ];

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    router.push(`/library?shelf=${index + 1}`);
  };

  const handleReset = () => {
    setOverlayColor(null);
    setSelectedIndex(null);
    setResetSignal((prev) => prev + 1);
    router.push(`/library`);
  };

  return (
    <main className="absolute h-screen w-screen bg-[#0f172a] overflow-hidden">
      <Canvas
        shadows
        orthographic
        camera={{ position: [10, 10, 10], zoom: 90 }}
        onPointerMissed={handleReset}
      >
        <hemisphereLight intensity={0.4} />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.2}
          castShadow
        />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.01, 0]}
          receiveShadow
        >
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        <Suspense fallback={null}>
          {techStack.map((tech, i) => (
            <Shelf
              key={i}
              position={shelves[i]}
              index={i}
              selectedIndex={selectedIndex}
              onClick={() => handleSelect(i)}
              setOverlayColor={setOverlayColor}
              label={tech.name}
              labelColor={tech.color}
              resetSignal={resetSignal}
            />
          ))}
        </Suspense>

        <CameraController
          target={
            selectedIndex !== null
              ? new THREE.Vector3(...shelves[selectedIndex])
              : null
          }
          isZoomed={selectedIndex !== null}
        />

        <OrbitControls
          enableRotate={selectedIndex === null}
          enableZoom
          enablePan={false}
          minZoom={70}
          maxZoom={250}
        />
      </Canvas>

      <AnimatePresence>
        {overlayColor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50"
            style={{ backgroundColor: overlayColor }}
            onClick={handleReset}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

useGLTF.preload("/models/model1.glb");