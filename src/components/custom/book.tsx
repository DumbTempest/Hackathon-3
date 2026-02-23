"use client";

import React from "react";
import HTMLFlipBook from "react-pageflip";



type CoverProps = {
  text: string;
  isBack?: boolean;
};

type PageProps = {
  number: number ;

  title: string;
  content: React.ReactNode;
};

type FlipBookData = {
  frontCover: CoverProps;
  pages: PageProps[];
  backCover: CoverProps;
};

const BOOK_DATA: FlipBookData = {
  frontCover: {
    text: "Introduction",
  },
  pages: [
    {
      number: 1,
      title: "Welcome",
      content: (
        <div className="w-full h-full bg-blue-500/20 rounded-lg flex items-center justify-center text-6xl font-bold text-blue-800">
          Go
        </div>
      ),
    },
    {
      number: 2,
      title: "About the Project",
      content: (
        <>
          <p>
            This project focuses on building a modern digital flipbook with
            smooth animations and real HTML content.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Clean UI layout</li>
            <li>Configurable page size</li>
            <li>Supports 30–40+ pages</li>
            <li>Fully customizable content</li>
          </ul>
        </>
      ),
    },
    {
      number: 3,
      title: "Use Cases",
      content: (
        <>
          <p>Flipbooks are great for:</p>
          <ol className="list-decimal pl-5 mt-4 space-y-2">
            <li>Portfolio presentations</li>
            <li>Digital magazines & lookbooks</li>
            <li>Product documentation</li>
            <li>Interactive storytelling</li>
          </ol>
        </>
      ),
    },
    {
      number: 4,
      title: "Next Steps",
      content: (
        <ul className="list-disc pl-5 mt-4 space-y-2">
          <li>Dynamic pages from array / CMS</li>
          <li>Custom page transitions & sounds</li>
          <li>Navigation controls</li>
          <li>Page tracking & progress bar</li>
          <li>Responsive adjustments</li>
        </ul>
      ),
    },
  ],
  backCover: {
    text: "End — Thanks for reading!",
    isBack: true,
  },
};



const Cover = React.forwardRef<HTMLDivElement, CoverProps>(
  ({ text, isBack = false }, ref) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className={`w-[600px] h-[600px] flex items-center justify-center
          ${isBack ? "bg-neutral-200 text-black" : "bg-[#0eaab5] text-white"}`}
        style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
      >
        <p className="text-5xl font-bold tracking-wider text-center px-8">
          {text}
        </p>
      </div>
    );
  }
);

Cover.displayName = "Cover";


const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ number, title, content }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[600px] h-[600px] bg-[#faf8f2] text-neutral-900 flex flex-col relative rounded-sm"
        style={{
          boxShadow:
            "inset 0 0 40px rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.25)",
        }}
      >
        {/* Binding margin */}
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-[#f0ece2]" />

        {/* Inner fold shadow */}
        <div
          className="absolute left-14 top-0 bottom-0 w-[2px]"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.02))",
          }}
        />

        <div className="flex-1 pl-20 pr-10 pt-14 pb-12 text-[15px] leading-7 font-serif">
          <h1 className="text-xl font-semibold mb-6 tracking-wide">
            {title}
          </h1>

          <div className="text-neutral-800">{content}</div>
        </div>

        <div className="absolute bottom-6 right-8 text-xs text-neutral-500 tracking-wide">
          {number}
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";


export default function Book() {
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
            content={page.content}
          />
        ))}

        <Cover {...BOOK_DATA.backCover} />
      </HTMLFlipBook>
    </main>
  );
}