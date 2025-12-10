"use client";

import React, { useState } from "react";

type TabKey = "account" | "usage" | "ip" | "privacy" | "general";

export default function TermsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("account");

    const renderTabButton = (key: TabKey, label: string) => (
        <button
            className={`nav-link text-start ${activeTab === key ? "active" : ""}`}
            type="button"
            onClick={() => setActiveTab(key)}
        >
            {label}
        </button>
    );

    return (
        <>
            <section className="our-terms">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="main-title">
                                <h2>Terms and Conditions</h2>
                                <p className="text">
                                    Please read our terms carefully to ensure a smooth collaboration experience.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 col-lg-3 col-xl-2">
                            <div className="terms_condition_widget mb30-sm">
                                <div className="widget_list">
                                    <nav>
                                        <div className="nav nav-tabs text-start">
                                            {renderTabButton("account", "Account & Payments")}
                                            {renderTabButton("usage", "Usage Policy")}
                                            {renderTabButton("ip", "Intellectual Property")}
                                            {renderTabButton("privacy", "Privacy & Data")}
                                            {renderTabButton("general", "General Terms")}
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-9 col-lg-9 col-xl-9 offset-xl-1">
                            <div className="terms_condition_grid text-start">
                                <div className="tab-content">

                                    {/* Account & Payments Tab */}
                                    <div className={`tab-pane fade ${activeTab === 'account' ? 'show active' : ''}`}>
                                        <div className="grids mb90 mb40-md">
                                            <h4 className="title">1. User Accounts</h4>
                                            <p className="mb25 text fz15">
                                                To access certain features of Authesci, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for all activities that occur under your account.
                                            </p>
                                            <h4 className="title">2. Payments and Subscriptions</h4>
                                            <p className="text fz15">
                                                Authesci offers both free and paid membership tiers. By subscribing to a paid tier, you agree to pay the fees indicated for that service. Payments will be charged on a pre-pay basis on the day you sign up for a Premium Account and will cover the use of that service for a monthly or annual subscription period as indicated. Fees are not refundable except as required by law.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Usage Policy Tab */}
                                    <div className={`tab-pane fade ${activeTab === 'usage' ? 'show active' : ''}`}>
                                        <div className="grids mb90 mb40-md">
                                            <h4 className="title">1. Acceptable Use</h4>
                                            <p className="mb25 text fz15">
                                                You agree not to use the Service to collect, upload, transmit, display, or distribute any User Content (a) that violates any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right; (b) that is unlawful, harassing, abusive, tortious, threatening, harmful, invasive of another’s privacy, vulgar, defamatory, false, intentionally misleading, trade libelous, pornographic, obscene, or otherwise objectionable.
                                            </p>
                                            <h4 className="title">2. Research Integrity</h4>
                                            <p className="text fz15">
                                                Users claiming academic credentials must provide true verification proof. Falsifying research data, credentials, or project outcomes is strictly prohibited and will result in immediate account termination.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Intellectual Property Tab */}
                                    <div className={`tab-pane fade ${activeTab === 'ip' ? 'show active' : ''}`}>
                                        <div className="grids mb90 mb40-md">
                                            <h4 className="title">1. Ownership of Work</h4>
                                            <p className="mb25 text fz15">
                                                Unless otherwise agreed upon in writing between collaborating parties, the intellectual property rights of any pre-existing research shared on the platform remain with the original creator. Authesci does not claim ownership of user-generated content or research data uploaded to the platform.
                                            </p>
                                            <h4 className="title">2. Confidentiality</h4>
                                            <p className="text fz15">
                                                We encourage all users to sign specific Non-Disclosure Agreements (NDAs) before sharing sensitive unpublished data. Authesci facilitates this process but is not a party to these agreements unless explicitly stated.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Privacy & Data Tab */}
                                    <div className={`tab-pane fade ${activeTab === 'privacy' ? 'show active' : ''}`}>
                                        <div className="grids mb90 mb40-md">
                                            <h4 className="title">1. Data Collection</h4>
                                            <p className="mb25 text fz15">
                                                We collect personal data that you provide to us, such as name, email address, and academic history, as well as data collected automatically through cookies and usage logs.
                                            </p>
                                            <h4 className="title">2. Data Usage</h4>
                                            <p className="text fz15">
                                                Your data is used to provide and improve the Service, match you with relevant opportunities, and communicate with you. We do not sell your personal data to third parties. For full details, please refer to our Privacy Policy.
                                            </p>
                                        </div>
                                    </div>

                                    {/* General Terms Tab */}
                                    <div className={`tab-pane fade ${activeTab === 'general' ? 'show active' : ''}`}>
                                        <div className="grids mb90 mb40-md">
                                            <h4 className="title">1. Modification of Terms</h4>
                                            <p className="mb25 text fz15">
                                                We reserve the right to modify these Terms at any time. If we make changes to these Terms, we will post the revised Terms on the Service and update the "Last Updated" date. Your continued use of the Service following the posting of the changes constitutes your acceptance of such changes.
                                            </p>
                                            <h4 className="title">2. Governing Law</h4>
                                            <p className="text fz15">
                                                These Terms shall be governed by and defined following the laws of Lagos State, Nigeria. Authesci and yourself irrevocably consent that the courts of Nigeria shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
