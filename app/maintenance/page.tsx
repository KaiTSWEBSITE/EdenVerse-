export const metadata = {
  title: "Đang Bảo Trì | EdenVerse",
  description: "Website đang tạm đóng để xây dựng phiên bản mới.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
          EdenVerse Đang Nâng Cấp
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400">
          Chúng tôi đang tạm đóng trang web để xây dựng một phiên bản hoàn toàn mới.
        </p>
        <p className="text-zinc-500">
          Cảm ơn bạn đã luôn ủng hộ EdenVerse. Hãy chờ đợi sự trở lại của chúng tôi nhé!
        </p>
      </div>
    </div>
  );
}
