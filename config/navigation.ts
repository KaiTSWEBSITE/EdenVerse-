export const primaryNavigation = [
  { label: "Game Hot", href: "/games/hot" },
  { label: "Game mới", href: "/games/new" },
  { label: "Game chất lượng", href: "/games/quality" },
  { label: "Hồ sơ", href: "/profile" },
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
    title: "Cộng đồng",
    links: [
      { label: "Hồ sơ thành viên", href: "/profile" },
      { label: "Dashboard người dùng", href: "/dashboard" },
      { label: "CMS quản trị", href: "/admin" }
    ]
  }
] as const;
