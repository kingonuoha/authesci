import type { Metadata } from "next";
import Script from "next/script";
import PublicNavbar from "@/components/modules/public/PublicNavbar";
import PublicFooter from "@/components/modules/public/PublicFooter";
import CookieConsent from "@/components/modules/public/CookieConsent";
import GoogleAnalytics from "@/components/modules/public/GoogleAnalytics";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  metadataBase: new URL("https://authesci.com"),
  title: "Authesci - Africa's Premier Research Hub",
  description: "Connect, Collaborate, and Innovate with African Scientists.",
  openGraph: {
    title: "Authesci - Africa's Premier Research Hub",
    description: "Connect, Collaborate, and Innovate with African Scientists.",
    url: "https://authesci.com",
    siteName: "Authesci",
    images: [
      {
        url: "https://authesci.com/assets/images/og_image.png",
        width: 1200,
        height: 630,
        alt: "Authesci - Africa's Premier Research Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Authesci - Africa's Premier Research Hub",
    description: "Connect, Collaborate, and Innovate with African Scientists.",
    images: ["/assets/images/og_image.png"],
  },
};

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile = null;

  if (user) {
    profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });
  }

  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-M9VVVVJB');`,
          }}
        />

        {/* Default to light mode (no device theme preference) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (localStorage.getItem('color-theme') === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}`,
          }}
        />

        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* CSS files from template */}
        <link rel="stylesheet" href="/front-assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/front-assets/css/jquery-ui.min.css" />
        <link
          rel="stylesheet"
          href="/front-assets/css/ace-responsive-menu.css"
        />
        <link rel="stylesheet" href="/front-assets/css/menu.css" />
        <link rel="stylesheet" href="/front-assets/css/fontawesome.css" />
        <link rel="stylesheet" href="/front-assets/css/flaticon.css" />
        <link
          rel="stylesheet"
          href="/front-assets/css/bootstrap-select.min.css"
        />
        <link rel="stylesheet" href="/front-assets/css/animate.css" />
        <link rel="stylesheet" href="/front-assets/css/slider.css" />
        <link rel="stylesheet" href="/front-assets/css/style.css" />
        <link rel="stylesheet" href="/front-assets/css/ud-custom-spacing.css" />
        <link rel="stylesheet" href="/front-assets/css/responsive.css" />

        <link
          rel="icon"
          type="image/png"
          href="/assets/images/favicon.png"
          sizes="16x16"
        />
      </head>
      <body className="body-bg">
        <AnalyticsProvider>
          <div className="wrapper ovh">
            <PublicNavbar user={user} profile={profile} />
            <div className="body_content">{children}</div>
            <PublicFooter />
            <CookieConsent />
            <GoogleAnalytics />
          </div>
        </AnalyticsProvider>

        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M9VVVVJB" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        {/* Scripts */}
        <Script
          src="/front-assets/js/jquery-3.6.4.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/front-assets/js/jquery-migrate-3.0.0.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/front-assets/js/popper.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/front-assets/js/bootstrap.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/front-assets/js/bootstrap-select.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="/front-assets/js/jquery.mmenu.all.js"
          strategy="afterInteractive"
        />
        <Script
          src="/front-assets/js/ace-responsive-menu.js"
          strategy="afterInteractive"
        />
        <Script
          src="/front-assets/js/jquery-scrolltofixed-min.js"
          strategy="afterInteractive"
        />
        <Script src="/front-assets/js/wow.min.js" strategy="afterInteractive" />
        <Script src="/front-assets/js/owl.js" strategy="afterInteractive" />
        <Script
          src="/front-assets/js/jquery.counterup.js"
          strategy="afterInteractive"
        />
        <Script src="/front-assets/js/script.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
