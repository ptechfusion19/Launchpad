"use client";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Header from "@/components/Header";
import NewCardComp from "@/components/NewCardComp";

const ReferralSignUpPage = () => {
    const [username, setUsername] = useState("");
    const [walletAddress, setWalletAddress] = useState("");
    const [referralLink, setReferralLink] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !walletAddress) {
            toast.error("Please enter both username and wallet address.");
            return;
        }

        try {
            const response = await fetch("/api/referral", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, walletAddress }),
            });

            const data = await response.json();

            if (response.ok) {
                setReferralLink(data.referralLink);
                toast.success("Referral link generated successfully!");
            } else {
                toast.error(data.message || "An error occurred.");
            }
        } catch (error) {
            toast.error("An error occurred while generating the link.");
        }
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <Header />
            <div className="py-20 h-fit flex items-center">
                <NewCardComp>
                    <div className="px-2 text-center">
                        <h3 className="text-center pb-2 mb-4 text-2xl">
                            Sign Up for the Bundle Bee Referral Program
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full p-3 rounded border border-gray-300"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Solana Wallet Address"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="w-full p-3 rounded border border-gray-300"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full bg-yellow-600 text-white p-3 rounded hover:bg-yellow-500 transition duration-300"
                            >
                                Generate Referral Link
                            </button>
                        </form>

                        {referralLink && (
                            <div className="mt-4">
                                <h4 className="text-lg">Your Referral Link:</h4>
                                <p className="text-blue-600">
                                    <a href={referralLink} target="_blank" rel="noopener noreferrer">
                                        {referralLink}
                                    </a>
                                </p>
                            </div>
                        )}

                        <h4 className="py-7 text-lg font-medium">
                            Share your link to invite friends to Bundle Bee!
                        </h4>
                    </div>
                </NewCardComp>
            </div>
        </>
    );
};

export default ReferralSignUpPage;
