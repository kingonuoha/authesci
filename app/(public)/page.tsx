import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import TrendingJobs from "@/components/modules/public/TrendingJobs";
import HeroV2 from "@/components/modules/public/home-variations/HeroV2";
import HeroV3 from "@/components/modules/public/home-variations/HeroV3";
import HeroV4 from "@/components/modules/public/home-variations/HeroV4";
import HeroV5 from "@/components/modules/public/home-variations/HeroV5";
import HeroV6 from "@/components/modules/public/home-variations/HeroV6";
import { getStats } from "@/lib/stats";

export const metadata: Metadata = {
    title: "Authesci | Africa's Premier Research Hub",
    description: "Connect, Collaborate, and Innovate. Bridging the gap between African scientists and global opportunities.",
    openGraph: {
        title: "Authesci | Africa's Premier Research Hub",
        description: "Connect, Collaborate, and Innovate. Bridging the gap between African scientists and global opportunities.",
        url: "https://authesci.com",
        siteName: "Authesci",
        images: [
            {
                url: "/front-assets/images/home/home-2.jpg",
                width: 1200,
                height: 630,
                alt: "Authesci - Africa's Premier Research Hub",
            },
        ],
        locale: "en_US",
        type: "website",
    },
};

export default async function HomePage() {
    const stats = await getStats();

    return (
        <section className="home-one p-0">
            {/* Swappable Hero Section */}
            {/* You can easily switch between HeroV2, HeroV3, HeroV4, HeroV5, and HeroV6 by changing the component below */}
            <HeroV2 stats={stats} />
            {/* <HeroV3 /> */}
            {/* <HeroV4 /> */}
            {/* <HeroV5 /> */}
            {/* <HeroV6 /> */}

            {/* Why Choose Authesci Section */}
            <section className="p-0">
                <div className="cta-banner3 hover-bgc-color mx-auto maxw1600 pt120 pt60-lg pb90 pb60-lg position-relative overflow-hidden">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-5 wow fadeInRight" data-wow-delay="500ms">
                                <div className="mb30">
                                    <div className="main-title">
                                        <h2 className="title">A whole world of scientific <br className="d-none d-md-block" /> talent at your fingertips</h2>
                                    </div>
                                </div>
                                <div className="why-chose-list">
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-badge"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">Verified Expertise</h4>
                                            <p className="text mb-0 fz15">Every scientist on Authesci is vetted for academic credentials and research history.</p>
                                        </div>
                                    </div>
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-money"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">Secure Collaboration</h4>
                                            <p className="text mb-0 fz15">Funds are held in escrow until project milestones are met and approved by you.</p>
                                        </div>
                                    </div>
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-security"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">IP Protection</h4>
                                            <p className="text mb-0 fz15">Your data and intellectual property are protected with industry-standard security and clear contracts.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <img className="cta-banner3-img wow fadeInLeft" src="/front-assets/images/about/about-5.jpg" alt="" data-wow-delay="300ms" />
                </div>
            </section>

            {/* Trending Jobs Section */}
            <TrendingJobs />

            {/* Trust Section (Verification) */}
            <section className="pt0 pb60">
                <div className="cta-banner bgc-thm3 mx-auto maxw1700 pt110 pb80 pb30-md bdrs12 position-relative">
                    <div className="container">
                        <div className="row align-items-start align-items-xl-center">
                            <div className="col-md-6 col-lg-7 col-xl-6">
                                <div className="position-relative mb35 mb0-sm wow fadeInRight" data-wow-delay="300ms">
                                    <div className="freelancer-widget d-none d-lg-block">
                                        <h5 className="title mb20"><span className="text-thm">500+</span> Verified Scientists</h5>
                                        <div className="thumb d-flex align-items-center mb20">
                                            <div className="flex-shrink-0">
                                                <img className="wa" src="/front-assets/images/team/ea-1.png" alt="" />
                                            </div>
                                            <div className="flex-grow-1 ml20">
                                                <h6 className="title mb-0">Dr. Amara Okeke</h6>
                                                <p className="fz14 mb-0">Molecular Biologist</p>
                                            </div>
                                        </div>
                                        <div className="thumb d-flex align-items-center mb20">
                                            <div className="flex-shrink-0">
                                                <img className="wa" src="/front-assets/images/team/ea-2.png" alt="" />
                                            </div>
                                            <div className="flex-grow-1 ml20">
                                                <h6 className="title mb-0">Prof. David Oseyi</h6>
                                                <p className="fz14 mb-0">Data Scientist</p>
                                            </div>
                                        </div>
                                        <div className="thumb d-flex align-items-center mb20">
                                            <div className="flex-shrink-0">
                                                <img className="wa" src="/front-assets/images/team/ea-3.png" alt="" />
                                            </div>
                                            <div className="flex-grow-1 ml20">
                                                <h6 className="title mb-0">Dr. Adanna Nwachukwu</h6>
                                                <p className="fz14 mb-0">Neuroscientist</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="freelancer-style1 about-page-style text-center d-none d-lg-block">
                                        <div className="thumb w90 mb25 mx-auto position-relative rounded-circle">
                                            <img className="rounded-circle mx-auto" src="/front-assets/images/team/fl-2.png" alt="" />
                                            <span className="online"></span>
                                        </div>
                                        <div className="details">
                                            <h5 className="title mb-1">Dr. Tunde Bakare</h5>
                                            <p className="mb-0">Bioinformatics Expert</p>
                                            <div className="review"><p><i className="fas fa-star fz10 review-color pr10"></i><span className="dark-color">4.9</span> (59 reviews)</p></div>
                                            <div className="skill-tags d-flex align-items-center justify-content-center mb20">
                                                <span className="tag">Genomics</span>
                                                <span className="tag mx10">Python</span>
                                                <span className="tag">R</span>
                                            </div>
                                            <hr className="opacity-100" />
                                            <div className="fl-meta d-flex align-items-center justify-content-between">
                                                <a className="meta fw500 text-start">Location<br /><span className="fz14 fw400">Lagos, NG</span></a>
                                                <a className="meta fw500 text-start">Rate<br /><span className="fz14 fw400">$120 / hr</span></a>
                                                <a className="meta fw500 text-start">Success<br /><span className="fz14 fw400">98%</span></a>
                                            </div>
                                        </div>
                                    </div>
                                    <img className="d-block d-lg-none w-100" src="/front-assets/images/about/verified-freelancer.png" alt="" />
                                </div>
                            </div>
                            <div className="col-md-6 col-lg-5 col-xl-5 offset-xl-1">
                                <div className="mb30 wow fadeInLeft" data-wow-delay="500ms">
                                    <div className="main-title">
                                        <h2 className="title">How Authesci Verification Works</h2>
                                        <p className="text">We ensure that every scientist on our platform is legitimate, so you can focus on the research.</p>
                                    </div>
                                </div>
                                <div className="why-chose-list wow fadeInLeft" data-wow-delay="500ms">
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-badge"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">1. Sign Up & Complete Profile</h4>
                                            <p className="text mb-0 fz15">Scientists create a profile and provide details about their academic background, skills, and publication history.</p>
                                        </div>
                                    </div>
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-money"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">2. Profile Review & Authenticity Check</h4>
                                            <p className="text mb-0 fz15">Our team reviews each profile for completeness, consistency, and publicly verifiable information such as publication links or online academic records.</p>
                                        </div>
                                    </div>
                                    <div className="list-one d-flex align-items-start mb30">
                                        <span className="list-icon flex-shrink-0 flaticon-security"></span>
                                        <div className="list-content flex-grow-1 ml20">
                                            <h4 className="mb-1">3. Get Verified Badge</h4>
                                            <p className="text mb-0 fz15">Once authenticity checks are completed, the scientist receives a verification badge and can apply for paid projects.</p>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/about" className="ud-btn btn-thm wow fadeInLeft" data-wow-delay="500ms">Learn More<i className="fal fa-arrow-right-long"></i></Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Schema.org Organization JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Authesci",
                        "url": "https://authesci.com",
                        "logo": "https://authesci.com/assets/images/logo.png",
                        "description": "Africa's Premier Research Hub. Connect, Collaborate, and Innovate.",
                        "sameAs": [
                            "https://twitter.com/authesci",
                            "https://www.linkedin.com/company/authesci"
                        ]
                    })
                }}
            />
        </section>
    );
}
