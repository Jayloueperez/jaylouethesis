import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { Montserrat, Open_Sans } from "next/font/google";

import { Wrapper } from "~/components/wrapper";
import { cn } from "~/lib/utils";
import { MainProvider } from "~/providers/MainProvider";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 200 300 400 500 600 700 800 900",
});
const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 200 300 400 500 600 700 800 900",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--open-sans",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Sports Registration",
  description: "",
  icons: "/logo.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "antialiased",
          geistSans.variable,
          geistMono.variable,
          openSans.variable,
          montserrat.variable,
        )}
      >
        <MainProvider>
          <Wrapper>{children}</Wrapper>
        </MainProvider>
      </body>
    </html>
  );
}
