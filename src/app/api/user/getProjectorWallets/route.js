import { NextResponse } from 'next/server';
import LaunchSettings from '../../../../models/launchSettingsModel';
import Wallet from '../../../../models/walletModel';
import connectDB from '../../../../config/database';

export async function POST(req) {
    await connectDB();
    const { userId } = await req.json();
    try {
        const launch = await LaunchSettings.findOne({
            userId: userId
        });
        if (!launch) {
            return NextResponse.json({ error: 'Launch settings not found' }, { status: 404 });
        }
        const wallet = await Wallet.find({
            projectId: launch.projectId
        });
        return NextResponse.json({ launch, wallet }, { status: 200 });
    } catch (error) {
        console.error('Error getting user:', error);
        return NextResponse.json({ error: 'Error getting user Data' }, { status: 500 });
    }
}