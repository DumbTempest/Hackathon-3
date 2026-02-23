"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

function Model() {
  const { scene } = useGLTF("/models/model1.glb");

  return (
    <primitive
      object={scene}
      scale={2.5}
      position={[0, -1, 0]}
      rotation={[0, Math.PI, 0]}
    />
  );
}

export default function Home() {
  return (
    <main className="h-screen w-full bg-[#FAF3E1] p-10 font-tektur overflow-hidden">

      {/* NAVBAR */}
      <div className="flex justify-end gap-6 mb-6 mr-20">
        <Link href="/room" passHref>
          <Button
            asChild
            className="
      bg-[#FF6D1F]
      text-white
      border-4 border-[#222222]
      rounded-2xl
      shadow-[6px_6px_0px_0px_#222222]
      font-bold
      px-10 py-5
      active:translate-x-1
      active:translate-y-1
      active:shadow-none
      transition-all
    "
          >
            <a>Rooms</a>
          </Button>
        </Link>

        <Link href="/login" passHref>
          <Button
            asChild
            className="
      bg-[#FF6D1F]
      text-white
      border-4 border-[#222222]
      rounded-2xl
      shadow-[6px_6px_0px_0px_#222222]
      font-bold
      px-10 py-5
      active:translate-x-1
      active:translate-y-1
      active:shadow-none
      transition-all
    "
          >
            <a>Login</a>
          </Button>
        </Link>

        <Link href="/signup" passHref>
          <Button
            asChild
            className="
      bg-[#FF6D1F]
      text-white
      border-4 border-[#222222]
      rounded-2xl
      shadow-[6px_6px_0px_0px_#222222]
      font-bold
      px-10 py-5
      active:translate-x-1
      active:translate-y-1
      active:shadow-none
      transition-all
    "
          >
            <a>Signup</a>
          </Button>
        </Link>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-2 gap-16 items-start">

        {/* LEFT CARD */}
        <Card
          className="
            bg-[#F5E7C6]
            border-4 border-[#222222]
            rounded-[40px]
            shadow-[12px_12px_0px_0px_#222222]
            p-12
            max-w-xl
            ml-20
            mt-20
          "
        >
          <h1 className="text-5xl font-bold mb-6 text-[#222222]">
            Devrary
          </h1>

          <p className="text-xl mb-10 text-[#222222]">
            Virtual Library for Book Lovers. Teaching Coding Concepts in a fun way.
            Explore, Learn, and Connect in a Virtual World of Books and Code.
          </p>

          <Button
            className="
              bg-[#FF6D1F]
              text-white
              border-4 border-[#222222]
              rounded-xl
              shadow-[6px_6px_0px_0px_#222222]
              font-bold
              px-8 py-4
              text-lg
              active:translate-x-1
              active:translate-y-1
              active:shadow-none
              transition-all
            "
          >
            Enter
          </Button>
        </Card>

        {/* RIGHT MODEL AREA */}
        <div className="h-[650px] w-full relative">
          <Canvas
            className="w-full h-full"
            camera={{ position: [0, 2, 5], fov: 50 }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />

            <Suspense fallback={null}>
              <Model />
            </Suspense>

            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

      </div>

    </main>
  );
}