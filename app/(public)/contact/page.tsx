import Link from "next/link";
import { Metadata } from "next";
import ContactForm from "@/components/modules/public/ContactForm";
import ContactFaq from "@/components/modules/public/ContactFaq";

export const metadata: Metadata = {
    title: "Contact Us | Authesci",
    description: "Get in touch with the Authesci team for support, partnerships, or inquiries.",
};

import { getFAQs } from "@/app/(app)/actions/faq";

export default async function ContactPage() {
    const result = await getFAQs();
    const faqs = result.success ? result.data : [];

    return (
        <>
            {/* Breadcumb Section */}
            <section className="breadcumb-section wow fadeInUp mt40">
                <div className="cta-commmon-v1 cta-banner bgc-thm2 mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg">
                    <img className="left-top-img wow zoomIn" src="front-assets/images/vector-img/left-top.png" alt="" />
                    <img className="right-bottom-img wow zoomIn" src="front-assets/images/vector-img/right-bottom.png" alt="" />
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-5">
                                <div className="position-relative wow fadeInUp" data-wow-delay="300ms">
                                    <h2 className="text-white">Contact us</h2>
                                    <p className="text mb0 text-white">We'd love to talk about how we can help you.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="pt0 pb90">
                <div className="container">
                    <div className="row wow fadeInUp" data-wow-delay="300ms">
                        <div className="col-lg-6">
                            <div className="main-title mb30">
                                <h2 className="title">Have questions? We'd love to hear from you.</h2>
                                <p className="paragraph">
                                    Whether you have a partnership idea or need technical support, our team is ready to help.
                                </p>
                            </div>
                            <div className="row">
                                <div className="col-md-6 col-lg-12">
                                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                                        <div className="icon flex-shrink-0"><span className="flaticon-tracking"></span></div>
                                        <div className="details">
                                            <h5 className="title">Address</h5>
                                            <p className="text">Lagos, Nigeria (HQ)</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-12">
                                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                                        <div className="icon flex-shrink-0"><span className="flaticon-call"></span></div>
                                        <div className="details">
                                            <h5 className="title">Phone</h5>
                                            <p className="text">+(234) 800-AUTHESCI</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 col-lg-12">
                                    <div className="iconbox-style1 contact-style d-flex align-items-start mb30">
                                        <div className="icon flex-shrink-0"><span className="flaticon-mail"></span></div>
                                        <div className="details">
                                            <h5 className="title">Email</h5>
                                            <p className="text">support@authesci.com</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="contact-page-form default-box-shadow1 bdrs8 bdr1 p50 mb30-md bgc-white">
                                <h4 className="form-title mb25">Send us a message</h4>
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ContactFaq faqs={faqs as any} />
        </>
    );
}
