"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookieConsent");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem("cookieConsent", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="cookie-consent-banner position-fixed bottom-0 start-0 w-100 bg-dark text-white p-3 z-3" style={{ zIndex: 9999 }}>
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8 mb-2 mb-md-0">
                        <p className="mb-0 fz14">
                            We use cookies to improve your experience and analyze site traffic. By continuing to use our site, you agree to our <Link href="/privacy" className="text-thm">Privacy Policy</Link>.
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <button onClick={acceptCookies} className="ud-btn btn-thm btn-sm">
                            Accept All <i className="fal fa-arrow-right-long"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
