import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import connectDB from '@/config/database';

export async function GET(req) {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get('userId');
    try {
        const user = await User.findOne({ userId });
        return NextResponse.json(user, { status: 200 });
    } catch (error) {
        console.error('Error finding user by ID:', error);
        return NextResponse.json({ error: 'Error finding user by ID' }, { status: 500 });
    }
}