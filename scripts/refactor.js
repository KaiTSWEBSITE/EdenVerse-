const fs = require('fs');
let code = fs.readFileSync('components/admin/admin-panel.tsx', 'utf-8');

const r = (target, replacement) => {
  if (!code.includes(target)) {
    console.log("NOT FOUND:\\n" + target.substring(0, 50));
  }
  code = code.replace(target, replacement);
};

// 0. Top state
r(`const [intro, setIntro] = useState(heroIntro);`,
  `const [activeTab, setActiveTab] = useState("dashboard");\n  const [intro, setIntro] = useState(heroIntro);`);

// 0.5. Top Sidebar and Dashboard wrap
r(`  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">`,
  `  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-[120px] z-10">
        <div className="flex lg:flex-col gap-2 overflow-x-auto hide-scrollbar pb-2 lg:pb-0 bg-noir-surfaceElevated rounded-xl p-3 shadow-lg ring-1 ring-white/5">
          <Button type="button" variant={activeTab === "dashboard" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "dashboard" ? "active" : "inactive"} onClick={() => setActiveTab("dashboard")}><BarChart3 className="mr-3 h-4 w-4" /> Tổng quan</Button>
          <Button type="button" variant={activeTab === "games" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "games" ? "active" : "inactive"} onClick={() => setActiveTab("games")}><Gamepad2 className="mr-3 h-4 w-4" /> Game & Upload</Button>
          <Button type="button" variant={activeTab === "posts" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "posts" ? "active" : "inactive"} onClick={() => setActiveTab("posts")}><FileCheck2 className="mr-3 h-4 w-4" /> Quản lý Bài viết</Button>
          <Button type="button" variant={activeTab === "reports" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "reports" ? "active" : "inactive"} onClick={() => setActiveTab("reports")}><MessageSquareWarning className="mr-3 h-4 w-4" /> Kiểm duyệt</Button>
          <Button type="button" variant={activeTab === "users" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "users" ? "active" : "inactive"} onClick={() => setActiveTab("users")}><UsersRound className="mr-3 h-4 w-4" /> Thành viên</Button>
          <Button type="button" variant={activeTab === "settings" ? "secondary" : "ghost"} className="w-full justify-start whitespace-nowrap text-muted-foreground data-[state=active]:text-white data-[state=active]:bg-white/10" data-state={activeTab === "settings" ? "active" : "inactive"} onClick={() => setActiveTab("settings")}><Gauge className="mr-3 h-4 w-4" /> Cài đặt hệ thống</Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 space-y-8">
        <div className={activeTab === "dashboard" ? "contents" : "hidden"}>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">`);


// 1. Settings wrap
r(`      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Bảo mật tài khoản</p>`,
  `      </div>
        </div>

        <div className={activeTab === "settings" ? "contents" : "hidden"}>
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Bảo mật tài khoản</p>`);

// 2. Games List wrap
r(`      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Game đã đăng</p>`,
  `        </div>

        <div className={activeTab === "games" ? "contents" : "hidden"}>
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Game đã đăng</p>`);

// 3. Posts Wrap
r(`      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">Quản lý bài viết</p>`,
  `        </div>

        <div className={activeTab === "posts" ? "contents" : "hidden"}>
          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary">Quản lý bài viết</p>`);

// 4. Games Form Wrap
r(`      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase text-primary">{editingGame ? "Chỉnh sửa game" : "Đăng game mới"}</p>`,
  `        </div>

        <div className={activeTab === "games" ? "contents" : "hidden"}>
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase text-primary">{editingGame ? "Chỉnh sửa game" : "Đăng game mới"}</p>`);

// 5. Reports Wrap
r(`      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-foreground">Báo cáo lỗi game</h3>`,
  `        </div>

        <div className={activeTab === "reports" ? "contents" : "hidden"}>
          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-3xl text-foreground">Báo cáo lỗi game</h3>`);

// 6. Users Wrap
r(`      <div className="grid gap-6">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-3xl text-foreground">Quản lý Thành viên</h3>`,
  `        </div>

        <div className={activeTab === "users" ? "contents" : "hidden"}>
          <div className="grid gap-6">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-3xl text-foreground">Quản lý Thành viên</h3>`);

// 7. Dashboard Wrap
r(`      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-3xl text-foreground">Duyệt cộng đồng</h3>`,
  `        </div>

        <div className={activeTab === "dashboard" ? "contents" : "hidden"}>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl text-foreground">Duyệt cộng đồng</h3>`);

// 8. Settings Bottom Wrap
r(`      <div className="grid gap-6 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-primary" />
              <h3 className="font-display text-3xl text-foreground">Link ảnh nhanh</h3>`,
  `        </div>

        <div className={activeTab === "settings" ? "contents" : "hidden"}>
          <div className="grid gap-6 xl:grid-cols-3">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <Link2 className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-3xl text-foreground">Link ảnh nhanh</h3>`);

// 9. End Wrap
r(`      </div>
    </div>
  );
}`,
  `          </div>
        </div>
      </main>
    </div>
  );
}`);

fs.writeFileSync('components/admin/admin-panel.tsx', code);
