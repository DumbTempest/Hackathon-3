"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Navbar from "@/components/custom/navbar";
import { motion } from "framer-motion";
import * as THREE from "three";

/* ---------------- MODEL ---------------- */

function Model() {
  const { scene } = useGLTF("/models/model1.glb");
  const modelRef = useRef<THREE.Group>(null);

  // Auto rotation
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.6; // speed control
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={2.5}
      pposition={[0, -0.5, 0]}
    />
  );
}

/* ---------------- PAGE ---------------- */

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="h-screen w-full bg-[#FAF3E1] p-10 font-tektur overflow-hidden"
    >
      <Navbar />

      <div className="grid grid-cols-2 gap-16 items-start">

        {/* LEFT CARD */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="ml-20 mt-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Card
              className="
                bg-[#F5E7C6]
                border-4 border-[#222222]
                rounded-[40px]
                shadow-[12px_12px_0px_0px_#222222]
                p-12
                max-w-xl
              "
            >
              <h1 className="text-5xl font-bold mb-6 text-[#222222]">
                Devrary
              </h1>

              <p className="text-xl mb-10 text-[#222222]">
  Discover coding concepts inside a structured virtual library. 
  Walk through domains, browse languages, and open curated resources 
  designed to make learning clear and accessible.
</p>

              <Link href="/room">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
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
                    Start learning
                  </Button>
                </motion.div>
              </Link>
            </Card>
          </motion.div>
        </motion.div>

        {/* RIGHT MODEL AREA */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="h-[650px] w-full relative"
        >
          <Link href="/room">
          <Canvas
            className="w-full h-full"
            camera={{ position: [3, 3, 4], fov: 50 }}
          >
            <ambientLight intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />

            <Suspense fallback={null}>
              <Model />
            </Suspense>

            <OrbitControls enableZoom={true} />
          </Canvas>
          </Link>
        </motion.div>

      </div>
    </motion.main>
  );
}