"use client";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import NewCardComp from "@/components/NewCardComp";
import Image from "next/image"; // Ensure you import Image
import logo from "../../../public/logo.png";

const LaunchPage = () => {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <div className="py-20 h-4/5  flex items-center justify-center ">
                <NewCardComp className="">
                    {/* Left side for text content */}
                    <div className="w-3/5 p-4 text-white">
                        <h3 className="text-white text-center pb-2 mb-4 text-xl">Welcome to Bundle Bee – Your Solana Meme Launchpad</h3>
                        <h4 className="text-white font-medium mb-4">
                            Tired of the same old launchpad routines? Say hello to Bundle Bee, where innovation meets opportunity.
                            <br />
                            We're not just another launchpad; we're your strategic partner in the bustling world of Solana Meme projects.
                        </h4>
                        <br/>
                        <h3 className="pb-2 mb-4 text-xl text-white">Why Bundle Bee?</h3>
                        <ul className="list-disc list-inside text-left text-base font-medium space-y-2">
                            <li><strong>Strategic Launches:</strong> We bundle launches to secure better positioning for developers, steering clear of snipers.</li>
                            <li><strong>Cost-Effective:</strong> We pride ourselves on being the most cost-effective launchpad on the market.</li>
                            <li><strong>Beyond the Pump:</strong> Bundle Bee is committed to fostering sustainable projects, not transient hype.</li>
                            <li><strong>Support for Creators:</strong> We're here to support creators in making each launch count.</li>
                        </ul>
                        <br/>
                        <h3 className="pb-2 mb-4 text-xl text-white">What We Offer</h3>
                        <ul className="list-disc list-inside text-left text-base font-medium space-y-2">
                            <li><strong>For Developers:</strong> A robust platform to launch with confidence.</li>
                            <li><strong>For Users:</strong> Tools tailored for Solana users.</li>
                            <li><strong>Revenue Reinvestment:</strong> Ensuring growth for both Bundle Bee and its community.</li>
                        </ul>
                        <br/>
                        <h3 className="pb-2 mb-4 text-xl text-white">Upcoming Projects:</h3>
                        <ul className="list-disc list-inside text-left">
                            <li><strong>BundleBee Telegram APP:</strong> Launching soon after our Solana debut.</li>
                        </ul>
                        <br/>
                        <h3 className="text-white pb-2 mb-4 text-xl">Join the Hive:</h3>
                        <ul className="list-disc list-inside text-left">
                            <li>Whether you're a developer looking to launch your next big thing or a user eager to explore new tools, Bundle Bee is where you belong. Let's build, launch, and succeed together on Solana!
                            </li>
                        </ul>

                        <h4 className="py-7 text-lg font-medium text-center text-white">Get Started Today and Be Part of the Revolution!</h4>
                    </div>

                    {/* Right side for the logo */}
                    <div className="w-2/5 flex items-start justify-center">
                        <Image className="mt-5" src={logo} alt="Logo" height={300} width={300} />
                    </div>
                </NewCardComp>
            </div>
        </>
    );
};

export default LaunchPage;
