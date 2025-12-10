"use client";

import React, { useState } from "react";

const faqItems = [
    {
        question: "How do I reset my password?",
        answer: "You can reset your password by clicking on the 'Forgot Password' link on the login page. Follow the instructions sent to your email to create a new password."
    },
    {
        question: "How do I delete my account?",
        answer: "If you wish to delete your account, please contact our support team directly through the form above or email us at support@authesci.com. We will process your request within 48 hours."
    },
    {
        question: "Can I change my username?",
        answer: "Usernames are unique identifiers on Authesci. Generally, they cannot be changed once set. However, if you have a compelling reason (like a legal name change), please contact support."
    },
    {
        question: "How do I report a bug?",
        answer: "We appreciate your help in improving Authesci! Please use the contact form above and selecting 'Technical Support' or email us with details and screenshots."
    }
];

export default function ContactFaq() {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first item by default

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="pb70">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
                        <div className="main-title text-center">
                            <h2 className="title">Frequently Asked Questions</h2>
                            <p className="paragraph mt10">
                                Quick answers to common questions about contacting us.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="row wow fadeInUp" data-wow-delay="300ms">
                    <div className="col-lg-8 mx-auto">
                        <div className="ui-content">
                            <div className="accordion-style1 faq-page">
                                <div className="accordion">
                                    {faqItems.map((item, index) => {
                                        const isOpen = openIndex === index;
                                        return (
                                            <div
                                                key={index}
                                                className={`accordion-item ${isOpen ? "active" : ""}`}
                                            >
                                                <h2 className="accordion-header">
                                                    <button
                                                        className={`accordion-button ${!isOpen ? "collapsed" : ""}`}
                                                        type="button"
                                                        onClick={() => toggleItem(index)}
                                                    >
                                                        {item.question}
                                                    </button>
                                                </h2>
                                                <div
                                                    className={`accordion-collapse collapse ${isOpen ? "show" : ""}`}
                                                >
                                                    <div className="accordion-body">{item.answer}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
