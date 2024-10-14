import { NextResponse } from 'next/server';
import ProjectSettings from '@/models/projectSettingsModel';
import connectDB from '@/config/database';

export async function POST(req) {
  const { projectId, settingsData } = await req.json();
  try {
    await connectDB();
    let projectSettings = await ProjectSettings.findOneAndUpdate(
      { projectId },
      { ...settingsData, projectId }, // Ensure projectId is set in both update and insert cases
      { new: true, runValidators: true, upsert: true } // upsert: true will create a new document if it doesn't exist
    );


    return NextResponse.json(projectSettings, { status: 200 });
  } catch (error) {
    console.error('Error upserting project settings:', error);
    return NextResponse.json({ error: 'Error upserting project settings' }, { status: 500 });
  }
}