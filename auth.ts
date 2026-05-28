import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Google from "next-auth/providers/google";
import { loginSchema } from "@/lib/validators";
import { verifyDemoCredentials } from "@/services/auth-service";

const providers: Provider[] = [
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

      const user = await verifyDemoCredentials(parsed.data.email, parsed.data.password);
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

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  providers.push(
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? "edenverse-development-secret",
  session: {
    strategy: "jwt"
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
