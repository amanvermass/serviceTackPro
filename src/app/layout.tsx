import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const metadata: Metadata = {
  title: "Domain Manager Pro",
  description: "Manage your domains securely",
};

import AuthWrapper from "../components/AuthWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden max-w-[100vw]">
        <NextTopLoader 
          color="#2563EB"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #2563EB,0 0 5px #2563EB"
        />
        <Toaster />
        <AuthWrapper>{children}</AuthWrapper>
      </body>
    </html>
  );
}
