'use client';
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  let title = "";
  let subtitle = "";

  if (pathname.includes("/login")) {
    title = "Sign In to your Account";
    subtitle = "Welcome back! please enter your detail";
  } else if (pathname.includes("/signup")) {
    title = "Sign Up to your Account";
    subtitle = "Welcome! please enter your details";
  }

  return (
    <section className="bg-white dark:bg-dark-2 flex flex-wrap min-h-[100vh]">
      <div className="lg:w-1/2 lg:block hidden">
        <div className="flex items-center flex-col h-full justify-center">
          <Image src="/assets/images/auth/auth-img.png" alt="" width={500} height={500} />
        </div>
      </div>
      <div className="lg:w-1/2 py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] mx-auto w-full">
          <div>
            <Link href="/" className="mb-1.5 max-w-[290px]">
              <Image src="/assets/images/logo_authesci.png" alt="" width={200} height={40} />
            </Link>
            <h4 className="mb-3">{title}</h4>
            <p className="mb-8 text-secondary-light text-lg">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
