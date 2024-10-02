import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import connectDB from '@/config/database';

export async function GET(req) {
    //console.log("GET", req)
    await connectDB();
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get('walletAddress');
    //console.log(walletAddress)
    try {
        const user= await User.findOne({ walletAddress });
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error finding user:', error);
        return NextResponse.json({ error: 'Error finding user' }, { status: 500 });
    }
}