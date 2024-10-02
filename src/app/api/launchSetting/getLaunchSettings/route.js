import { NextResponse } from 'next/server';
import LaunchSettings from '@/models/launchSettingsModel';
import connectDB from '@/config/database';
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    try {
        await connectDB();
        const settings = await LaunchSettings.findOne({ projectId });

        if (!settings) {
            return NextResponse.json({ error: 'Launch settings not found' }, { status: 404 });
        }

        return NextResponse.json(settings, { status: 200 });
    } catch (error) {
        console.error('Error fetching launch settings:', error);
        return NextResponse.json({ error: 'Error fetching launch settings' }, { status: 500 });
    }
}