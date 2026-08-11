import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare, hash } from "bcryptjs";
import { prisma } from "./prisma";

export type Role = "ADMIN" | "USER";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const inputIdentifier = credentials.email.trim();
        const inputPassword = credentials.password.trim();

        // 1. Direct Master Admin check for requested credential: tiemcuamew / tiemcuamew123
        const isMasterAdmin =
          (inputIdentifier === "tiemcuamew" || inputIdentifier === "tiemcuamew@gmail.com") &&
          inputPassword === "tiemcuamew123";

        if (isMasterAdmin) {
          try {
            const passwordHash = await hash("tiemcuamew123", 10);
            const dbAdmin = await prisma.user.upsert({
              where: { email: "tiemcuamew@gmail.com" },
              update: { role: "ADMIN" },
              create: {
                email: "tiemcuamew@gmail.com",
                passwordHash,
                name: "Tiệm Của Mew Admin",
                role: "ADMIN",
              },
            });
            return {
              id: dbAdmin.id,
              email: dbAdmin.email,
              name: dbAdmin.name,
              role: dbAdmin.role,
            };
          } catch (e) {
            // DB Offline Fallback for Master Admin session
            return {
              id: "master-admin-id",
              email: inputIdentifier,
              name: "Tiệm Của Mew Admin",
              role: "ADMIN" as Role,
            };
          }
        }

        // 2. Normal database user lookup
        try {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: inputIdentifier },
                { name: inputIdentifier },
              ],
            },
          });

          if (!user) return null;

          const isValid = await compare(inputPassword, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error("Auth DB Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
