import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validators";
import { verifyCredentials } from "@/services/auth-service";

const providers = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse({
        email: credentials?.email,
        password: credentials?.password
      });

      if (!parsed.success) {
        return null;
      }

      const user = await verifyCredentials(parsed.data.email, parsed.data.password);
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar,
        username: user.username,
        role: user.role,
        reputation: user.reputation,
        level: user.level,
        allowMatureContent: user.allowMatureContent
      };
    }
  })
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "edenverse-development-secret",
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24
  },
  pages: {
    signIn: "/auth/login"
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.username;
        token.reputation = user.reputation;
        token.level = user.level;
        token.allowMatureContent = user.allowMatureContent;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = (token.role as string | undefined) ?? "USER";
        session.user.username = (token.username as string | undefined) ?? "";
        session.user.reputation = (token.reputation as number | undefined) ?? 0;
        session.user.level = (token.level as number | undefined) ?? 1;
        session.user.allowMatureContent = (token.allowMatureContent as boolean | undefined) ?? false;
      }

      return session;
    }
  }
});
