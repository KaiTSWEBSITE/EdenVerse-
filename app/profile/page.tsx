import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/profile");
  }

  redirect(`/profile/${session.user.username}`);
}
