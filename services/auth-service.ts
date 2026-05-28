import { authConfig } from "@/config/auth";
import { demoUsers } from "@/database/demo-data";

const demoAccountPasswords = new Map<string, string>(
  [
    [authConfig.demoAdmin.email, authConfig.demoAdmin.password],
    [authConfig.demoUser.email, authConfig.demoUser.password]
  ].map(([email, password]) => [email, password])
);

export async function verifyDemoCredentials(email: string, password: string) {
  const expectedPassword = demoAccountPasswords.get(email);
  if (!expectedPassword) {
    return null;
  }

  const user = demoUsers.find((entry) => entry.email === email);
  if (!user) {
    return null;
  }

  return password === expectedPassword ? user : null;
}
