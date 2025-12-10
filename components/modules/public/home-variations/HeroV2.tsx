'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface HeroStats {
    scientists: number;
    projects: number;
    institutions: number;
}

const HeroV2 = ({ stats }: { stats?: HeroStats }) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const initWow = () => {
            if (typeof window !== 'undefined' && (window as any).WOW) {
                new (window as any).WOW().init();
            }
        };
        initWow();
        // Check again shortly in case script loads asynchronously
        const timer = setTimeout(initWow, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/jobs?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <section className="hero-home2 pb100-xs position-relative" style={{ backgroundImage: 'none' }}>
            <div
                className="hero-bg-overlay position-absolute w-100 h-100 top-0 start-0"
                style={{
                    backgroundImage: "url('/front-assets/images/background/home2-hero-bg.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                    filter: 'hue-rotate(40deg) brightness(0.8) contrast(1.1)', // Changes green to professional blue
                    zIndex: 0
                }}
            />
            <div className="container position-relative" style={{ zIndex: 1 }}>
                <div className="row mb60 mb0-xl">
                    <div className="col-xl-7">
                        <div className="pr30 pr0-lg mb30-md position-relative">
                            <h1 className="animate-up-1 mb25 text-white">
                                Access Africa's Top <br className="d-none d-xl-block" />
                                Research Talent
                            </h1>
                            <p className="text-white animate-up-2">
                                Accelerate your projects with vetted scientists, data experts, and
                                academics. <br className="d-none d-lg-block" /> Secure payments,
                                intellectual property protection, and guaranteed quality.
                            </p>
                            <div className="advance-search-tab bgc-white p10 bdrs4-sm bdrs60 banner-btn position-relative zi1 animate-up-3 mt30">
                                <div className="row">
                                    <div className="col-md-5 col-lg-6 col-xl-6">
                                        <div className="advance-search-field mb10-sm">
                                            <form className="form-search position-relative" onSubmit={handleSearch}>
                                                <div className="box-search">
                                                    <span className="icon far fa-magnifying-glass"></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        name="search"
                                                        placeholder="What are you looking for?"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                    />
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-md-4 col-lg-4 col-xl-3">
                                        <div className="bselect-style1 bdrl1 bdrn-sm">
                                            <select className="selectpicker" data-width="100%">
                                                <option>All Categories</option>
                                                <option data-tokens="Data Science">Data Science</option>
                                                <option data-tokens="Biotech">Biotech</option>
                                                <option data-tokens="Academic Writing">Academic Writing</option>
                                                <option data-tokens="Lab Services">Lab Services</option>
                                                <option data-tokens="Consulting">Consulting</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-2 col-xl-3">
                                        <div className="text-center text-xl-start">
                                            <button
                                                className="ud-btn btn-thm w-100 bdrs60"
                                                type="button"
                                                onClick={handleSearch}
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row mt20 animate-up-4">
                                <div className="col-xl-9">
                                    <div className="row justify-content-between">
                                        <div className="col-6 col-sm-3 funfact_one at-home2-hero">
                                            <div className="details">
                                                <ul className="ps-0 mb-0 d-flex">
                                                    <li>
                                                        <div className="timer">{stats?.scientists || 500}</div>
                                                    </li>
                                                    <li>
                                                        <span>+</span>
                                                    </li>
                                                </ul>
                                                <p className="text-white mb-0">Verified Scientists</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-sm-3 funfact_one at-home2-hero">
                                            <div className="details">
                                                <ul className="ps-0 mb-0 d-flex">
                                                    <li>
                                                        <div className="timer">{stats?.institutions || 50}</div>
                                                    </li>
                                                    <li>
                                                        <span>+</span>
                                                    </li>
                                                </ul>
                                                <p className="text-white mb-0">Institutions</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-sm-3 funfact_one at-home2-hero">
                                            <div className="details">
                                                <ul className="ps-0 mb-0 d-flex">
                                                    <li>
                                                        <div className="timer">98</div>
                                                    </li>
                                                    <li>
                                                        <span>%</span>
                                                    </li>
                                                </ul>
                                                <p className="text-white mb-0">Satisfaction Rate</p>
                                            </div>
                                        </div>
                                        <div className="col-6 col-sm-3 funfact_one at-home2-hero pe-0">
                                            <div className="details">
                                                <ul className="ps-0 mb-0 d-flex">
                                                    <li>
                                                        <div className="timer">{stats?.projects || 20}</div>
                                                    </li>
                                                    <li>
                                                        <span>+</span>
                                                    </li>
                                                </ul>
                                                <p className="text-white mb-0">Projects Funded</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5 d-none d-xl-block position-relative">
                        <img
                            src="/front-assets/images/about/about-1.png"
                            alt="Authesci Hero"
                            className="animate-up-1 main-img-home2"
                        />
                        <div className="home2-hero-content position-relative">
                            <div className="iconbox-small1 d-none d-xl-flex wow fadeInRight default-box-shadow4 bounce-x animate-up-1">
                                <span className="icon flaticon-review"></span>
                                <div className="details pl20">
                                    <h6 className="mb-1">Verified Credentials</h6>
                                    <p className="text fz13 mb-0">100% Vetted Scientists</p>
                                </div>
                            </div>
                            <div className="iconbox-small2 d-none d-xl-flex wow fadeInLeft default-box-shadow4 bounce-y animate-up-2">
                                <span className="icon flaticon-review"></span>
                                <div className="details pl20">
                                    <h6 className="mb-1">Secure Escrow</h6>
                                    <p className="text fz13 mb-0">Safe Milestone Payments</p>
                                </div>
                            </div>
                            <div className="iconbox-small3 d-none d-xl-flex wow fadeInRight default-box-shadow4 bounce-x animate-up-3">
                                <span className="icon flaticon-review"></span>
                                <div className="details pl20">
                                    <h6 className="mb-1">IP Protection</h6>
                                    <p className="text fz13 mb-0">Your Research is Safe</p>
                                </div>
                            </div>
                            {/* <img src="images/about/about-1.png" alt="" class="animate-up-1 main-img-home2"> */}
                            <img src="/front-assets/images/about/happy-client.png" alt="" className="bounce-x bdrs16 img-1 default-box-shadow4" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroV2;
