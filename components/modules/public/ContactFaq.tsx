"use client";

import React, { useState } from "react";


interface FAQ {
    id: string;
    question: string;
    answer: string;
}

interface ContactFaqProps {
    faqs?: FAQ[];
}

export default function ContactFaq({ faqs = [] }: ContactFaqProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first item by default

    // Fallback if no FAQs provided
    const displayFaqs = faqs.length > 0 ? faqs : [
        { id: '1', question: "No FAQs available", answer: "Please check back later." }
    ];


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
                                    {displayFaqs.map((item, index) => {
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
