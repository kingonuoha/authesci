import { getFAQs } from "@/app/(app)/actions/faq";
import FaqManager from "@/components/modules/admin/FaqManager";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Manage FAQs | Admin",
};

export default async function AdminFaqPage() {
    const result = await getFAQs();
    const faqs = result.success ? result.data : [];

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">FAQ Management</h1>
            <FaqManager faqs={faqs as any} />
        </div>
    );
}
