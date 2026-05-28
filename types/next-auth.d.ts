import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      username: string;
      role: string;
      reputation: number;
      level: number;
      allowMatureContent: boolean;
    };
  }

  interface User {
    username: string;
    role: string;
    reputation: number;
    level: number;
    allowMatureContent: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    username?: string;
    reputation?: number;
    level?: number;
    allowMatureContent?: boolean;
  }
}
