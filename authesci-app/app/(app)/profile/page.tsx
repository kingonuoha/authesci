import { getAuthenticatedUser } from "@/lib/services/auth-service";
import ProfileContent from "./ProfileContent";

export default async function ProfilePage() {
    const { profile } = await getAuthenticatedUser();

    // TODO: Fetch supported banks if needed. 
    // For now passing empty array as we don't have a configured bank provider yet.
    const banks: any[] = [];

    return <ProfileContent profile={profile} banks={banks} />;
}
