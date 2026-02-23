"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

function Wall({ position, size, color = "#8ecae6" }) {
    return (
        <mesh position={position} castShadow receiveShadow>
            <boxGeometry args={size} />
            <meshStandardMaterial color={color} />
        </mesh>
    )
}

function Floor({ size }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={size} />
            <meshStandardMaterial color="#d2b48c" />
        </mesh>
    )
}

export default function CornerRoom() {
    const roomSize = 20
    const wallHeight = 8
    const wallThickness = 0.5

    return (
        <Canvas
            style={{ width: "100vw", height: "100vh" }}
            shadows
            orthographic
            camera={{
                position: [20, 20, 20],
                zoom: 45
            }}
        >
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[15, 20, 10]}
                intensity={1}
                // castShadow
            />

            <OrbitControls enableRotate={true} />

            {/* Floor */}
            <Floor size={[roomSize, roomSize]} />

            {/* Back Wall */}
            <Wall
                position={[0, wallHeight / 2, -roomSize / 2]}
                size={[roomSize, wallHeight, wallThickness]}
            />

            {/* Right Wall */}
            <Wall
                position={[roomSize / 2, wallHeight / 2, 0]}
                size={[wallThickness, wallHeight, roomSize]}
            />

        </Canvas>
    )
}