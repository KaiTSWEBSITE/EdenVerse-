export const authConfig = {
  demoAdmin: {
    email: process.env.DEMO_ADMIN_EMAIL ?? "",
    password: process.env.DEMO_ADMIN_PASSWORD ?? ""
  },
  demoUser: {
    email: process.env.DEMO_USER_EMAIL ?? "",
    password: process.env.DEMO_USER_PASSWORD ?? ""
  }
} as const;
