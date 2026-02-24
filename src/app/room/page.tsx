"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Clone,
  Text,
} from "@react-three/drei";
import { Suspense, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Navbar from "@/components/custom/navbar";

/* ---------------- ROOM MODEL ---------------- */

type RoomProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
  scale: number;
  link: string;
  onSelect: (position: [number, number, number], link: string) => void;
  disabled: boolean;
};

function RoomModel({
  position,
  rotation,
  label,
  scale,
  link,
  onSelect,
  disabled,
}: RoomProps) {
  const { scene } = useGLTF("/models/rooms.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!groupRef.current) return;

    const targetScale = hovered && !disabled ? scale * 1.08 : scale;

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={() => !disabled && onSelect(position, link)}
      onPointerOver={() => {
        if (disabled) return;
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <Clone object={scene} />

      <Text
        position={[8, 5, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={4}
        font="/fonts/Tektur-VariableFont_wdth,wght.ttf"
        color={hovered ? "#00ffff" : "black"}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

/* ---------------- CAMERA CONTROLLER ---------------- */

function CameraController({
  target,
  onArrive,
}: {
  target: THREE.Vector3 | null;
  onArrive: () => void;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (!target) return;

    const desiredPosition = new THREE.Vector3(
      target.x,
      target.y + 80,
      target.z + 120
    );

    camera.position.lerp(desiredPosition, 0.05);
    camera.lookAt(target);

    if (camera.position.distanceTo(desiredPosition) < 1) {
      onArrive();
    }
  });

  return null;
}

/* ---------------- SCENE ---------------- */

function Scene({
  onRoomSelect,
  disabled,
}: {
  onRoomSelect: (pos: [number, number, number], link: string) => void;
  disabled: boolean;
}) {
  const modelScale = 3;
  const spacingX = 90;
  const spacingZ = 110;
  const globalOffsetX = -80;
  const rotation: [number, number, number] = [0, Math.PI / 2, 0];

  const items = useMemo(
    () => [
      { label: "Web Dev", link: "/library/web-dev" },
      { label: "AI / ML", link: "/library/ai-ml" },
      { label: "Blockchain", link: "/library/blockchain" },
      { label: "CyberSec", link: "/library/cybersec" },
      { label: "Robotics", link: "/library/robotics" },
      { label: "Cloud", link: "/library/cloud" },
    ],
    []
  );

  const models = [];

  let index = 0;
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const item = items[index++];

      const position: [number, number, number] = [
        col * spacingX + globalOffsetX,
        0,
        row * spacingZ,
      ];

      models.push(
        <RoomModel
          key={`${row}-${col}`}
          position={position}
          rotation={rotation}
          label={item.label}
          link={item.link}
          scale={modelScale}
          onSelect={onRoomSelect}
          disabled={disabled}
        />
      );
    }
  }

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[50, 80, 50]} intensity={2} />
      {models}
    </>
  );
}

/* ---------------- MAIN PAGE ---------------- */

export default function RoomGridPage() {
  const router = useRouter();

  const [target, setTarget] = useState<THREE.Vector3 | null>(null);
  const [nextRoute, setNextRoute] = useState<string | null>(null);
  const [fade, setFade] = useState(false);
  const [locked, setLocked] = useState(false);

  const handleRoomSelect = (
    pos: [number, number, number],
    link: string
  ) => {
    if (locked) return;

    setLocked(true);
    setTarget(new THREE.Vector3(...pos));
    setNextRoute(link);
  };

  const handleArrive = () => {
    setFade(true);
  };

  return (
    <div className="w-screen bg-[#FAF3E1] h-screen relative overflow-hidden">
      <div className="absolute top-10 right-11 w-full z-50">
        <Navbar />
      </div>

      <Canvas
        camera={{
          position: [200, 200, 360],
          fov: 50,
        }}
      >
        <Suspense fallback={null}>
          <Scene
            onRoomSelect={handleRoomSelect}
            disabled={locked}
          />
          <CameraController
            target={target}
            onArrive={handleArrive}
          />
        </Suspense>
      </Canvas>

      <AnimatePresence>
        {fade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-black z-40"
            onAnimationComplete={() => {
              if (nextRoute) router.push(nextRoute);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* Preload model */
useGLTF.preload("/models/rooms.glb");