import { Poppins } from "next/font/google";
import "./globals.css";
import LaunchPadProvider from "@/context/LauchPadProvider";
import AppWalletProvider from "@/connector";
import { Suspense } from "react";
import Head from "next/head";
const inter = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "500"],
});
import BgImg from "../assets/home/bgImg.png";
export const metadata = {
  title: "Bundle Bee",
  description: "The Best Launchpad ever to exist...",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>

      <body className={inter.className}>
        <AppWalletProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <LaunchPadProvider>{children}</LaunchPadProvider>
          </Suspense>
        </AppWalletProvider>
      </body>
    </html>
  );
}
