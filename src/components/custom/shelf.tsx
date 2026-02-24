"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, Text } from "@react-three/drei";
import { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";

// The bookshelf model group itself — never treat this as a book
const SHELF_MODEL_GROUP = "group1295511530";

// 4 rows on each shelf, bottom → top
const ROW_LABELS = [
    { label: "Misc",         color: "#94a3b8", textColor: "#1e293b" }, // slate
    { label: "Expert",       color: "#dc2626", textColor: "#ffffff" }, // red
    { label: "Intermediate", color: "#d97706", textColor: "#ffffff" }, // amber
    { label: "Beginner",     color: "#16a34a", textColor: "#ffffff" }, // green
];

function makeRowBannerMesh(
    label: string,
    bgColor: string,
    textColor: string,
    worldWidth = 5.5
): THREE.Mesh {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 96;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Tinted rounded-rect background (~75% opacity)
    ctx.fillStyle = bgColor;
    ctx.globalAlpha = 0.75;
    const r = 14;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(canvas.width - r, 0);
    ctx.arcTo(canvas.width, 0, canvas.width, r, r);
    ctx.lineTo(canvas.width, canvas.height - r);
    ctx.arcTo(canvas.width, canvas.height, canvas.width - r, canvas.height, r);
    ctx.lineTo(r, canvas.height);
    ctx.arcTo(0, canvas.height, 0, canvas.height - r, r);
    ctx.lineTo(0, r);
    ctx.arcTo(0, 0, r, 0, r);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label text
    ctx.fillStyle = textColor;
    ctx.font = "bold 52px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, canvas.width / 2, canvas.height / 2);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;

    const aspect = canvas.width / canvas.height;          // ~10.67
    const h = worldWidth / aspect;
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(worldWidth, h),
        new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false })
    );
    mesh.name = "row-banner";
    mesh.userData.isBanner = true;
    return mesh;
}

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
    const bannerGroupRef = useRef<THREE.Group>(null);
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

        bookGroups.forEach((group) => {
            if (group.getObjectByName("binder-label")) return;

            // 🔥 Compute bounding box of THIS book
            const box = new THREE.Box3().setFromObject(group);
            const size = new THREE.Vector3();
            box.getSize(size);

            // --- Canvas ---
            const canvas = document.createElement("canvas");
            canvas.width = 256;
            canvas.height = 512;

            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 60px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText("Unknown", 0, 0);
            ctx.restore();

            const texture = new THREE.CanvasTexture(canvas);

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide,
            });

            // Scale label relative to book height
            const geometry = new THREE.PlaneGeometry(
                size.x * 0.6,
                size.y * 0.6
            );

            const labelMesh = new THREE.Mesh(geometry, material);
            labelMesh.name = "binder-label";

            // 🔥 Add to BOOK GROUP (not mesh)
            group.add(labelMesh);

            // 🔥 Position on spine using bounding box
            labelMesh.position.set(
                0,
                0,
                size.z + 0.01 // slightly outside front face
            );

            // 🔥 Rotate like real binder
            labelMesh.rotation.y = Math.PI;
        });

        return () => {
            bookGroups.forEach((group) => {
                const label = group.getObjectByName("binder-label");
                if (label) group.remove(label);
            });
        };
    }, [selectedIndex, index, bookGroups]);

    useEffect(() => {
    if (selectedIndex !== index) return;
    const bg = bannerGroupRef.current;
    if (!bg || !groupRef.current) return;

    while (bg.children.length) bg.remove(bg.children[0]);

    // 🔥 Get shelf bounding box
    const shelfBox = new THREE.Box3().setFromObject(groupRef.current);
    const shelfSize = new THREE.Vector3();
    shelfBox.getSize(shelfSize);

    const shelfWidth = shelfSize.x;
    const shelfHeight = shelfSize.y;
    const shelfDepth = shelfSize.z;

    // 🔥 Banner dimensions (clean proportions)
    const bannerWidth = shelfWidth * 0.8;  // 85% width
    const bannerHeight = shelfHeight * 0.07; // thin strip

    // 🔥 Evenly distribute 4 rows
    const bottomY = -shelfHeight / 2 + shelfHeight * 0.18;
    const topY = shelfHeight / 2 - shelfHeight * 0.18;
    const step = (topY - bottomY) / (ROW_LABELS.length - 1);

    ROW_LABELS.forEach((row, i) => {
        const banner = makeRowBannerMesh(
            row.label,
            row.color,
            row.textColor,
            bannerWidth
        );

        // 🔥 Scale height properly
        banner.scale.y = bannerHeight / banner.geometry.parameters.height;

        // 🔥 Position
        banner.position.set(
            0,
            bottomY + step * i,
            shelfDepth / 2 + 0.05  // slight forward offset
        );

        bg.add(banner);
    });

    return () => {
        while (bg.children.length) bg.remove(bg.children[0]);
    };
}, [selectedIndex, index]);

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
            {/* Row difficulty banners sit in front of the shelf */}
            <group ref={bannerGroupRef} />

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