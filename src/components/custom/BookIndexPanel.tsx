"use client";

import { useSearchParams } from "next/navigation";
import webDevData from "../../../config.json";
import { motion } from "framer-motion";

export default function BookIndexPanel() {
    const searchParams = useSearchParams();

    const bookId = searchParams.get("bookId");
    const shelf = searchParams.get("shelf");

    if (!shelf) return null;

    // 🔥 Get only books from this shelf
    const shelfBooks = Object.entries(webDevData)
        .filter(([id]) => {
            const parts = id.split("-");
            const shelfId = parts[parts.length - 2];
            return (Number(shelfId) + 1) === Number(shelf);
        })
        .sort((a, b) => {
            const aIndex = Number(a[0].split("-").pop());
            const bIndex = Number(b[0].split("-").pop());
            return aIndex - bIndex;
        });

    if (shelfBooks.length === 0) return null;

    return (
        <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute right-6 top-24 w-[420px] bg-[#0f172a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl p-6 z-50 max-h-[70vh] overflow-y-auto"
        >
            <h2 className="text-lg font-semibold text-white mb-4">
                📚 Shelf {shelf} Index
            </h2>

            <div className="space-y-3 text-sm">
                {shelfBooks.map(([id, data], index) => {
                    const isActive = id === bookId;

                    return (
                        <div
                            key={id}
                            className={`
                                p-3 rounded-lg transition-all
                                ${isActive
                                    ? "bg-orange-500/20 border border-orange-400"
                                    : "bg-white/5 hover:bg-white/10"}
                            `}
                        >
                            <div className="font-semibold text-white">
                                {index + 1}. {data.name}
                            </div>
                            <div className="text-gray-400 text-xs">
                                {data.author}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}