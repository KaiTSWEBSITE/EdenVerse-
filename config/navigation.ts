export const primaryNavigation = [
  { label: "Discover", href: "/" },
  { label: "Games", href: "/search" },
  { label: "News", href: "/news" },
  { label: "Community", href: "/dashboard" },
  { label: "Admin", href: "/admin" }
] as const;

export const footerNavigation = [
  {
    title: "Platform",
    links: [
      { label: "Trending Releases", href: "/search?sort=trending" },
      { label: "Adult Safe Mode", href: "/profile/demo-user" },
      { label: "Recommended", href: "/search?collection=recommended" }
    ]
  },
  {
    title: "Studio",
    links: [
      { label: "Newsroom", href: "/news" },
      { label: "Admin CMS", href: "/admin" },
      { label: "User Dashboard", href: "/dashboard" }
    ]
  }
] as const;
