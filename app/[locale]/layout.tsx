// app/[locale]/layout.tsx → but because locale is removed, you can move layout to app/layout.tsx
// Actually, with localePrefix "never", you should move layout out of the [locale] folder.

// New structure:
// app/layout.tsx  (no locale param)
// app/page.tsx, app/about/page.tsx, etc. (normal pages, no locale in path)

import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import "../globals.css";
import Header from "../components/Navigation/Header";
import Footer from "../components/Navigation/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
});

export const metadata: Metadata = {
  title: "Daleeli",
  description: "Official syndicate portal for the Lebanese Bar Association.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale(); // 👈 from next-intl/server
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${notoArabic.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f9fb] font-sans">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
