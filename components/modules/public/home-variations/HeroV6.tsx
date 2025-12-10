'use client';

import React from 'react';
import Link from 'next/link';

const HeroV6 = () => {
    return (
        <section className="hero-home6 py-0">
            <div className="container">
                <div className="row align-items-center justify-content-between">
                    <div className="col-lg-6">
                        <div className="pr50 pr0-xl mb30-md position-relative">
                            <h1 className="animate-up-1 mb15 text-thm2">
                                With talented <span className="text-thm">freelancers</span> <br className="d-none d-xl-block" />
                                do more work.
                            </h1>
                            <p className="animate-up-2 ff-heading mb30 text">
                                Millions of people use freeio.com to turn their ideas into reality.
                            </p>
                            <div className="advance-search-tab at-home6 bgc-white bdrs4 p10 position-relative zi2 animate-up-3">
                                <div className="row">
                                    <div className="col-md-9 col-lg-8 col-xl-9">
                                        <div className="advance-search-field mb10-sm">
                                            <form className="form-search position-relative">
                                                <div className="box-search">
                                                    <span className="icon far fa-magnifying-glass"></span>
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        name="search"
                                                        placeholder="What are you looking for?"
                                                    />
                                                    <div className="search-suggestions">
                                                        <h6 className="fz14 ml30 mt25 mb-3">
                                                            Popular Search
                                                        </h6>
                                                        <div className="box-suggestions">
                                                            <ul className="px-0 m-0 pb-4">
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile app development
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile app builder
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile legends
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile app ui ux design
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile game app development
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                                <li>
                                                                    <div className="info-product">
                                                                        <div className="item_title">
                                                                            mobile app design
                                                                        </div>
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-4 col-xl-3">
                                        <div className="text-center">
                                            <button
                                                className="ud-btn btn-thm2 bdrs4 w-100"
                                                type="button"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="d-block d-md-flex mt30 banner-text animate-up-4">
                                <p className="hero-text fz15 me-2 mb-0 text">
                                    Popular Searches
                                </p>
                                <Link className="text" href="#">
                                    {' '}
                                    Designer,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    Developer,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    Web,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    IOS,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    PHP,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    Senior,
                                </Link>
                                <Link className="text" href="#">
                                    {' '}
                                    Engineer
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-xl-5">
                        <div className="home6-hero-content position-relative">
                            <div className="iconbox-small1 d-none d-md-block wow fadeInRight default-box-shadow4 bounce-y animate-up-1">
                                <span className="icon flaticon-review"></span>
                                <div className="details">
                                    <h6>4.9/5</h6>
                                    <p className="text fz13 mb-0">Clients rate professionals</p>
                                </div>
                            </div>
                            <div className="iconbox-small2 d-none d-md-block wow fadeInLeft default-box-shadow4 bounce-y animate-up-2">
                                <span className="icon flaticon-review"></span>
                                <div className="details">
                                    <h6>+12M</h6>
                                    <p className="text fz13 mb-0">Project Completed</p>
                                </div>
                            </div>
                            <img
                                src="/front-assets/images/about/element-10.png"
                                alt="Element 10"
                                className="bounce-x img-4"
                            />
                            <img
                                src="/front-assets/images/about/element-11.png"
                                alt="Element 11"
                                className="spin-right img-5 d-none d-sm-block"
                            />
                            <img
                                src="/front-assets/images/about/home6-hero-element-1.png"
                                alt="Element 1"
                                className="bounce-y img-1 d-none d-sm-block"
                            />
                            <img
                                src="/front-assets/images/about/home6-hero-element-2.png"
                                alt="Element 2"
                                className="bounce-y img-2 d-none d-sm-block"
                            />
                            <img
                                src="/front-assets/images/about/home6-hero-element-3.png"
                                alt="Element 3"
                                className="bounce-y img-3 d-none d-sm-block"
                            />
                            <img
                                src="/front-assets/images/about/home6-hero-img-1.png"
                                alt="Hero Image"
                                className="animate-up-1 w-100"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroV6;
