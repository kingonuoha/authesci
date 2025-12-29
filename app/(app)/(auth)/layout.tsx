'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import AuthCarousel from "@/components/modules/auth/AuthCarousel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative w-screen h-screen overflow-hidden bg-neutral-900 grid grid-cols-1 lg:grid-cols-2">

      {/* Background Carousel - Fixed to fill screen */}
      <div className="fixed inset-0 w-full h-full z-0">
        <AuthCarousel />
      </div>

      {/* Desktop Logo - Absolute Top Left (Hidden on Mobile) */}
      <div className="hidden lg:block absolute top-10 left-10 z-20">
        <Link href="/">
          <Image
            src="/assets/images/logo_authesci.png"
            alt="Authesci Logo"
            width={180}
            height={40}
            className="brightness-0 invert drop-shadow-md w-[180px]"
          />
        </Link>
      </div>

      {/* Left Column (Desktop Spacer) */}
      <div className="hidden lg:block"></div>

      {/* Right Content Area */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center items-center lg:items-end px-4 lg:pr-[10%]">

        {/* Mobile Logo - Centered above card (Hidden on Desktop) */}
        <div className="lg:hidden mb-10">
          <Link href="/">
            <Image
              src="/assets/images/logo_authesci.png"
              alt="Authesci Logo"
              width={160}
              height={35}
              className="brightness-0 invert drop-shadow-md"
            />
          </Link>
        </div>

        {/* Form wrapper with max-height for potential scrolling on small screens */}
        <div className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl p-1">
          {children}
        </div>
      </div>

    </section>
  );
}
