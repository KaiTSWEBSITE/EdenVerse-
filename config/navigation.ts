export const primaryNavigation = [
  { label: "Khám phá", href: "/" },
  { label: "Kho game", href: "/search" },
  { label: "Cộng đồng", href: "/dashboard" },
  { label: "Quản trị", href: "/admin" }
] as const;

export const footerNavigation = [
  {
    title: "Nền tảng",
    links: [
      { label: "Game đang hot", href: "/search?sort=trending" },
      { label: "Đề xuất cho bạn", href: "/search?collection=recommended" }
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
