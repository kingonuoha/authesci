import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { User } from "@supabase/supabase-js";
import { Profile, Role } from "@prisma/client";
import { headers } from "next/headers"; // Import headers

interface AuthenticatedUser {
  user: User;
  profile: Profile;
}

interface GetAuthenticatedUserOptions {
  allowedRoles?: Role[];
}

export async function getAuthenticatedUser(
  options: GetAuthenticatedUserOptions = {}
): Promise<AuthenticatedUser> {
  const { allowedRoles } = options;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=profile_not_found");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    redirect("/login?error=unauthorized");
  }

  // Profile completion check (will be moved to middleware)
  // const pathname = headers().get("x-pathname") || "/";
  // if (profile.completionScore === 0 && !pathname.endsWith("/profile/edit")) {
  //   redirect("/profile/edit");
  // }

  return { user, profile };
}
