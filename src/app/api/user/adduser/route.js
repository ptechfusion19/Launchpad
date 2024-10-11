import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import connectDB from '@/config/database';

export async function POST(req) {
    await connectDB();
    const { walletAddress, referralWalletAddress } = await req.json();

    try {
        // Find the user or insert a new one if it doesn't exist, including referralWalletAddress if present
        const savedUser = await User.findOneAndUpdate(
            { walletAddress },
            { walletAddress, referralWalletAddress },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        // Return the newly created or updated user
        return NextResponse.json(savedUser, { status: 201 });
    } catch (error) {
        console.error('Error adding user:', error);
        return NextResponse.json({ error: 'Error adding user' }, { status: 500 });
    }
}
