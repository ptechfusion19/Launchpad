"use client";
import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import logo from "/public/logo.png";
import usePhantom from "../../hooks/usePhantom";
import ConnectModalComp from "./ConnectModal";
import LaunchPadContext from "../../context/LaunchPadContext";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

import Image from "next/image";

function Header() {
  const { publicKey, connect } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { connectToPhantom, disconnectFromWallet, signMessage } = usePhantom();
  const { solanaKey, connected } = useContext(LaunchPadContext);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    // debugger
    // Call connectToPhantom when the wallet is connected
    if (publicKey) {
      // debugger
      connectToPhantom();
    }
  }, [publicKey]); // This will trigger whenever publicKey changes
  useEffect(() => {
    // Only sign message if solanaKey is present and connected is true
    if (solanaKey && connected) {
      //
      // if (localStorage.getItem("connectedToSolflare")) {
      //     SignMessageWithSolflare();
      // } else {
      signMessage();
      // }
    }
  }, [solanaKey, connected]);
  return (
    <>
      <nav className=" border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800  bg-gradient-to-r from-[#F7AA00] to-[#F7AA00] w-full">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Link href="/" className="flex items-center">
            <span className="flex flex-row items-center justify-center text-xl font-semibold whitespace-nowrap text-white text-center">
              <Image
                className="logoImage"
                src={logo}
                alt="Logo"
                height={60}
                width={60}
              />

              <span className="ml-2  pt-2">Bundle Bee</span>
            </span>
          </Link>
          <div className="flex items-center lg:order-2">
            {/* <ConnectModalComp
              connectToPhantom={connectToPhantom}
              // connectToSolflare={connectToSolflare}
              disconnectFromWallet={disconnectFromWallet}
            /> */}
            <WalletMultiButton
              style={{
                background: "linear-gradient(to right, #565656, #000000)",
                color: "white",
                borderRadius: "1.5rem",
                width: "100%",
                fontSize: "0.875rem", // This is equivalent to text-sm
              }}
            />

            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-white-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-white-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="mobile-menu-2"
              aria-expanded={isMenuOpen}
            >
              {/* <span className="sr-only">Open main menu</span> */}
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} w-6 h-6`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} w-6 h-6`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          <div
            className={`${
              isMenuOpen ? "block" : "hidden"
            } justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li className="py-2">
                <a
                  href="/home"
                  className="block py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li className="py-2">
                <Link
                  href="/"
                  className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-white-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Chart
                </Link>
              </li>
              <li className="py-2">
                <a
                  href="https://t.me/bundlebeesol"
                  target="_blank"
                  className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-white-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Telegram
                </a>
              </li>
              <li className="py-2">
                <a
                  href="https://x.com/BundleBee_SOL"
                  target="_blank"
                  className="block py-2 pr-4 pl-3 text-white border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 dark:text-white-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Twitter
                </a>
              </li>
              <li className="py-2">
                <Link href="mintpage" className="text-white">
                  Create Token
                </Link>
              </li>
              <li className="py-2">
                <Link href="launchpage" className="text-white">
                  Launch Token
                </Link>
              </li>
              {/* <li className="py-2">
                <Link href="/referral" className="text-white">
                  Referral
                </Link>
              </li> */}
              <li className="py-2">
                <a
                  href="/bee"
                  className="text-white bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 px-4 py-2 rounded-lg font-medium shadow-lg transition-all"
                >
                  Referral
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
