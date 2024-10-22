import connectDB from "@/config/database";
import Referral from "@/models/referralModel";
import { redirect } from "next/navigation";

const ReferralCodePage = async ({ params }) => {
    const { code } = params;

    await connectDB();

    // Fetch the referral data based on the code
    const referral = await Referral.findOne({ referralCode: code });

    if (!referral) {
        // If referral is not found, redirect to the home page without query parameters
        redirect("/home");
    }

    // Redirect to the home page with query parameters containing the referral information
    const queryParams = new URLSearchParams({
        referrer: referral.username,
        walletAddress: referral.walletAddress,
    });

    redirect(`/home?${queryParams.toString()}`);

    // This code should never execute because of the redirect.
    return null;
};

export default ReferralCodePage;
