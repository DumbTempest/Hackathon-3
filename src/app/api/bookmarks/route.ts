import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/Users";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, bookId } = await req.json();

    if (!email || !bookId) {
      return NextResponse.json(
        { message: "Missing email or bookId" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { bookmarks: bookId } }, // prevents duplicates
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Bookmark added",
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error", error },
      { status: 500 }
    );
  }
}