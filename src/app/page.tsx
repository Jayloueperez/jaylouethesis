"use client";

import Image from "next/image";

import { PageLayout } from "~/components/layout/page-layout";

export default function HomePage() {
  return (
    <PageLayout>
      <div className="">
        <div className="container flex min-h-[calc(100vh-theme('spacing.48')-4px)] flex-col justify-center">
          <div className="relative flex flex-col gap-16">
            <div className="flex flex-col gap-2">
              <h1 className="text-6xl font-medium italic text-shadow-sm text-shadow-white">
                Wecome to BISU Sports, <br /> Culture & Arts
                <br /> Registration System
              </h1>
              <span>(2024 - 2025)</span>
            </div>

            <div className="flex flex-col items-start gap-2">
              <span className="text-4xl font-medium italic text-shadow-sm text-shadow-white">
                Come and Join us now!!
              </span>
            </div>

            <Image
              className="absolute right-0 bottom-0 z-[-1] aspect-[464/309] w-full lg:w-[40%]"
              src="/images/sports.png"
              alt="sports"
              width={464}
              height={309}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
