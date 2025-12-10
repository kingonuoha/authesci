'use client';

import React from 'react';

const HeroV3 = () => {
    return (
        <section className="home3-hero">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-xl-7">
                        <div className="home3-hero-content pe-xl-5 position-relative zi1">
                            <h2 className="title text-thm2 animate-up-1">
                                Hire Experts & Get Your <br className="d-none d-lg-block" />
                                Any Job Done
                            </h2>
                            <p className="ff-heading mb30 mt20 animate-up-2">
                                Work with talented people at the most affordable price to get the
                                most out of your time and cost
                            </p>
                            <div className="advance-search-tab at-home3 default-box-shadow1 bgc-white bgct-sm bdrn-sm p10 p0-md bdrs4 position-relative zi9 animate-up-3">
                                <div className="row">
                                    <div className="col-md-5 col-lg-6 col-xl-6">
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
                                    <div className="col-md-4 col-lg-4 col-xl-3 d-none d-md-block">
                                        <div className="bselect-style1 bdrl1 bdrn-sm">
                                            <select className="selectpicker" data-width="100%">
                                                <option>City, state, or zip</option>
                                                <option data-tokens="Graphics&Design">
                                                    Graphics & Design
                                                </option>
                                                <option data-tokens="DigitlMarketing">
                                                    Digital Marketing
                                                </option>
                                                <option data-tokens="Writing&Translation">
                                                    Writing & Translation
                                                </option>
                                                <option data-tokens="Video&Animation">
                                                    Video & Animation
                                                </option>
                                                <option data-tokens="Music&Audio">Music & Audio</option>
                                                <option data-tokens="Programming&Tech">
                                                    Programming & Tech
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-lg-2 col-xl-3">
                                        <div className="text-center text-xl-end">
                                            <button
                                                className="ud-btn btn-home3 w-100-sm"
                                                type="button"
                                            >
                                                Search
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text fz15 me-2 mb-0 mt30 animate-up-4">
                                Trusted by
                            </p>
                            <div className="home3-hero-partner mt20 animate-up-4">
                                <li className="d-inline-block me-3 me-sm-5 mb-3 mb-md-0">
                                    <img src="/front-assets/images/partners/1.png" alt="Partner 1" />
                                </li>
                                <li className="d-inline-block me-3 me-sm-5 mb-3 mb-md-0">
                                    <img src="/front-assets/images/partners/2.png" alt="Partner 2" />
                                </li>
                                <li className="d-inline-block me-3 me-sm-5 mb-3 mb-md-0">
                                    <img src="/front-assets/images/partners/3.png" alt="Partner 3" />
                                </li>
                                <li className="d-inline-block">
                                    <img src="/front-assets/images/partners/4.png" alt="Partner 4" />
                                </li>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-5 d-none d-xl-block">
                        <div className="position-relative">
                            <div className="home3-hero-img">
                                <div className="d-flex align-items-center">
                                    <img
                                        src="/front-assets/images/about/home3-hero-img-1.jpg"
                                        alt="Hero Image 1"
                                        className="animate-up-1"
                                    />
                                    <div className="wrapper ml10">
                                        <img
                                            src="/front-assets/images/about/home3-hero-img-2.jpg"
                                            alt="Hero Image 2"
                                            className="animate-up-2 mb10"
                                        />
                                        <img
                                            src="/front-assets/images/about/home3-hero-img-3.jpg"
                                            alt="Hero Image 3"
                                            className="animate-up-3"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroV3;
