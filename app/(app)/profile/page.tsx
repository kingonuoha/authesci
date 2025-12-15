import { getAuthenticatedUser } from "@/lib/services/auth-service";
import ProfileContent from "./ProfileContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Profile | Authesci",
    description: "View and edit your profile."
};

export default async function ProfilePage() {
    const { profile } = await getAuthenticatedUser();

    // TODO: Fetch supported banks if needed. 
    // For now passing empty array as we don't have a configured bank provider yet.
    const banks: any[] = [];

    // FIX: Sign CV URL if present (to handle restricted raw file access which causes 401)
    if (profile.cvUrl && profile.cvUrl.includes("cloudinary.com")) {
        try {
            // Determine resource type from URL or file extension
            const isRaw = profile.cvUrl.includes("/raw/") || profile.cvUrl.endsWith(".pdf");

            // Only strictly required for RAW files if "Block delivery" is enabled
            if (isRaw) {
                const { v2: cloudinary } = await import("cloudinary");

                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                    secure: true,
                });

                // Extract public_id: remove version and prefix
                // URL: https://res.cloudinary.com/.../raw/upload/v1234/folder/file.pdf
                // Regex matches everything after 'upload/' or 'upload/v123/'
                const matches = profile.cvUrl.match(/\/upload\/(?:v\d+\/)?(.+)$/);

                if (matches && matches[1]) {
                    const publicId = decodeURIComponent(matches[1]);

                    // Generate signed URL
                    // Important: resource_type must match exactly
                    // Generate signed URL
                    // Important: resource_type must match exactly
                    const signedUrl = cloudinary.url(publicId, {
                        resource_type: "raw",
                        type: "upload",
                        sign_url: true,
                        secure: true,
                        expires_at: Math.floor(Date.now() / 1000) + 3600
                    });

                    profile.cvUrl = signedUrl;
                    console.log(`Signed CV URL generated for ${profile.userId}`);
                }
            }
        } catch (e) {
            console.error("Failed to sign CV URL:", e);
        }
    }

    return <ProfileContent profile={profile} banks={banks} />;
}
