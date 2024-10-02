import { NextResponse } from 'next/server';
import LaunchSettings from '../../../../models/launchSettingsModel';
import connectDB from '../../../../config/database';

export async function POST(req) {
  await connectDB();
  const { projectId, settingsData, userId } = await req.json();
  try {
    let settings = await LaunchSettings.findOneAndUpdate(
      { projectId },
      { ...settingsData, projectId, userId }, // Ensure projectId and userId are included in both cases
      { new: true, runValidators: true, upsert: true } // upsert: true will create a new document if it doesn't exist
    );

    // if (settings) {
    //   settings = await LaunchSettings.findOneAndUpdate(
    //     { projectId },
    //     { ...settingsData },
    //     { new: true, runValidators: true }
    //   );
    // } else {
    //   settingsData.projectId = projectId;
    //   settingsData.userId = userId;
    //   settings = new LaunchSettings(settingsData);
    //   await settings.save();
    // }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error upserting launch settings:', error);
    return NextResponse.json({ error: 'Error upserting launch settings' }, { status: 500 });
  }
}