"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

// The bookshelf model group itself — never treat this as a book
const SHELF_MODEL_GROUP = "group1295511530";

export default function Shelf({
    position,
    index,
    selectedIndex,
    onClick,
    onBookOpen,
    label,
    labelColor,
    resetSignal,
}: {
    position: [number, number, number];
    index: number;
    selectedIndex: number | null;
    onClick: () => void;
    /** Called when a book is opened — passes its generated ID and cover color */
    onBookOpen: (bookId: string, color: string) => void;
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

    /* ---------------- MEMOIZE BOOK GROUPS ---------------- */

    const bookGroups = useMemo(() => {
        const books: THREE.Group[] = [];
        clonedScene.traverse((child: any) => {
            if (
                child.type === "Group" &&
                child.name.startsWith("group") &&
                child.name !== SHELF_MODEL_GROUP
            ) {
                books.push(child);
            }
        });
        return books;
    }, [clonedScene]);

    useEffect(() => {
    if (selectedIndex !== index) return;

    bookGroups.forEach((group, i) => {
        if (group.getObjectByName("binder-label")) return;

        // --- Create canvas ---
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 128;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Unknown", canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        const geometry = new THREE.PlaneGeometry(0.35, 0.12);
        const mesh = new THREE.Mesh(geometry, material);

        mesh.name = "binder-label";

        // 🔥 CRITICAL FIX:
        // Put label slightly in FRONT of that specific book
        mesh.position.set(0, 1, 1);

        // Move outward along local Z axis
        mesh.translateZ(0.5);

        // Rotate to face outward
        mesh.rotateY(Math.PI);

        group.add(mesh);
    });

    return () => {
        bookGroups.forEach((group) => {
            const label = group.getObjectByName("binder-label");
            if (label) group.remove(label);
        });
    };
}, [selectedIndex, index, bookGroups]);

    /* ---------------- BOOK ANIMATION ---------------- */

    useFrame(() => {
        if (innerMesh && outerMesh && originalTransforms.current.inner) {
            const forwardOffset = -0.2;
            const rotationTarget = Math.PI / 2;

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

    /* ---------------- RESET ON SIGNAL ---------------- */

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
            originalTransforms.current = {};
        }
    }, [resetSignal]);

    /* ---------------- CLICK HANDLER ---------------- */

    const handleMeshClick = (e: any) => {
        e.stopPropagation();

        const clickedName = e.object.name;

        if (clickedName.endsWith("_1")) {
            const baseName = clickedName.replace("_1", "");

            const inner = groupRef.current?.getObjectByName(baseName);
            const outer = groupRef.current?.getObjectByName(clickedName);

            if (inner && outer) {
                const roomName = (window.location.pathname.split("/").pop() || "unknown-room")
                    .replace(/\s+/g, "");
                const parentGroup = outer.parent as THREE.Group;
                const meshIndex = bookGroups.findIndex(
                    (g) => g.name === parentGroup.name
                );
                const generatedId = `${parentGroup.name}-${roomName}-${index}-${meshIndex}`;

                // Animate
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

                // Derive cover color then notify parent
                const material = (outer as any).material;
                const hexColor = material?.color
                    ? `#${material.color.getHexString()}`
                    : "#1e293b";

                setTimeout(() => {
                    onBookOpen(generatedId, hexColor);
                }, 600);

                if (process.env.NODE_ENV === "development") {
                    console.log("Opened Book ID:", generatedId);
                    console.log(
                        "All IDs on this shelf:",
                        bookGroups.map((g, i) => `${g.name}-${roomName}-${index}-${i}`)
                    );
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

useGLTF.preload("/models/model1.glb");