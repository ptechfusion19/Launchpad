import { NextResponse } from 'next/server';
import { launch, testLaunch } from '../../launch';

export async function POST(req) {
    const { signedTransactions, userId, projectId } = await req.json();
    try {
        // setTimeout(() => {
        //     console.log("Time out")
        // }, 180000);
        // console.log("After Sleeping");
        // console.log("Server", signedTransactions)
        await launch(signedTransactions, userId, projectId);
        // await testLaunch(signedTransactions, userId, projectId);
        return NextResponse.json(true, { status: 201 });
    } catch (error) {
        console.error('Error adding user:', error);
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}