import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import Project from '@/models/mintSettingsModel';
import connectDB from '@/config/database';

export async function POST(req) {
  const { userId, projectData } = await req.json();
  try {
    console.log(userId , projectData)
    await connectDB();
    let project = await Project.findOneAndUpdate(
      { userId },
      {
        ...projectData,
        $setOnInsert: { projectId: uuidv4() }, // Generate projectId only if the project is being inserted
        userId,
      },
      { new: true, runValidators: true, upsert: true } // upsert: true will create if it doesn't exist
    );

    // if (project) {
    //   project = await Project.findOneAndUpdate(
    //     { userId },
    //     { ...projectData },
    //     { new: true, runValidators: true }
    //   );
    // } else {
    //   projectData.projectId = uuidv4(); 
    //   project = new Project({ userId, ...projectData });
    //   await project.save();
    // }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error('Error upserting project:', error);
    return NextResponse.json({ error: 'Error upserting project' }, { status: 500 });
  }
}