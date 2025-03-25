import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { Montserrat, Open_Sans } from "next/font/google";

import { Providers } from "~/components/providers";
import { Wrapper } from "~/components/wrapper";
import { cn } from "~/lib/utils";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 200 300 400 500 600 700 800 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
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

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
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
        <Providers>
          <Wrapper>{children}</Wrapper>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
