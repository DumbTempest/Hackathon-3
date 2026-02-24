import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectDB } from "../../../../lib/mongodb";
import User from "../../../../lib/models/Users";

export const options: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
        }),
    ],

    session: {
        strategy: "jwt", // now correctly typed
    },

    callbacks: {
        async signIn({ user }) {
            await connectDB();

            if (!user.email) return false;

            const existingUser = await User.findOne({
                email: user.email,
            });

            if (!existingUser) {
                const rawName = user.name || "anonymous";
                const baseUsername = rawName
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .replace(/[^a-z0-9_.]/g, "");

                const safeUsername =
                    baseUsername || `user${Date.now()}`;

                await User.create({
                    name: safeUsername,
                    email: user.email,
                    profilePicture:
                        user.image ||
                        "https://clash-tournament-hub.vercel.app/default-avatar.png",
                });
            }

            return true;
        },

        async jwt({ token, user }) {
            if (user?.email) {
                await connectDB();
                const dbUser = await User.findOne({
                    email: user.email,
                }).lean();

                if (dbUser) {
                    token.id = dbUser._id.toString();
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token?.id && session.user) {
                session.user.id = token.id as string;

                await connectDB();
                const dbUser = await User.findById(token.id).lean();

                if (dbUser) {
                    session.user.name = dbUser.name;
                    session.user.email = dbUser.email;
                    session.user.image = dbUser.profilePicture;
                }
            }

            return session;
        },
    },

    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
        error: "/auth/error",
    },
};