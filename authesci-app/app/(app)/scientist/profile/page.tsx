import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getBanks } from "@/app/(app)/actions/payment";
import { redirect } from "next/navigation";
import ProfileContent from "@/app/(app)/profile/ProfileContent";

export default async function ScientistProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return <div>Profile not found</div>;
  }

  if (profile.role !== "SCIENTIST") {
    redirect(`/${profile.role.toLowerCase()}/dashboard`);
  }

  const banks = await getBanks();

  return <ProfileContent profile={profile} banks={banks} />;
}
