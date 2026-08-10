"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Don't animate on the admin route or it could be jarring
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        mass: 1,
        opacity: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}
