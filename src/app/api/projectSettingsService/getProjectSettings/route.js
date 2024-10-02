import { NextResponse } from 'next/server';
import ProjectSettings from '@/models/projectSettingsModel';
import connectDB from '@/config/database';
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  try {
    await connectDB();
    const settings = await ProjectSettings.findOne({ projectId });

    if (!settings) {
      return NextResponse.json({ error: 'Project settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching project settings:', error);
    return NextResponse.json({ error: 'Error fetching project settings' }, { status: 500 });
  }
}