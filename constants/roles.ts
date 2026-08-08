export const ROLE_OPTIONS = ["USER", "MODERATOR", "ADMIN", "SUPER_ADMIN"] as const;

export type RoleOption = (typeof ROLE_OPTIONS)[number];
