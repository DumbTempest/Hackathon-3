"use client";

import React from "react";
import HTMLFlipBook from "react-pageflip";


const Cover = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; isBack?: boolean }
>(({ children, isBack = false }, ref) => {
  return (
    <div
      ref={ref}
      data-density="hard"
      className={`w-[600px] h-[600px] flex items-center justify-center
        ${
          isBack
            ? "bg-[#] text-black"
            : "bg-[#0eaab5] text-white"
        }`}
      style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}
    >
      <p className="text-5xl font-bold tracking-wider mt-70 text-center">
        {children}
        </p>
      </div>
  );
});

Cover.displayName = "Cover";


const Page = React.forwardRef<
  HTMLDivElement,
  { number: number; title: string; children: React.ReactNode }
>(({ number, title, children }, ref) => {
  return (
    <div
      ref={ref}
      className="w-[600px] h-[600px] bg-[#faf8f2] text-neutral-900 flex flex-col relative rounded-sm"
      style={{
        boxShadow:
          "inset 0 0 40px rgba(0,0,0,0.05), 0 8px 20px rgba(0,0,0,0.25)",
      }}
    >
      {/* Notebook binding margin */}
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

        <div className="text-neutral-800">{children}</div>
      </div>

      {/* Page number */}
      <div className="absolute bottom-6 right-8 text-xs text-neutral-500 tracking-wide">
        {number}
      </div>
    </div>
  );
});

Page.displayName = "Page";



export default function Home() {
  return (
    <main className="h-screen w-screen bg-black flex items-center justify-center p-4">
      <HTMLFlipBook
        width={600}
        height={600}
        size="fixed"
        minWidth={400}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1000}
        drawShadow={true}
        flippingTime={800}
        usePortrait={true}
        startPage={0}
        showCover={true}
        maxShadowOpacity={0.5}
        mobileScrollSupport={true}
        swipeDistance={30}
        useMouseEvents={true}
      >

        <Cover>Introduction</Cover>

        {/* Pages */}
        <Page number={1} title="Welcome">
          <div className="w-full h-full bg-blue-500/20 rounded-lg flex items-center justify-center text-6xl font-bold text-blue-800">
            Go
          </div>
        </Page>

        <Page number={2} title="About the Project">
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
        </Page>

        <Page number={3} title="Use Cases">
          <p>Flipbooks are great for:</p>
          <ol className="list-decimal pl-5 mt-4 space-y-2">
            <li>Portfolio presentations</li>
            <li>Digital magazines & lookbooks</li>
            <li>Product documentation</li>
            <li>Interactive storytelling</li>
          </ol>
          <p className="mt-6">
            Because it's real HTML/CSS, you can embed images, videos, forms,
            interactive charts — anything.
          </p>
        </Page>

        <Page number={4} title="Next Steps">
          <p>Easy ways to level up this flipbook:</p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Dynamic pages from array / CMS</li>
            <li>Custom page transitions & sounds</li>
            <li>Navigation controls</li>
            <li>Page tracking & progress bar</li>
            <li>Responsive adjustments</li>
          </ul>
        </Page>

        <Cover isBack>End — Thanks for reading!</Cover>
      </HTMLFlipBook>
    </main>
  );
}