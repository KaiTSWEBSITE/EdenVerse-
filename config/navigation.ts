export const primaryNavigation = [
  { label: "Game Hot", href: "/games/hot" },
  { label: "Game mới", href: "/games/new" },
  { label: "Game chất lượng", href: "/games/quality" },
  { label: "Cộng đồng", href: "/dashboard" },
  { label: "Quản trị", href: "/admin" }
] as const;

export const footerNavigation = [
  {
    title: "Nền tảng",
    links: [
      { label: "Game Hot", href: "/games/hot" },
      { label: "Game mới ra mắt", href: "/games/new" },
      { label: "Game chất lượng tốt", href: "/games/quality" }
    ]
  },
  {
    title: "Quản trị",
    links: [
      { label: "CMS quản trị", href: "/admin" },
      { label: "Dashboard người dùng", href: "/dashboard" }
    ]
  }
] as const;
