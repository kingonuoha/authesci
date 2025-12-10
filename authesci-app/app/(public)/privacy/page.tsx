import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Authesci",
    description: "How Authesci collects, uses, and protects your data.",
};

export default function PrivacyPage() {
    return (
        <>
            <section className="breadcumb-section pt30 pb30">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="breadcumb-style1">
                                <div className="breadcumb-list">
                                    <Link href="/">Home</Link>
                                    <Link href="/privacy">Privacy Policy</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="pt0 pb90">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="ui-content mt30 mb30">
                                <h2 className="mb10">Privacy Policy</h2>
                                <p className="mb25 text">Last updated: December 05, 2025</p>

                                <h4 className="mb10">1. Introduction</h4>
                                <p className="mb25 text">
                                    At Authesci ("we", "us", or "our"), we respect the privacy of our users ("user", "you", or "scientist/employer"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <strong>authesci.com</strong> and use our platform for research collaboration and recruitment. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
                                </p>

                                <h4 className="mb10">2. Information We Collect</h4>
                                <p className="mb10 text">
                                    We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device.
                                </p>
                                <ul className="list-style-type-bullet mb25 ps-3">
                                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site.</li>
                                    <li><strong>Professional Data:</strong> Curriculum Vitae (CV), publication history, research interests, skills, institutional affiliations, and verification documents (e.g., student ID, staff ID).</li>
                                    <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Site. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processor, <strong>Paystack</strong>, and you are encouraged to review their privacy policy and contact them directly for responses to your questions.</li>
                                    <li><strong>Project Data:</strong> Information uploaded to project workspaces, including datasets, research notes, and communication logs within the platform.</li>
                                </ul>

                                <h4 className="mb10">3. How We Use Your Information</h4>
                                <p className="mb25 text">
                                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
                                </p>
                                <ul className="list-style-type-bullet mb25 ps-3">
                                    <li>Create and manage your account.</li>
                                    <li>Facilitate the matching of Scientists with Employers/Projects through our AI algorithms.</li>
                                    <li>Process payments and refunds via our Escrow system.</li>
                                    <li>Verify your identity and institutional affiliation to maintain the integrity of our "Verified Only" community.</li>
                                    <li>Send you email regarding your account or order.</li>
                                    <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
                                    <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
                                    <li>Comply with legal obligations and prevent fraud.</li>
                                </ul>

                                <h4 className="mb10">4. Sharing Your Information</h4>
                                <p className="mb25 text">
                                    We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
                                </p>
                                <ul className="list-style-type-bullet mb25 ps-3">
                                    <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                                    <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, email delivery, hosting services, customer service, and marketing assistance.</li>
                                    <li><strong>Other Users:</strong> If you interact with other users of the Site, those users may see your name, profile photo, and descriptions of your activity, including sending invitations to other users, chatting with other users, liking posts, following blogs.</li>
                                </ul>

                                <h4 className="mb10">5. Security of Your Information</h4>
                                <p className="mb25 text">
                                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                                </p>

                                <h4 className="mb10">6. Policy for Children</h4>
                                <p className="mb25 text">
                                    We do not knowingly solicit information from or market to children under the age of 13. If you become aware of any data we have collected from children under age 13, please contact us using the contact information provided below.
                                </p>

                                <h4 className="mb10">7. Contact Us</h4>
                                <p className="mb25 text">
                                    If you have questions or comments about this Privacy Policy, please contact us at:
                                    <br /><br />
                                    <strong>Authesci Support</strong><br />
                                    Email: <a href="mailto:privacy@authesci.com">privacy@authesci.com</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
