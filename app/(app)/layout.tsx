import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider"; // Import the AnalyticsProvider
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://authesci.com"),
  title: "Authesci | Dashboard",
  description:
    "Manage your research projects, applications, and profile on Authesci.",
  openGraph: {
    title: "Authesci | Dashboard",
    description:
      "Manage your research projects, applications, and profile on Authesci.",
    url: "https://authesci.com",
    siteName: "Authesci",
    images: [
      {
        url: "https://authesci.com/assets/images/og_image.png",
        width: 1200,
        height: 630,
        alt: "Authesci Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Authesci | Dashboard",
    description:
      "Manage your research projects, applications, and profile on Authesci.",
    images: ["/assets/images/og_image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Skip check if already on the banned page to avoid infinite redirect
  if (!pathname.startsWith("/banned")) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { isBanned: true },
      });

      if (profile?.isBanned) {
        redirect("/banned");
      }
    }
  }

  return (
    <html lang="en">
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

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="icon"
          type="image/png"
          href="/assets/images/favicon.png"
          sizes="16x16"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/remixicon.css" />
        <link rel="stylesheet" href="/assets/css/lib/dataTables.min.css" />
        <link rel="stylesheet" href="/assets/css/lib/editor-katex.min.css" />
        <link
          rel="stylesheet"
          href="/assets/css/lib/editor.atom-one-dark.min.css"
        />
        <link rel="stylesheet" href="/assets/css/lib/editor.quill.snow.css" />
        <link rel="stylesheet" href="/assets/css/lib/flatpickr.min.css" />
        <link rel="stylesheet" href="/assets/css/lib/full-calendar.css" />
        <link
          rel="stylesheet"
          href="/assets/css/lib/jquery-jvectormap-2.0.5.css"
        />
        <link rel="stylesheet" href="/assets/css/lib/magnific-popup.css" />
        <link rel="stylesheet" href="/assets/css/lib/slick.css" />
        <link rel="stylesheet" href="/assets/css/lib/prism.css" />
        <link rel="stylesheet" href="/assets/css/lib/file-upload.css" />
        <link rel="stylesheet" href="/assets/css/lib/audioplayer.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-100 dark:bg-neutral-800 dark:text-white`}
      >
        <AnalyticsProvider>
          {" "}
          {/* Wrap children with AnalyticsProvider */}
          {children}
        </AnalyticsProvider>
        <ToasterProvider />

        {/* Google Tag Manager (noscript) */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-M9VVVVJB" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />

        <Script src="/assets/js/lib/jquery-3.7.1.min.js"></Script>
        <Script src="/assets/js/lib/simple-datatables.min.js"></Script>

        <Script src="/assets/js/lib/jquery-ui.min.js"></Script>
        <Script src="/assets/js/lib/jquery-jvectormap-2.0.5.min.js"></Script>
        <Script src="/assets/js/lib/jquery-jvectormap-world-mill-en.js"></Script>
        <Script src="/assets/js/lib/magnifc-popup.min.js"></Script>
        <Script src="/assets/js/lib/slick.min.js"></Script>
        <Script src="/assets/js/lib/prism.js"></Script>
        <Script src="/assets/js/lib/file-upload.js"></Script>
        <Script src="/assets/js/lib/audioplayer.js"></Script>
        <Script src="/assets/js/flowbite.min.js"></Script>
        <Script src="/assets/js/app.js"></Script>
      </body>
    </html>
  );
}
