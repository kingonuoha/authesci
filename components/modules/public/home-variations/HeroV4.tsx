'use client';

import React from 'react';
import Link from 'next/link';

const HeroV4 = () => {
    return (
        <section className="hero-home4 pb-0 pt80">
            <div className="container">
                <div className="row align-items-center justify-content-between">
                    <div className="col-lg-6">
                        <div className="pr30 pr0-lg mb30-md position-relative">
                            <h1 className="animate-up-1 mb25 text-thm2">
                                Hire the best freelancers for <br className="d-none d-xl-block" />
                                any job, online.
                            </h1>
                            <p className="text animate-up-2">
                                Millions of people use freeio.com to turn their ideas into reality.
                            </p>
                            <div className="d-flex align-items-center mt30 animate-up-3">
                                <Link href="/browse-jobs" className="ud-btn btn-thm me-3">
                                    Find Work
                                </Link>
                                <Link href="/freelancers" className="ud-btn btn-thm-border">
                                    Find Talent
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 d-none d-lg-block">
                        <div className="home5-hero-content position-relative">
                            <img
                                src="/front-assets/images/about/home4-hero-element-1.png"
                                alt="Hero Element"
                                className="animate-up-1 bounce-x w-100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroV4;
