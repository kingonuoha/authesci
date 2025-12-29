import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Us | Authesci",
    description: "Learn about Authesci's mission to bridge the gap in the African scientific landscape.",
};

export default function AboutPage() {
    return (
        <>
            {/* Breadcumb Section */}
            <section className="breadcumb-section mt40">
                <div className="cta-about-v1 mx-auto maxw1700 pt120 pb120 bdrs16 position-relative overflow-hidden d-flex align-items-center mx20-lg">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-5">
                                <div className="position-relative">
                                    <h2 className="text-white">About</h2>
                                    <p className="text-white mb30">Learn about Authesci's mission to bridge the gap in the African scientific landscape.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* About Section */}
            <section className="our-about pt0 pb60">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <div className="main-title2">
                                <h2 className="title">Science Doesn't Happen in Isolation.</h2>
                                <p className="paragraph">
                                    Africa's Premier Research Hub for Collaboration, Discovery, and Career Growth.
                                </p>
                            </div>
                            <div className="about-text mb30">
                                <p className="mb20">
                                    For too long, African science has been fragmented. Brilliant researchers work in silos, innovative labs struggle to find talent, and groundbreaking projects stall due to a lack of visibility.
                                </p>
                                <p className="mb20">
                                    <strong>Authesci</strong> changes the narrative. We are not just a job board; we are the digital ecosystem where the African scientific community comes alive. We bridge the gap between "I have an idea" and "I have a team."
                                </p>
                                <p>
                                    Whether you are a graduate student looking for your first break, a Principal Investigator seeking a specialist, or a biotech firm hiring top talent, Authesci is your trusted partner.
                                </p>
                            </div>
                            <Link href="/signup" className="ud-btn btn-thm">
                                Join Our Community <i className="fal fa-arrow-right-long"></i>
                            </Link>
                        </div>
                        <div className="col-lg-6">
                            <div className="position-relative mb30-md">
                                <Image
                                    src="/front-assets/images/about/about-1.jpg"
                                    alt="About Authesci"
                                    width={600}
                                    height={600}
                                    className="w-100 h-100 object-fit-cover rounded"
                                />
                                <div className="imgbox-2 default-box-shadow1 text-center bdrs20">
                                    <div className="icon">
                                        <span className="flaticon-web-design"></span>
                                    </div>
                                    <div className="details">
                                        <h6 className="title">500+</h6>
                                        <p className="text">Researchers Connected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="pb90 pb30-md pt90">
                <div className="container">
                    <div className="row align-items-center wow fadeInUp" data-wow-delay="00ms">
                        <div className="col-lg-6">
                            <div className="main-title">
                                <h2 className="title">Why Authesci?</h2>
                                <p className="paragraph">We are built for the unique needs of the African research ecosystem.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row wow fadeInUp" data-wow-delay="300ms">
                        <div className="col-sm-6 col-lg-4">
                            <div className="iconbox-style1 border-less p-0">
                                <div className="icon before-none"><span className="flaticon-cv"></span></div>
                                <div className="details">
                                    <h4 className="title mt10 mb-3">Smart Profile</h4>
                                    <p className="text">Showcase your publications and skills, not just your job history. Let opportunities find you.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-4">
                            <div className="iconbox-style1 border-less p-0">
                                <div className="icon before-none"><span className="flaticon-web-design-1"></span></div>
                                <div className="details">
                                    <h4 className="title mt10 mb-3">Project Workspace</h4>
                                    <p className="text">A dedicated digital lab to manage files, tasks, and data with your team securely.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-4">
                            <div className="iconbox-style1 border-less p-0">
                                <div className="icon before-none"><span className="flaticon-secure"></span></div>
                                <div className="details">
                                    <h4 className="title mt10 mb-3">Escrow Payments</h4>
                                    <p className="text">Funds are held securely until milestones are met—safety for you and the scientist.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Funfact */}
            <section className="pb0 pt60">
                <div className="container maxw1600 bdrb1 pb60">
                    <div className="row justify-content-center wow fadeInUp" data-wow-delay="300ms">
                        <div className="col-6 col-md-3">
                            <div className="funfact_one text-center">
                                <div className="details">
                                    <ul className="ps-0 mb-0 d-flex justify-content-center">
                                        <li><div className="timer">1,200</div></li>
                                        <li><span>+</span></li>
                                    </ul>
                                    <p className="text mb-0">Verified Scientists</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="funfact_one text-center">
                                <div className="details">
                                    <ul className="ps-0 mb-0 d-flex justify-content-center">
                                        <li><div className="timer">85</div></li>
                                        <li><span>+</span></li>
                                    </ul>
                                    <p className="text mb-0">Partner Institutions</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="funfact_one text-center">
                                <div className="details">
                                    <ul className="ps-0 mb-0 d-flex justify-content-center">
                                        <li><div className="timer">300</div></li>
                                        <li><span>+</span></li>
                                    </ul>
                                    <p className="text mb-0">Projects Funded</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 col-md-3">
                            <div className="funfact_one text-center">
                                <div className="details">
                                    <ul className="ps-0 mb-0 d-flex justify-content-center">
                                        <li><div className="timer">50</div></li>
                                        <li><span>M+</span></li>
                                    </ul>
                                    <p className="text mb-0">Data Points Analyzed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="our-testimonial">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 mx-auto wow fadeInUp" data-wow-delay="300ms">
                            <div className="main-title text-center">
                                <h2>Testimonials</h2>
                                <p className="paragraph">See what the scientific community is saying about Authesci.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-8 m-auto wow fadeInUp" data-wow-delay="500ms">
                            <div className="testimonial-style2">
                                <div className="tab-content" id="pills-tabContent">
                                    <div className="tab-pane fade show active" id="pills-1st" role="tabpanel" aria-labelledby="pills-1st-tab">
                                        <div className="testi-content text-center">
                                            <span className="icon fas fa-quote-left"></span>
                                            <h4 className="testi-text">"Authesci connected me with a lab in Kenya that needed my exact expertise in genomics. It's a game changer for African science."</h4>
                                            <h6 className="name">Dr. Amina Z.</h6>
                                            <p className="design">Postdoc, University of Cape Town</p>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="pills-2nd" role="tabpanel" aria-labelledby="pills-2nd-tab">
                                        <div className="testi-content text-center">
                                            <span className="icon fas fa-quote-left"></span>
                                            <h4 className="testi-text">"Finding qualified research assistants used to take months. With Authesci, I found verified candidates in days."</h4>
                                            <h6 className="name">Prof. Samuel O.</h6>
                                            <p className="design">Principal Investigator, Lagos Biotech</p>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="pills-3rd" role="tabpanel" aria-labelledby="pills-3rd-tab">
                                        <div className="testi-content text-center">
                                            <span className="icon fas fa-quote-left"></span>
                                            <h4 className="testi-text">"The escrow payment system gives me peace of mind. I know I'll get paid for my consulting work."</h4>
                                            <h6 className="name">Dr. Chioma E.</h6>
                                            <p className="design">Freelance Data Analyst</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="tab-list position-relative">
                                    <ul className="nav nav-pills justify-content-center" id="pills-tab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link active ps-0" id="pills-1st-tab" data-bs-toggle="pill" data-bs-target="#pills-1st" type="button" role="tab" aria-controls="pills-1st" aria-selected="true"><img src="/front-assets/images/testimonials/testi-1.png" alt="" /></button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="pills-2nd-tab" data-bs-toggle="pill" data-bs-target="#pills-2nd" type="button" role="tab" aria-controls="pills-2nd" aria-selected="false"><img src="/front-assets/images/testimonials/testi-2.png" alt="" /></button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button className="nav-link" id="pills-3rd-tab" data-bs-toggle="pill" data-bs-target="#pills-3rd" type="button" role="tab" aria-controls="pills-3rd" aria-selected="false"><img src="/front-assets/images/testimonials/testi-3.png" alt="" /></button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-banner-about2 at-home2 mx-auto maxw1700 position-relative mx20-lg pt60-lg pb60-lg">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7 col-xl-6 wow fadeInLeft">
                            <div className="cta-style2">
                                <h2 className="">Ready to change the future of African Science?</h2>
                                <p className="">Join thousands of researchers and institutions making a difference today.</p>
                                <Link href="/signup" className="ud-btn btn-thm">
                                    Get Started <i className="fal fa-arrow-right-long"></i>
                                </Link>
                            </div>
                        </div>
                        <div className="col-lg-5 col-xl-6 wow fadeInRight" data-wow-delay="300ms">
                            <div className="cta-img-home2 position-relative text-end">
                                <Image
                                    src="/front-assets/images/about/about-7.jpg"
                                    alt="CTA"
                                    width={450}
                                    height={450}
                                    className="bdrs12"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
