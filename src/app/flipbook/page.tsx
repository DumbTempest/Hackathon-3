"use client";

import React from "react";
import HTMLFlipBook from "react-pageflip";
import Image from "next/image";



type CoverProps = {
  title: string;
  subtitle?: string;
  author?: string;
  coverImage?: string; // NEW
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

const BOOK_DATA: FlipBookData = {
  meta: {
    id: "go-beginner-001",
    category: "Go Programming",
    level: "Beginner",
    totalPages: 8,
  },

  frontCover: {
    title: "Go Programming",
    subtitle: "Beginner Guide",
    author: "Library Series",
    coverImage: "/covers/go-cover.png", // 🔥 image instead of static color
  },

  pages: [
    {
      number: 1,
      title: "What is Go?",
      sections: [
        {
          type: "text",
          content:
            "Go (Golang) is an open-source programming language designed by Google.",
        },
        {
          type: "list",
          content: [
            "Statically typed",
            "Compiled language",
            "Built for concurrency",
            "Fast and efficient",
          ],
        },
      ],
    },
    {
      number: 2,
      title: "Installing Go",
      sections: [
        {
          type: "text",
          content:
            "Download Go from the official website and follow installation instructions.",
        },
        {
          type: "highlight",
          content: "go version",
        },
      ],
    },
    {
      number: 3,
      title: "Your First Program",
      sections: [
        {
          type: "highlight",
          content: `package main

import "fmt"

func main() {
  fmt.Println("Hello World")
}`,
        },
      ],
    },
    {
      number: 4,
      title: "Variables & Types",
      sections: [
        {
          type: "text",
          content: "Go supports static typing with type inference.",
        },
        {
          type: "highlight",
          content: `var age int = 25
name := "Arya"`,
        },
      ],
    },
    {
      number: 5,
      title: "Functions",
      sections: [
        {
          type: "highlight",
          content: `func add(a int, b int) int {
  return a + b
}`,
        },
      ],
    },
    {
      number: 6,
      title: "Control Flow",
      sections: [
        {
          type: "list",
          content: [
            "if / else",
            "switch",
            "for loops",
            "range keyword",
          ],
        },
      ],
    },
    {
      number: 7,
      title: "Structs",
      sections: [
        {
          type: "highlight",
          content: `type User struct {
  Name string
  Age  int
}`,
        },
      ],
    },
    {
      number: 8,
      title: "Next Steps",
      sections: [
        {
          type: "list",
          content: [
            "Learn Goroutines",
            "Understand Channels",
            "Build APIs",
            "Work with Databases",
          ],
        },
      ],
    },
  ],

  backCover: {
    title: "End of Beginner Guide",
    subtitle: "Continue to Intermediate Level",
    isBack: true,
    backgroundColor: "#e5e5e5",
    textColor: "#111",
  },
};



const Cover = React.forwardRef<HTMLDivElement, CoverProps>(
  (
    {
      title,
      subtitle,
      author,
      coverImage,
      backgroundColor = "#0eaab5",
      textColor = "white",
      isBack = false,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className="w-[600px] h-[600px] flex flex-col items-center justify-center relative"
        style={{
          color: textColor,
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <Image 
          src={coverImage || "/covers/go-cover.png"}
          alt="Book Cover"
          className="absolute inset-0 w-full h-full object-cover rounded"
          width={32}
          height={32}
        />
        <div className="bg-black/40 absolute inset-0" />

        <div className="relative z-10 text-center px-8">
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


const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ number, title, sections }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[600px] h-[600px] bg-[#faf8f2] text-neutral-900 flex flex-col relative"
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
                  <ul
                    key={idx}
                    className="list-disc pl-5 mb-4 space-y-1"
                  >
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

              case "image":
                return (
                  <img
                    key={idx}
                    src={section.content}
                    className="rounded mb-4"
                  />
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


export default function Home() {
  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center p-4">
      <HTMLFlipBook
        width={600}
        height={600}
        size="fixed"
        drawShadow
        flippingTime={800}
        showCover
        mobileScrollSupport
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