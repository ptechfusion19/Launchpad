"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import NewCardComp from "@/components/NewCardComp";

const HomePage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referrer = searchParams.get("referrer");
  const walletAddress = searchParams.get("walletAddress");
  // const walletAddress = searchParams.get("walletAddress");

  const [referralInfo, setReferralInfo] = useState(null);

  useEffect(() => {
    if (referrer && walletAddress) {
      setReferralInfo({ referrer, walletAddress });
      localStorage.setItem("referralWalletAddress", walletAddress);
      // Optionally, store this info in local storage or context if needed for later use
    }
  }, [referrer, walletAddress]);

  const handleSignUpClick = () => {
    router.push("/bee");
  };

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Toaster position="top-center" reverseOrder={false} />
        <Header />
        <div className="py-20 h-fit flex items-center">
          <NewCardComp>
            <div className="px-2 text-center">
              <h3 className="text-center pb-2 mb-4 text-2xl">
                Welcome to Bundle Bee – Your Solana Meme Launchpad
              </h3>
              {referralInfo && (
                <div className="bg-white border-l-4 border-yellow-500 p-6 rounded-lg mb-6 shadow-lg">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                      Referral Information
                    </h2>
                    <p className="text-gray-600">
                      <span className="font-bold text-yellow-600">
                        Referred by:
                      </span>{" "}
                      {referralInfo.referrer}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-bold text-yellow-600">
                        Wallet Address:
                      </span>{" "}
                      {referralInfo.walletAddress}
                    </p>
                  </div>
                </div>
              )}
              <h4 className="font-medium">
                Tired of the same old launchpad routines? Say hello to Bundle
                Bee, where innovation meets opportunity.
                <br />
                We're not just another launchpad; we're your strategic partner
                in the bustling world of Solana Meme projects.
              </h4>
              <br />
              <h3 className="text-center pb-2 mb-4 text-2xl">
                Why Bundle Bee?
              </h3>
              <ul className="list-item list-inside text-left mx-auto w-2/3 text-lg font-medium">
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">
                    Strategic Launches
                  </strong>
                  : We bundle launches to secure better positioning for
                  developers, steering clear of snipers. It's about strategic
                  placement, not just speed.
                </li>
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">Cost-Effective</strong>:
                  We pride ourselves on being the most cost-effective launchpad
                  on the market. With JITO, we empower teams to keep more of
                  what they earn.
                </li>
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">Beyond the Pump</strong>:
                  Tired of the 'pump and dump' culture? We are too. Bundle Bee
                  is committed to fostering sustainable projects, not transient
                  hype.
                </li>
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">
                    Support for Creators
                  </strong>
                  : Launching tokens isn't cheap, and not every project hits the
                  jackpot. We're here to support creators in making each launch
                  count.
                </li>
              </ul>
              <br />
              <h3 className="text-center pb-2 mb-4 text-2xl">What We Offer</h3>
              <ul className="list-disc list-inside text-left mx-auto w-2/3 text-lg font-medium space-y-2">
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">For Developers:</strong> A
                  robust platform to launch with confidence. We provide tools
                  and support to ensure your project stands out and succeeds.
                </li>
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">For Users:</strong> More
                  than just a launchpad, we're rolling out tools tailored for
                  Solana users, enhancing your interaction with the ecosystem.
                </li>
                <li className="bg-gray-800 text-white p-4 rounded-lg shadow-md mb-2 hover:bg-gray-700 transition duration-300">
                  <strong className="text-yellow-600">
                    Revenue Reinvestment:
                  </strong>{" "}
                  We use platform revenue for buybacks and marketing, ensuring
                  growth for both Bundle Bee and its community.
                </li>
              </ul>

              <br />
              <h3 className="text-center pb-2 mb-4 text-2xl">
                Upcoming Projects:
              </h3>
              <ul>
                <li>
                  <strong>BundleBee Telegram APP</strong>: Launching soon after
                  our Solana debut. Stay tuned for a new way to engage with your
                  favorite projects right from your Telegram.
                </li>
              </ul>
              <br />
              <h3 className="text-center pb-2 mb-4 text-2xl">Join the Hive:</h3>
              <ul>
                <li>
                  Whether you're a developer looking to launch your next big
                  thing or a user eager to explore new tools, Bundle Bee is
                  where you belong. Let's build, launch, and succeed together on
                  Solana!
                </li>
              </ul>

              <h4 className="py-7 text-lg font-medium">
                Get Started Today and Be Part of the Revolution!
              </h4>

              {/* Referral Sign-Up Button */}
              <button
                onClick={handleSignUpClick}
                className="mt-6 bg-yellow-600 text-white p-3 rounded-lg hover:bg-yellow-500 transition duration-300"
              >
                Sign Up for the Referral Program
              </button>
            </div>
          </NewCardComp>
        </div>
      </Suspense>
    </>
  );
};

export default HomePage;
