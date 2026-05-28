import { demoUsers } from "@/database/demo-data";

export async function getUserByUsername(username: string) {
  return demoUsers.find((user) => user.username === username) ?? null;
}

export async function getAllUsers() {
  return demoUsers;
}

export async function getAdminUsers() {
  return demoUsers.filter((user) => ["ADMIN", "SUPER_ADMIN"].includes(user.role));
}
