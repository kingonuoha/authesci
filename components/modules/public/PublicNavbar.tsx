"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Profile } from "@prisma/client";
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";

interface PublicNavbarProps {
  user?: User | null;
  profile?: Profile | null;
}

export default function PublicNavbar({ user, profile }: PublicNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";
  const avatarUrl =
    profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff`;

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinkClass = `text-decoration-none fw-bold fs-15 ${isScrolled ? "text-dark" : "text-white"}`;
  const dashboardLink = `/${profile?.role?.toLowerCase() || "scientist"}/dashboard`;

  return (
    <>
      <header
        className={`header-nav nav-homepage-style stricky main-menu border-0 ${isScrolled ? "stricky-fixed" : ""}`}
      >
        <nav className="posr">
          <div className="container posr">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto px-0 px-xl-3">
                <div className="d-flex align-items-center justify-content-between">
                  {/* Logos */}
                  <div className="logos">
                    <Link className="header-logo logo1" href="/">
                      <Image
                        src="/assets/images/logo-light.png"
                        alt="Authesci"
                        width={120}
                        height={34}
                        className="w-auto h-auto"
                        priority
                      />
                    </Link>
                    <Link className="header-logo logo2" href="/">
                      <Image
                        src="/assets/images/logo.png"
                        alt="Authesci"
                        width={120}
                        height={34}
                        className="w-auto h-auto"
                        priority
                      />
                    </Link>
                  </div>

                  {/* Desktop Menu - Manually styled to ensure visibility and alignment */}
                  <div className="d-none d-lg-block ms-5">
                    <ul className="d-flex align-items-center gap-4 list-unstyled mb-0 ps-0">
                      <li>
                        <Link href="/" className={navLinkClass}>
                          Home
                        </Link>
                      </li>
                      <li>
                        <Link href="/jobs" className={navLinkClass}>
                          Browse Jobs
                        </Link>
                      </li>
                      <li>
                        <Link href="/about" className={navLinkClass}>
                          About
                        </Link>
                      </li>
                      <li>
                        <Link href="/contact" className={navLinkClass}>
                          Contact
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="col-auto pe-0 pe-xl-3">
                <div className="d-flex align-items-center">
                  {user ? (
                    <div className="dropdown ms-3">
                      <a
                        className="d-flex align-items-center text-decoration-none dropdown-toggle user-menu-toggle"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="rounded-circle object-fit-cover"
                          width="40"
                          height="40"
                        />
                        <span
                          className={`fw-bold ms-2 d-none d-sm-inline-block ${isScrolled ? "text-dark" : "text-white"}`}
                        >
                          {displayName}
                        </span>
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end border-0 shadow-lg mt-3 rounded-4 p-2">
                        <li>
                          <Link
                            className="dropdown-item rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                            href={dashboardLink}
                          >
                            <LayoutDashboard size={18} />
                            Dashboard
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                        <li>
                          <button
                            onClick={handleSignOut}
                            className="dropdown-item rounded-3 px-3 py-2 d-flex align-items-center gap-2 text-danger"
                          >
                            <LogOut size={18} />
                            Log Out
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <>
                      <Link
                        className={`login-info mx15-xl mx30 ${isScrolled ? "text-dark" : "text-white"}`}
                        href="/login"
                      >
                        Sign in
                      </Link>
                      <Link
                        className="ud-btn btn-white add-joining bdrs50 text-thm2"
                        href="/register"
                      >
                        Join
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Nav Top Bar (Visible on Mobile) */}
      <div id="page" className="mobilie_header_nav stylehome1">
        <div className="mobile-menu">
          <div className="header bdrb1">
            <div className="menu_and_widgets">
              <div className="mobile_menu_bar d-flex justify-content-between align-items-center">
                <Link className="mobile_logo" href="/">
                  <Image
                    src="/assets/images/logo.png"
                    alt="Authesci"
                    width={120}
                    height={32}
                    className="w-auto h-8"
                  />
                </Link>
                <div className="right-side text-end">
                  {!user && (
                    <Link className="" href="/login">
                      join
                    </Link>
                  )}
                  <a
                    className="menubar ml30"
                    role="button"
                    onClick={toggleMobileMenu}
                  >
                    <Image
                      src="/front-assets/images/mobile-dark-nav-icon.svg"
                      alt="Menu"
                      width={24}
                      height={24}
                      className="img-fluid"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Side Menu/Drawer */}
      <div
        className={`offcanvas offcanvas-start ${mobileMenuOpen ? "show" : ""}`}
        tabIndex={-1}
        id="mobileMenu"
        style={{
          visibility: mobileMenuOpen ? "visible" : "hidden",
          width: "100%",
          maxWidth: "300px",
          zIndex: 99999,
          transition: "transform 0.3s ease-in-out",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          backgroundColor: "#ffffff",
          boxShadow: mobileMenuOpen ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="offcanvas-header border-bottom">
          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Image
              src="/assets/images/logo.png"
              alt="Authesci"
              width={140}
              height={40}
              className="w-auto"
            />
          </Link>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={() => setMobileMenuOpen(false)}
          ></button>
        </div>
        <div className="offcanvas-body p-0">
          <div className="mm-menu">
            <ul className="list-unstyled m-0">
              <li className="border-bottom py-3">
                <Link
                  href="/"
                  className="text-dark text-decoration-none d-block px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li className="border-bottom py-3">
                <Link
                  href="/jobs"
                  className="text-dark text-decoration-none d-block px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse Jobs
                </Link>
              </li>
              <li className="border-bottom py-3">
                <Link
                  href="/about"
                  className="text-dark text-decoration-none d-block px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li className="border-bottom py-3">
                <Link
                  href="/contact"
                  className="text-dark text-decoration-none d-block px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              {user ? (
                <>
                  <li className="border-bottom py-3">
                    <Link
                      href={dashboardLink}
                      className="text-dark text-decoration-none d-block px-3 fw-bold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li className="border-bottom py-3">
                    <a
                      href="#"
                      className="text-danger text-decoration-none d-block px-3"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      Log Out
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li className="border-bottom py-3">
                    <Link
                      href="/login"
                      className="text-dark text-decoration-none d-block px-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li className="border-bottom py-3">
                    <Link
                      href="/register"
                      className="text-dark text-decoration-none d-block px-3"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Join Now
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
