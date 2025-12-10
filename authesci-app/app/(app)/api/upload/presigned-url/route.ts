import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Verify access
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const collaborator = await prisma.collaborator.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: profile.id,
        },
      },
    });

    if (!collaborator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = `authesci/projects/${projectId}`;
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error) {
    console.error("Error generating signature:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
