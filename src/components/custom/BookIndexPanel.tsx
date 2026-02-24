"use client";

import { usePathname, useSearchParams } from "next/navigation";
import webDevData from "../../../config.json";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

export default function BookIndexPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();


  const bookId = searchParams.get("bookId");
  const shelf = searchParams.get("shelf");

  if (!shelf) return null;

  const shelfBooks = Object.entries(webDevData)
    .filter(([id]) => {
      const parts = id.split("-");
      const shelfId = parts[parts.length - 2];
      return Number(shelfId) + 1 === Number(shelf);
    })
    .sort((a, b) => {
      const aIndex = Number(a[0].split("-").pop());
      const bIndex = Number(b[0].split("-").pop());
      return aIndex - bIndex;
    });

  if (shelfBooks.length === 0) return null;

  const handleOpenBook = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("bookId", id);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="
        absolute right-10 top-28
        w-[450px] max-h-[70vh] overflow-y-auto
        bg-[#F5E7C6]
        border-4 border-[#222222]
        rounded-[30px]
        shadow-[10px_10px_0px_0px_#222222]
        p-8
        z-50
      "
    >
      <h2 className="text-2xl font-bold text-[#222222] mb-6 text-center">
        Shelf {shelf} Index
      </h2>

      <div className="space-y-4">
        {shelfBooks.map(([id, data], index) => {
          const isActive = id === bookId;

          return (
            <div
              key={id}
              onClick={() => handleOpenBook(id)}
              className={`
                p-4
                rounded-2xl
                border-4 border-[#222222]
                transition-all
                ${
                  isActive
                    ? "bg-[#FF6D1F] text-white shadow-[6px_6px_0px_0px_#222222]"
                    : "bg-white shadow-[6px_6px_0px_0px_#222222] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer"
                }
              `}
            >
              <div className="font-bold text-lg">
                {index + 1}. {data.name}
              </div>

              <div
                className={`text-sm mt-1 ${
                  isActive ? "text-white/90" : "text-gray-600"
                }`}
              >
                {data.author}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}