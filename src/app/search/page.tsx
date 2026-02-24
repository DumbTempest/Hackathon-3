"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import webDevData from "../../../config.json";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const lower = query.toLowerCase();

    return Object.entries(webDevData).filter(([id, book]) => {
      return (
        book.name.toLowerCase().includes(lower) ||
        book.description.toLowerCase().includes(lower) ||
        book.author.toLowerCase().includes(lower)
      );
    });
  }, [query]);

  const handleNavigate = (id: string) => {
    // Extract shelf index from id (format: groupXXXXX-web-dev-4-54)
    const parts = id.split("-");
const shelfIndex = parts[parts.length - 2]; // ✅ always correct

    router.push(`/library/web-dev?shelf=${Number(shelfIndex) + 1}&bookId=${id}`);
  };

  return (
    <main className="min-h-screen w-full bg-[#FAF3E1] font-tektur">
      <div className="absolute top-10 right-11 w-full z-50">
        <Navbar />
      </div>

      <div className="flex items-start justify-center pt-32">
        <Card
          className="
            bg-[#F5E7C6]
            border-4 border-[#222222]
            rounded-[40px]
            shadow-[12px_12px_0px_0px_#222222]
            p-16
            w-[700px]
            max-w-[90%]
          "
        >
          <h1 className="text-4xl font-bold text-[#222222] mb-7 text-center">
            Search the Library
          </h1>

          {/* Search Bar */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center flex-1 bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] px-6 py-4">
              <Search className="text-[#222222] mr-4" size={26} />
              <input
                type="text"
                placeholder="Search books, concepts, topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="
                  w-full
                  bg-transparent
                  outline-none
                  text-xl
                  text-[#222222]
                  placeholder:text-[#555]
                "
              />
            </div>

            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-8 py-7
              "
            >
              Go
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {results.map(([id, book]) => (
                <div
                  key={id}
                  onClick={() => handleNavigate(id)}
                  className="
                    cursor-pointer
                    bg-white
                    border-4 border-[#222222]
                    rounded-2xl
                    shadow-[6px_6px_0px_0px_#222222]
                    p-5
                    hover:translate-x-1
                    hover:translate-y-1
                    hover:shadow-none
                    transition-all
                  "
                >
                  <div className="font-bold text-lg text-[#222222]">
                    {book.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {book.author}
                  </div>
                  <div className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {book.description}
                  </div>
                </div>
              ))}
            </div>
          )}

          {query && results.length === 0 && (
            <div className="text-center text-gray-600 mt-4">
              No results found.
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}