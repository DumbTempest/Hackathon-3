"use client";

import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";
import booksData from "../../../config.json"

type CoverProps = {
  title: string;
  subtitle?: string;
  author?: string;
  coverImage?: string;
  backgroundColor?: string;
  textColor?: string;
  isBack?: boolean;
};

type PageSection = {
  type: "text" | "list" | "image" | "highlight";
  content: any;
};

type PageProps = {
  number: number;
  title: string;
  sections: PageSection[];
};

type FlipBookData = {
  meta: {
    id: string;
    category: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    totalPages: number;
  };
  frontCover: CoverProps;
  pages: PageProps[];
  backCover: CoverProps;
};

const Cover = React.forwardRef<HTMLDivElement, CoverProps>(
  ({ title, subtitle, author, coverImage }, ref) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className="w-[600px] h-[600px] flex flex-col items-center justify-center relative"
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <Image
          src={coverImage || "/covers/go-cover.png"}
          alt="Book Cover"
          fill
          className="object-cover rounded"
        />
        <div className="bg-black/40 absolute inset-0" />

        <div className="relative z-10 text-center px-8 text-white">
          <h1 className="text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-xl opacity-90 mb-6">{subtitle}</p>
          )}
          {author && <p className="text-sm opacity-80">{author}</p>}
        </div>
      </div>
    );
  }
);

Cover.displayName = "Cover";

/* ================= PAGE ================= */

const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ number, title, sections }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[600px] h-[800px] bg-[#faf8f2] text-neutral-900 flex flex-col relative"
      >
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-[#f0ece2]" />

        <div className="flex-1 pl-20 pr-10 pt-14 pb-12 text-[15px] leading-7 font-serif">
          <h1 className="text-xl font-semibold mb-6">{title}</h1>

          {sections.map((section, idx) => {
            switch (section.type) {
              case "text":
                return (
                  <p key={idx} className="mb-4">
                    {section.content}
                  </p>
                );

              case "list":
                return (
                  <ul key={idx} className="list-disc pl-5 mb-4 space-y-1">
                    {section.content.map(
                      (item: string, i: number) => (
                        <li key={i}>{item}</li>
                      )
                    )}
                  </ul>
                );

              case "highlight":
                return (
                  <pre
                    key={idx}
                    className="bg-neutral-900 text-green-400 p-4 rounded mb-4 text-xs overflow-auto"
                  >
                    {section.content}
                  </pre>
                );

              default:
                return null;
            }
          })}
        </div>

        <div className="absolute bottom-6 right-8 text-xs text-neutral-500">
          {number}
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";


export default function Home({ bookId }: { bookId: string }) {
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const bookMeta = booksData[bookId];

  if (!bookMeta) {
    return (
      <div className="text-white text-xl">
        Book not found.
      </div>
    );
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(stored.includes(bookId));
  }, [bookId]);

  const toggleBookmark = () => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    let updated;

    if (stored.includes(bookId)) {
      // Remove bookmark
      updated = stored.filter((id: string) => id !== bookId);
      setIsBookmarked(false);
    } else {
      // Add bookmark
      updated = [...stored, bookId];
      setIsBookmarked(true);
    }

    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const BOOK_DATA: FlipBookData = {
    meta: {
      id: bookId,
      category: "Web Development",
      level: "Beginner",
      totalPages: 4,
    },

    frontCover: {
      title: bookMeta.name,
      subtitle: "Web Dev Library",
      author: bookMeta.author,
      coverImage: "/covers/default-cover.png",
    },

    pages: [
      {
        number: 1,
        title: "Overview",
        sections: [
          {
            type: "text",
            content: bookMeta.description,
          },
        ],
      },
      {
        number: 2,
        title: "About the Author",
        sections: [
          {
            type: "text",
            content: `${bookMeta.author} is a contributor to the Web Dev Library series.`,
          },
        ],
      },
      {
        number: 3,
        title: "Why This Book Matters",
        sections: [
          {
            type: "list",
            content: [
              "Covers essential concepts",
              "Practical examples",
              "Structured learning path",
            ],
          },
        ],
      },
    ],

    backCover: {
      title: "End of Preview",
      subtitle: "Continue Exploring the Library",
      isBack: true,
      backgroundColor: "#e5e5e5",
      textColor: "#111",
    },
  };

  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const speakCurrentPage = () => {
    if (!flipBookRef.current) return;

    const page = flipBookRef.current
      .pageFlip()
      .getPage(currentPage);

    if (!page) return;

    const text = page.element.innerText;
    if (!text) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => setSpeaking(false);

    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center p-4 relative">

      {/* TTS Controls */}
      <div className="absolute top-6 right-33 z-50">
        {!speaking ? (
          <button
            onClick={speakCurrentPage}
            className="px-4 py-2 bg-yellow-400 text-black rounded-lg font-semibold"
          >
            🔊 Read Page
          </button>
        ) : (
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold"
          >
            ⏹ Stop
          </button>
        )}
      </div>
      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={toggleBookmark}
          className={`px-4 py-2 rounded-lg font-semibold transition ${isBookmarked
              ? "bg-green-500 text-white"
              : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          {isBookmarked ? "✅ Bookmarked" : "🔖 Add Bookmark"}
        </button>
      </div>

      <HTMLFlipBook
        ref={flipBookRef}
        width={600}
        height={700}
        size="fixed"
        drawShadow
        flippingTime={800}
        showCover
        mobileScrollSupport
        onFlip={(e: any) => {
          setCurrentPage(e.data);
          speechSynthesis.cancel();
          setSpeaking(false);
        }}
      >
        <Cover {...BOOK_DATA.frontCover} />

        {BOOK_DATA.pages.map((page) => (
          <Page
            key={page.number}
            number={page.number}
            title={page.title}
            sections={page.sections}
          />
        ))}

        <Cover {...BOOK_DATA.backCover} />
      </HTMLFlipBook>
    </main>
  );
}