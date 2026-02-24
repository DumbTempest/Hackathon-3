"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import booksData from "../../../config.json";
import Link from "next/link";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarks(stored);
  }, []);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter((b) => b !== id);
    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  return (
    <main className="min-h-screen w-full bg-[#FAF3E1] p-10 font-tektur">
      <Navbar />

      <div className="grid grid-cols-2 gap-16 items-start">


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
            My Bookmarks
          </h1>

          <p className="text-xl text-[#222222]">
            All the books you've saved for later reading.
          </p>
        </Card>

        <div className="mt-20 space-y-6 max-h-[650px] overflow-y-auto pr-6 pb-4">

          {bookmarks.length === 0 && (
            <Card
              className="
                bg-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                p-6
              "
            >
              <p className="text-lg text-[#222222]">
                No bookmarks yet.
              </p>
            </Card>
          )}

          {bookmarks.map((id) => {
            const book = booksData[id];
            if (!book) return null;

            return (
              <Card
                key={id}
                className="
                  bg-white
                  border-4 border-[#222222]
                  rounded-2xl
                  shadow-[6px_6px_0px_0px_#222222]
                  p-6
                  transition-all
                  hover:translate-x-1
                  hover:translate-y-1
                  hover:shadow-none
                "
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-[#222222]">
                      {book.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {book.author}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/library/web-dev?shelf=1&bookId=${id}`}
                    >
                      <Button
                        className="
                          bg-[#FF6D1F]
                          text-white
                          border-2 border-[#222222]
                          rounded-xl
                          shadow-[4px_4px_0px_0px_#222222]
                          px-4 py-2
                        "
                      >
                        Open
                      </Button>
                    </Link>

                    <Button
                      onClick={() => removeBookmark(id)}
                      className="
                        bg-red-500
                        text-white
                        border-2 border-[#222222]
                        rounded-xl
                        shadow-[4px_4px_0px_0px_#222222]
                        px-4 py-2
                      "
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

        </div>

      </div>
    </main>
  );
}