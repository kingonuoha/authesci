import Link from "next/link";
import Image from "next/image";

export default function PublicFooter() {
    return (
        <section className="footer-style1 at-home2 pb-0 pt60">
            <div className="container">
                <div className="row">
                    <div className="col-sm-6 col-lg-3">
                        <div className="footer-widget light-style mb-4 mb-lg-5">
                            <Link className="footer-logo" href="/">
                                <Image
                                    className="mb40"
                                    src="/assets/images/logo.png"
                                    alt="Authesci Logo"
                                    width={140}
                                    height={40}
                                    style={{ height: "40px", width: "auto", filter: "brightness(0) invert(1)" }}
                                />
                            </Link>
                            <div className="contact-info mb40">
                                <p className="text-white mb10">
                                    Africa's Premier Research Hub.
                                </p>
                                <p className="text-white mb10">
                                    Connect, Collaborate, and Innovate.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="footer-widget light-style mb-4 mb-lg-5">
                            <div className="link-style1 light-style mb-3">
                                <h6 className="mb25 text-white">About</h6>
                                <ul className="ps-0">
                                    <li>
                                        <Link href="/about" className="text-white">About Us</Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className="text-white">Contact</Link>
                                    </li>
                                    <li>
                                        <Link href="/privacy" className="text-white">Privacy Policy</Link>
                                    </li>
                                    <li>
                                        <Link href="/terms" className="text-white">Terms of Service</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="footer-widget light-style mb-4 mb-lg-5">
                            <div className="link-style1 light-style mb-3">
                                <h6 className="mb25 text-white">For Scientists</h6>
                                <ul className="ps-0">
                                    <li>
                                        <Link href="/jobs" className="text-white">Browse Jobs</Link>
                                    </li>
                                    <li>
                                        <Link href="/register?role=SCIENTIST" className="text-white">Join as Researcher</Link>
                                    </li>
                                    <li>
                                        <Link href="/login" className="text-white">Login</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-6 col-lg-3">
                        <div className="footer-widget light-style mb-4 mb-lg-5">
                            <div className="link-style1 light-style mb-3">
                                <h6 className="mb25 text-white">For Institutions</h6>
                                <ul className="ps-0">
                                    <li>
                                        <Link href="/register?role=INSTITUTION" className="text-white">Post a Project</Link>
                                    </li>
                                    <li>
                                        <Link href="/register?role=INSTITUTION" className="text-white">Find Talent</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container white-bdrt1 py-4">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <div className="text-center text-lg-start">
                            <p className="copyright-text mb-2 mb-md-0 text-white-light ff-heading">
                                © {new Date().getFullYear()} Authesci. All rights reserved.
                            </p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="footer_bottom_right_btns text-center text-lg-end">
                            <ul className="p-0 m-0">
                                <li className="list-inline-item">
                                    <a href="#" className="text-white">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a href="#" className="text-white">
                                        <i className="fab fa-twitter"></i>
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a href="#" className="text-white">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                </li>
                                <li className="list-inline-item">
                                    <a href="#" className="text-white">
                                        <i className="fab fa-linkedin-in"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
