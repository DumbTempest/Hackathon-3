"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

const typescriptBooks = [
  { id: "ts-001", title: "TS Basics" },
  { id: "ts-002", title: "Advanced Types" },
  { id: "ts-003", title: "Generics Deep Dive" },
  { id: "ts-004", title: "Type Narrowing" },
  { id: "ts-005", title: "Decorators & Metadata" },
];

export default function Shelf({
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

    /* ---------------- NEW: MEMOIZE BOOK GROUPS ---------------- */

    const bookGroups = useMemo(() => {
        const books: THREE.Group[] = [];

        clonedScene.traverse((child: any) => {
            if (
                child.type === "Group" &&
                child.name.startsWith("group") &&
                child.name !== "group1295511530" // ignore bookshelf
            ) {
                books.push(child);
            }
        });

        return books;
    }, [clonedScene]);

    /* ---------------- PRINT FIRST 5 TYPESCRIPT BOOKS ---------------- */

    useEffect(() => {
        if (selectedIndex === 1) {
            console.log("TypeScript Shelf Loaded:");
            console.log("First 5 Books:");
            console.log(typescriptBooks.slice(0, 5));
            console.log("GLTF Book Groups Found:");
            console.log(bookGroups.slice(0, 5).map((b) => b.name));
        }
    }, [selectedIndex, bookGroups]);

    /* -------- Book Animation (UNCHANGED) -------- */

    useFrame(() => {
        if (innerMesh && outerMesh && originalTransforms.current.inner) {
            const forwardOffset = -0.2;
            console.log(index / 4)
            const rotationTarget = index / 4 > 12 ? -Math.PI / 2 : Math.PI / 2;

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

    /* -------- Reset Logic (UNCHANGED) -------- */

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

    /* -------- Click Handler (UNCHANGED ANIMATION) -------- */

    const handleMeshClick = (e: any) => {
        e.stopPropagation();

        const clickedName = e.object.name;

        if (clickedName.endsWith("_1")) {
            const baseName = clickedName.replace("_1", "");

            const inner = groupRef.current?.getObjectByName(baseName);
            const outer = groupRef.current?.getObjectByName(clickedName);

            if (inner && outer) {

                // 🔥 Get parent group (book group)
                const parentGroup = outer.parent as THREE.Group;

                // 🔥 Get index inside 96 groups
                const meshIndex = bookGroups.findIndex(
                    (g) => g.name === parentGroup.name
                );
                const ROOM_NAME = "Library"; // or derive from context if needed
                // 🔥 Generate unique ID
                const generatedId = `${parentGroup.name}-default-${index}-${meshIndex}`;

                console.log("Opened Book:");
                console.log("Mesh Name:", clickedName);
                console.log("Shelf Index:", index);
                console.log("Mesh Index:", meshIndex);
                console.log("Generated ID:", generatedId);

                // 🔥 Print ALL books in this shelf with IDs (optional full print)
                const allIds = bookGroups.map((group, i) => {
                    return `${group.name}-default-${index}-${i}`;
                });

                console.log("All 96 Generated IDs for this Shelf:");
                console.log(allIds);

                // --- original animation logic untouched ---
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

                const material = outer.material;
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