import { NextResponse } from 'next/server';
import Project from '@/models/mintSettingsModel';
import connectDB from '@/config/database';

export async function POST(req) {
  const { userId } = await req.json();

  try {
    await connectDB();
    const project = await Project.findOne({ userId });

    if (!project) {
      return NextResponse.json({ error: `No project found for userId: ${userId}` }, { status: 404 });
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error retrieving project:', error);
    return NextResponse.json({ error: 'Error retrieving project' }, { status: 500 });
  }
}