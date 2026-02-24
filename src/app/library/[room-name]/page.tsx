"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useState, useEffect, useCallback } from "react";
import Shelf from "@/components/custom/shelf";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import Flipbook from "../../flipbook/page";

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

    const pathname = usePathname();

    const roomSlug = (() => {
        if (!pathname) return "library";
        const segments = pathname.split("/").filter(Boolean);
        const last = segments[segments.length - 1];
        return decodeURIComponent(last || "library");
    })();

    const roomDisplayName =
        roomSlug === "library"
            ? "Library"
            : roomSlug
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ");

    const [overlayColor, setOverlayColor] = useState<string | null>(null);
    const [resetSignal, setResetSignal] = useState(0);
    const [activeBookId, setActiveBookId] = useState<string | null>(null);

    // Read shelf + bookId from URL
    const shelfFromUrl = searchParams.get("shelf");
    const bookIdFromUrl = searchParams.get("bookId");

    const initialIndex = shelfFromUrl !== null ? Number(shelfFromUrl) - 1 : null;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(initialIndex);

    // Sync activeBookId from URL on load/back-nav
    useEffect(() => {
        setActiveBookId(bookIdFromUrl ?? null);
    }, [bookIdFromUrl]);

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
        router.push(`/library/${roomSlug}?shelf=${index + 1}`);
    };

    // Called by Shelf when a book is opened — adds bookId to URL
    const handleBookOpen = useCallback(
        (bookId: string, color: string) => {
            setOverlayColor(color);
            setActiveBookId(bookId);
            if (shelfFromUrl) {
                router.push(`/library/${roomSlug}?shelf=${shelfFromUrl}&bookId=${bookId}`);
            }
        },
        [shelfFromUrl, roomSlug, router]
    );

    // Close book panel — goes back to shelf view
    const handleBookClose = useCallback(() => {
        setOverlayColor(null);
        setActiveBookId(null);
        setResetSignal((prev) => prev + 1);
        if (shelfFromUrl) {
            router.push(`/library/${roomSlug}?shelf=${shelfFromUrl}`);
        }
    }, [shelfFromUrl, roomSlug, router]);

    // Full reset — back to library root
    const handleReset = useCallback(() => {
        setOverlayColor(null);
        setActiveBookId(null);
        setSelectedIndex(null);
        setResetSignal((prev) => prev + 1);
        router.push(`/library/${roomSlug}`);
    }, [roomSlug, router]);
    console.log(activeBookId)

    return (
        <main className="absolute h-screen w-screen bg-[#0f172a] overflow-hidden">
            {/* ── Room Title Overlay ── */}
            <div className="absolute top-6 left-8 z-50 pointer-events-none">
                <h1 className="text-white text-3xl font-semibold tracking-wide drop-shadow-lg font-tektur">
                    {roomDisplayName}
                </h1>
            </div>
            <Canvas
                shadows
                orthographic
                camera={{ position: [10, 10, 10], zoom: 90 }}
                onPointerMissed={() => {
                    if (activeBookId) {
                        // Book is open — close it, stay on shelf
                        handleBookClose();
                    } else if (selectedIndex !== null) {
                        // On shelf but no book — go back to library
                        handleReset();
                    }
                }}
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
                            onBookOpen={handleBookOpen}
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

            {/* ── Book panel — contained, not full-screen ── */}
            <AnimatePresence>
                {activeBookId && (
                    <>
                        {/*
                            Backdrop: covers the canvas but is NOT the panel.
                            Clicking it closes the book and stays on the shelf.
                        */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0 z-40 bg-black/50"
                            onClick={handleBookClose}
                        />

                        {/*
                            Panel: centered card — click inside does NOT close.
                            Clicking outside (backdrop) does.
                        */}
                        <motion.div
                            key="book-panel"
                            initial={{ opacity: 0, scale: 0.92, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 24 }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            className="absolute z-50 inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div
                                className="relative w-[95%] h-[95%] rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
                                style={{ backgroundColor: overlayColor ?? "#1e293b" }}
                                onClick={(e) => e.stopPropagation()} // don't bubble to backdrop
                            >
                                {/* Close button */}
                                <button
                                    onClick={handleBookClose}
                                    className="absolute top-3 right-4 z-10 text-white/70 hover:text-white text-2xl font-light transition-colors"
                                    aria-label="Close book"
                                >
                                    ✕
                                </button>

                                {/* Book content — swap on activeBookId */}
                                <div className="w-full h-full">
                                    {activeBookId === "group323163343-web-dev-4-54" && (
                                        <Flipbook />
                                    )}
                                    {/* Add more book ID mappings here */}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </main>
    );
}

useGLTF.preload("/models/model1.glb");