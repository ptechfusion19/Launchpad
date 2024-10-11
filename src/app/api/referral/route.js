import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import connectDB from "@/config/database";
import Referral from "@/models/referralModel";
import BASE from "@/hooks/useLaunch";

export async function POST(req) {
    try {
        const { username, walletAddress } = await req.json();

        if (!username || !walletAddress) {
            return NextResponse.json({ message: "Username and wallet address are required." }, { status: 400 });
        }

        await connectDB();

        // Generate a unique referral code using nanoid
        const referralCode = nanoid(10);
        const referralLink = `https://launchpad-wine-three.vercel.app/referral/${referralCode}`;

        // Save the referral data in the database
        const newReferral = new Referral({
            username,
            walletAddress,
            referralCode,
            referralLink,
        });
        await newReferral.save();

        return NextResponse.json({ referralLink }, { status: 200 });
    } catch (error) {
        console.error('Error generating referral link:', error.message);
        return NextResponse.json({ message: "Failed to generate referral link." }, { status: 500 });
    }
}
