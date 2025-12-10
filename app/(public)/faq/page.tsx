"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FaqItem {
    question: string;
    answer: string;
}

interface FaqCategory {
    title: string;
    items: FaqItem[];
}

const faqs: FaqCategory[] = [
    {
        title: "General Platform",
        items: [
            {
                question: "What is Authesci?",
                answer: "Authesci is Africa's premier research hub, designed to connect verified African scientists with global opportunities, funding, collaboration, and resources. We aim to democratize access to research tools and foster innovation across the continent."
            },
            {
                question: "Who can join Authesci?",
                answer: "Authesci is open to individual researchers, scientists, students, academic institutions, and organizations looking to fund or collaborate on research projects within Africa."
            },
            {
                question: "Is there a fee to join?",
                answer: "Creating a basic profile on Authesci is free. We also offer premium memberships for enhanced visibility, advanced networking tools, and priority access to funding opportunities."
            }
        ]
    },
    {
        title: "For Scientists",
        items: [
            {
                question: "How do I verify my scientist profile?",
                answer: "To ensure the integrity of our platform, we require verification. You can verify your profile by uploading your academic credentials (such as your PhD or Master's degree certificate) and linking your ORCID iD or institutional email address during the sign-up process."
            },
            {
                question: "How can I find active jobs or grants?",
                answer: "Once logged in, navigate to the 'Browse Jobs' or 'Grants' section. You can filter opportunities by your field of study, location, and funding amount to find the perfect match for your research goals."
            },
            {
                question: "Is my intellectual property (IP) protected?",
                answer: "Yes, Authesci takes IP rights seriously. All collaborations and project proposals shared on the platform are covered by our standard non-disclosure agreements (NDAs) and IP policies to ensure your work remains yours until a formal agreement is signed."
            }
        ]
    },
    {
        title: "For Institutions & Partners",
        items: [
            {
                question: "How do I post a research project or grant?",
                answer: "Institutions can post projects by creating an organizational account. From your dashboard, you can use the 'Post a Job' or 'Create Grant' tools to detail your requirements, budget, and desired outcomes."
            },
            {
                question: "How does Authesci vet scientists?",
                answer: "Every scientist on our platform undergoes a verification process where we check academic credentials and institutional affiliations. We also provide a rating and review system for completed projects to maintain high standards."
            }
        ]
    }
];

export default function FaqPage() {
    const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({
        "General Platform-0": true, // Open the first item by default
    });

    const toggleItem = (categoryIndex: number, itemIndex: number) => {
        const key = `${faqs[categoryIndex].title}-${itemIndex}`;
        setOpenItems((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <>
            <section className="our-faq pb50">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 m-auto wow fadeInUp" data-wow-delay="300ms">
                            <div className="main-title text-center">
                                <h2 className="title">Frequently Asked Questions</h2>
                                <p className="paragraph mt10">
                                    Find answers to common questions about using Authesci to advance African science.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row wow fadeInUp" data-wow-delay="300ms">
                        <div className="col-lg-8 mx-auto">
                            {faqs.map((category, catIndex) => (
                                <div key={catIndex} className="ui-content mb40">
                                    <h4 className="title">{category.title}</h4>
                                    <div className="accordion-style1 faq-page">
                                        <div className="accordion">
                                            {category.items.map((item, itemIndex) => {
                                                const isOpen = openItems[`${category.title}-${itemIndex}`];
                                                return (
                                                    <div
                                                        key={itemIndex}
                                                        className={`accordion-item ${isOpen ? "active" : ""}`}
                                                    >
                                                        <h2 className="accordion-header">
                                                            <button
                                                                className={`accordion-button ${!isOpen ? "collapsed" : ""}`}
                                                                type="button"
                                                                onClick={() => toggleItem(catIndex, itemIndex)}
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
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
