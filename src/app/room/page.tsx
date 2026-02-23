"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Clone,
  Text,
} from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

type RoomProps = {
  position: [number, number, number];
  rotation: [number, number, number];
  label: string;
  scale: number;
  link: string;
};

function RoomModel({
  position,
  rotation,
  label,
  scale,
  link,
}: RoomProps) {
  const { scene } = useGLTF("/models/rooms.glb");
  const router = useRouter();

  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth hover scaling
  useFrame(() => {
    if (!groupRef.current) return;

    const targetScale = hovered ? scale * 1.08 : scale;

    groupRef.current.scale.lerp(
      new THREE.Vector3(targetScale, targetScale, targetScale),
      0.1
    );
  });

  const handleClick = () => {
    router.push(link);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => {
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
        color={hovered ? "#00ffff" : "white"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.2}
        outlineColor="black"
      >
        {label}
      </Text>
    </group>
  );
}

function Scene() {
  const modelScale = 3;
  const spacingX = 90;
  const spacingZ = 110;
  const globalOffsetX = -80;

  const rotation: [number, number, number] = [0, Math.PI / 2, 0];

  const items = [
    { label: "Web Dev", link: "/web-dev" },
    { label: "AI / ML", link: "/ai-ml" },
    { label: "Blockchain", link: "/blockchain" },
    { label: "CyberSec", link: "/cybersec" },
    { label: "Robotics", link: "/robotics" },
    { label: "Cloud", link: "/cloud" },
  ];

  const models = [];
  let index = 0;

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 3; col++) {
      const item = items[index++];

      models.push(
        <RoomModel
          key={`${row}-${col}`}
          position={[
            col * spacingX + globalOffsetX,
            0,
            row * spacingZ,
          ]}
          rotation={rotation}
          label={item.label}
          link={item.link}
          scale={modelScale}
        />
      );
    }
  }

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight position={[50, 80, 50]} intensity={2} />

      {models}

      <OrbitControls
        target={[50, 0, 45]}
        enableRotate={false}
        enablePan={false}
        enableZoom={true}
        minDistance={200}
        maxDistance={500}
      />
    </>
  );
}

export default function RoomGridPage() {
  return (
    <div className="w-screen h-screen bg-black">
      <Canvas
        camera={{
          position: [200, 200, 360],
          fov: 50,
          zoom:1.7
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/rooms.glb");