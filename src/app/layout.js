import { Inter } from "next/font/google";
import "./globals.css";
import LaunchPadProvider from "@/context/LauchPadProvider";
import AppWalletProvider from "@/connector";
const inter = Inter({ subsets: ["latin"] });
import BgImg from "../assets/home/bgImg.png"
export const metadata = {
  title: "Bundle Bee",
  description: "The Best Launchpad ever to exist...",


};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" href="./logo.png" /> 
      </head>

      <body className={inter.className}>
        <AppWalletProvider>
          <LaunchPadProvider>
            {children}
          </LaunchPadProvider>
        </AppWalletProvider>

      </body>
    </html>
  );
}
