"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Text } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import * as THREE from "three";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

function Shelf({
  position,
  showText = false,
  index,
}: {
  position: [number, number, number];
  showText?: boolean;
  index?: number;
}) {
  const { scene } = useGLTF("/models/model1.glb");
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  const textRef = useRef<any>();
  const { camera } = useThree();

  // 🔥 Make text always face camera
  useFrame(() => {
    if (textRef.current) {
      textRef.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={position}>
      <primitive object={clonedScene} scale={2} rotation={[0, Math.PI, 0]} />

      {showText && (
        <Text
          ref={textRef}
          position={[0, 2, 0]}
          fontSize={0.4}
          font="/fonts/Tektur-VariableFont_wdth,wght.ttf"
          color={index === 1 ? "#f0db4f" :
                 index === 2 ? "#306998" :
                 index === 3 ? "#b07219" :
                 index === 4 ? "#f34b7d" :
                 index === 5 ? "#00ADD8" :
                 index === 6 ? "#dea584" : "#fff"}
          anchorX="center"
          anchorY="middle"
        >
          {index === 1 ? "JavaScript" :
           index === 2 ? "Python" :
           index === 3 ? "Java" :
           index === 4 ? "C++" :
           index === 5 ? "Go" :
           index === 6 ? "Rust" : "Unknown"}
        </Text>
      )}
    </group>
  );
}

export default function Home() {
  return (
    <main className="absolute h-screen w-screen bg-black overflow-hidden font-tektur">
      <Canvas
        orthographic
        camera={{
          position: [10, 10, 10],
          zoom: 90
        }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <Suspense fallback={null}>
          {/* Row 1 */}
          <Shelf position={[-4, 0, -2]} showText index={1}/>
          <Shelf position={[0, 0, -2]} showText index={2}/>
          <Shelf position={[4, 0, -2]} showText index={3} />

          {/* Row 2 */}
          <Shelf position={[-4, 0, 2]} showText index={4}/>
          <Shelf position={[0, 0, 2]} showText index={5}/>
          <Shelf position={[4, 0, 2]} showText index={6}/>
        </Suspense>

        {/* 🔒 Locked isometric view */}
        <OrbitControls
            enableRotate={false}
            enableZoom={true}
            enablePan={true}
        />
      </Canvas>
    </main>
  );
}