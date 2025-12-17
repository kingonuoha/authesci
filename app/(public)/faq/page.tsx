import { getFAQs } from "@/app/(app)/actions/faq";
import ContactFaq from "@/components/modules/public/ContactFaq";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "FAQ | Authesci",
    description: "Frequently asked questions about Authesci.",
};

export default async function FaqPage() {
    const result = await getFAQs();
    const faqs = result.success ? result.data : [];

    return (
        <div className="pt-20">
            <ContactFaq faqs={faqs as any} />
        </div>
    );
}
