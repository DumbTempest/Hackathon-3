"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
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

/* ---------------- SHELF COMPONENT ---------------- */

function Shelf({
  position,
  index,
  selectedIndex,
  onClick,
  setOverlayColor,
  label,
  labelColor,
  resetSignal,
}: {
  position: [number, number, number];
  index: number;
  selectedIndex: number | null;
  onClick: () => void;
  setOverlayColor: (color: string) => void;
  label: string;
  labelColor: string;
  resetSignal: number;
}) {
  const { scene } = useGLTF("/models/model1.glb");
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<any>();
  const { camera } = useThree();

  const [innerMesh, setInnerMesh] = useState<THREE.Object3D | null>(null);
  const [outerMesh, setOuterMesh] = useState<THREE.Object3D | null>(null);

  const originalTransforms = useRef<{
    inner?: { pos: THREE.Vector3; rot: THREE.Euler };
    outer?: { pos: THREE.Vector3; rot: THREE.Euler };
  }>({});

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  /* -------- Book Animation -------- */

  useFrame(() => {
    if (innerMesh && outerMesh && originalTransforms.current.inner) {
      const forwardOffset = -0.2;
      const rotationTarget = -Math.PI / 2;

      innerMesh.position.z = THREE.MathUtils.lerp(
        innerMesh.position.z,
        originalTransforms.current.inner.pos.z + forwardOffset,
        0.08
      );

      outerMesh.position.z = THREE.MathUtils.lerp(
        outerMesh.position.z,
        originalTransforms.current.outer!.pos.z + forwardOffset,
        0.08
      );

      innerMesh.rotation.y = THREE.MathUtils.lerp(
        innerMesh.rotation.y,
        rotationTarget,
        0.08
      );

      outerMesh.rotation.y = THREE.MathUtils.lerp(
        outerMesh.rotation.y,
        rotationTarget,
        0.08
      );
    }

    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  /* -------- Reset Logic -------- */

  useEffect(() => {
    if (
      originalTransforms.current.inner &&
      originalTransforms.current.outer &&
      innerMesh &&
      outerMesh
    ) {
      innerMesh.position.copy(originalTransforms.current.inner.pos);
      innerMesh.rotation.copy(originalTransforms.current.inner.rot);

      outerMesh.position.copy(originalTransforms.current.outer.pos);
      outerMesh.rotation.copy(originalTransforms.current.outer.rot);

      setInnerMesh(null);
      setOuterMesh(null);
    }
  }, [resetSignal]);

  /* -------- Click Handler -------- */

  const handleMeshClick = (e: any) => {
    e.stopPropagation();

    const clickedName = e.object.name;

    if (clickedName.endsWith("_1")) {
      const baseName = clickedName.replace("_1", "");

      const inner = groupRef.current?.getObjectByName(baseName);
      const outer = groupRef.current?.getObjectByName(clickedName);

      if (inner && outer) {
        setInnerMesh(inner);
        setOuterMesh(outer);

        if (!originalTransforms.current.inner) {
          originalTransforms.current.inner = {
            pos: inner.position.clone(),
            rot: inner.rotation.clone(),
          };
        }

        if (!originalTransforms.current.outer) {
          originalTransforms.current.outer = {
            pos: outer.position.clone(),
            rot: outer.rotation.clone(),
          };
        }

        const material = (outer as any).material;
        if (material?.color) {
          const hexColor = `#${material.color.getHexString()}`;
          setTimeout(() => {
            setOverlayColor(hexColor);
          }, 600);
        }
      }
    }
  };

  if (selectedIndex !== null && selectedIndex !== index) return null;

  return (
    <group position={position} onClick={onClick}>
      <group
        ref={groupRef}
        onPointerDown={selectedIndex !== null ? handleMeshClick : undefined}
      >
        <primitive object={clonedScene} scale={2} rotation={[0, Math.PI, 0]} />

        <Text
          ref={textRef}
          position={[0, 2, 0]}
          fontSize={0.45}
          font="/fonts/Tektur-VariableFont_wdth,wght.ttf"
          color={labelColor}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      </group>
    </group>
  );
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