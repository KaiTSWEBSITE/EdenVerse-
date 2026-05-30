import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validators";
import { verifyCredentials } from "@/services/auth-service";

const authSecret =
  process.env.AUTH_SECRET ?? (process.env.VERCEL_ENV === "production" ? undefined : "edenverse-development-secret");

if (!authSecret) {
  throw new Error("AUTH_SECRET is required for production authentication.");
}

function secureCompare(value: string, expected: string) {
  const maxLength = Math.max(value.length, expected.length);
  let diff = value.length ^ expected.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (value.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }

  return diff === 0;
}

function getAdminAccessKey() {
  const configuredKey = process.env.ADMIN_ACCESS_KEY?.trim();

  if (configuredKey) {
    return configuredKey;
  }

  return process.env.NODE_ENV === "production" ? "" : "eden-dev-vault";
}

const providers = [
  Credentials({
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      adminAccessKey: { label: "Admin access key", type: "password" },
      adminMode: { label: "Admin mode", type: "text" }
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

      const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
      const adminMode = String(credentials?.adminMode ?? "") === "true";

      if (adminMode && !isAdmin) {
        return null;
      }

      if (isAdmin) {
        const expectedAccessKey = getAdminAccessKey();
        const providedAccessKey = String(credentials?.adminAccessKey ?? "").trim();

        if (!expectedAccessKey || !providedAccessKey || !secureCompare(providedAccessKey, expectedAccessKey)) {
          return null;
        }
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
        allowMatureContent: user.allowMatureContent,
        adminVaultPassed: isAdmin
      };
    }
  })
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 12,
    updateAge: 60 * 30
  },
  jwt: {
    maxAge: 60 * 60 * 12
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
        token.adminVaultPassed = user.adminVaultPassed === true;
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
        session.user.adminVaultPassed = token.adminVaultPassed === true;
      }

      return session;
    }
  }
});
