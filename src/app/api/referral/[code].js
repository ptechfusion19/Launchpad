import connectDB from "@/config/database";
import Referral from "@/models/referralModel";

export async function getServerSideProps({ params }) {
    const { code } = params;
    await connectDB();

    // Find the referral information based on the referralCode
    const referral = await Referral.findOne({ referralCode: code });

    if (!referral) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            },
        };
    }

    // Pass referral information to the home page using query parameters
    return {
        redirect: {
            destination: `/?referralCode=${referral.referralCode}&referrer=${referral.username}&walletAddress=${referral.walletAddress}`,
            permanent: false,
        },
    };
}

export default function ReferralRedirect() {
    // This component will never actually render because users are redirected.
    return null;
}
