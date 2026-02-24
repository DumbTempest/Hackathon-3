"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { status } = useSession();

  return (
    <div className="flex justify-end gap-6 mb-6 mr-20">
      <Link href="/">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Home
            </Button>
          </Link>
      
      {status === "authenticated" && (
        <>
        <Link href="/room">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Rooms
            </Button>
          </Link>
          <Link href="/room">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Search
            </Button>
          </Link>
        <Button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="
            bg-[#FF6D1F]
            text-white
            border-4 border-[#222222]
            rounded-2xl
            shadow-[6px_6px_0px_0px_#222222]
            font-bold
            px-10 py-5
            active:translate-x-1
            active:translate-y-1
            active:shadow-none
            transition-all
          "
        >
          Logout
        </Button>
        </>
      )}

      {status === "unauthenticated" && (
        <>
          <Link href="/bookmarks">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Bookmarks
            </Button>
          </Link>
          <Link href="/room">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Search
            </Button>
          </Link>
          <Link href="/room">
            <Button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
            >
              Rooms
            </Button>
          </Link>

          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="
              bg-[#FF6D1F]
              text-white
              border-4 border-[#222222]
              rounded-2xl
              shadow-[6px_6px_0px_0px_#222222]
              font-bold
              px-10 py-5
              active:translate-x-1
              active:translate-y-1
              active:shadow-none
              transition-all
            "
          >
            Login/Signup
          </Button>
        </>
      )}
    </div>
  );
}