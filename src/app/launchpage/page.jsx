"use client";

import React from "react";
import CardComp from "@/components/CardComp";
import LaunchFormComp from "./LaunchForm";
import Header from "@/components/Header";
import { Toaster, toast } from "react-hot-toast";
// import LaunchFormComp from './LaunchForm'

const LaunchPage = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Header />
      <div className="py-20 h-fit flex items-center">
        <CardComp>
          <div className="px-2">
            <h3 className="text-center pb-2 mb-4 text-2xl">
            {/* Welcome to Bundle Bee Token Launch */}
            Welcome to Bundle Bee Token Dex Launch
            </h3>
            {/* <h4 className="py-2">The FusionX Smart Launch Allows You To:</h4> */}
            <h4 className="py-2"> The Bundle Bee allows you to :</h4>
            <div className="flex items-center mb-2 w-2/3 mx-auto">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                {/* Launch your token's liquidity pool on Raydium. */}
                Launch your token on Raydium with lowest fees.
              </p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                {/* Snipe your token first before anyone else can get a bite from 24
                unique wallets. */}
                 Allows you to snipe and generate multiple wallets, so do not have to worry about trying to get in early on your own token. The sniping is done with JITO.
              </p>
            </div>
            <div className="flex items-center mb-2">
              <span className="bg-transparent border-custom_bg border-2 text-white font-bold px-2 h-6 flex items-baseline justify-center rounded leading-none">
                -
              </span>

              <p className="pl-4 text-lg font-medium">
                {/* Distribute the sniped tokens across up to 72 wallets. */}
                After Launch you can choose to put all Bundled to 1 Wallet and Automatically sell, with just 1 click. Functions like Burn LP, Remove LP are available.

              </p>
            </div>

            <h4 className="py-7 text-lg font-medium">
              {/* In addition to the network fees, a service fee of 3 SOL will be
              charged from your wallet. */}
             In addition to service fee, our platform charges you 0.5 For adding LP and Sniping your own launch. Remove LP doesn't cost anything, just service fee and bundling back all wallets to 1 wallet and selling cost as well 0.5 SOL.
            </h4>
          </div>

          <LaunchFormComp />
        </CardComp>
      </div>
    </>
  );
};

export default LaunchPage;
