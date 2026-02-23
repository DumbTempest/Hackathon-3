"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Searching for:", query);
  };

  return (
    <main className="h-screen w-full bg-[#FAF3E1] font-tektur overflow-hidden">
      <div className="absolute top-10  right-11 w-full z-50">
              <Navbar />
      </div>


      <div className="flex items-start justify-center h-[80vh] pt-32">

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


          <div className="flex items-center gap-4">

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
              onClick={handleSearch}
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-8 py-7
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Go
            </Button>

          </div>
        </Card>

      </div>
    </main>
  );
}