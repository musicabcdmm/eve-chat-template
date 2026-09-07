import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, updateUser } from "@/lib/db/queries";
import { verifyPassword } from "@/lib/user-utils";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await getUserByEmail(credentials.email as string);
        if (!user || !user.passwordHash) {
          throw new Error("User not found");
        }

        const isPasswordValid = await verifyPassword(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        if (user.status === "banned") {
          throw new Error("Account is banned");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
