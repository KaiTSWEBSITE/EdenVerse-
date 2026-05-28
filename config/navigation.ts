export const primaryNavigation = [
  { label: "Khám phá", href: "/" },
  { label: "Kho game", href: "/search" },
  { label: "Tin tức", href: "/news" },
  { label: "Cộng đồng", href: "/dashboard" },
  { label: "Admin", href: "/admin" }
] as const;

export const footerNavigation = [
  {
    title: "Nền tảng",
    links: [
      { label: "Game đang hot", href: "/search?sort=trending" },
      { label: "Chế độ an toàn 18+", href: "/profile/aria" },
      { label: "Đề xuất cho bạn", href: "/search?collection=recommended" }
    ]
  },
  {
    title: "Quản trị",
    links: [
      { label: "Bản tin", href: "/news" },
      { label: "Admin CMS", href: "/admin" },
      { label: "Dashboard người dùng", href: "/dashboard" }
    ]
  }
] as const;
