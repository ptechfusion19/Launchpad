import { NextResponse } from 'next/server';
import Wallet from '@/models/walletModel';
import connectDB from '@/config/database';
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  try {
    await connectDB();
    const wallet = await Wallet.find({ projectId });
    // if (!wallet) {
    //   return NextResponse.json({ error: `No wallet found for projectId: ${projectId}` }, { status: 404 });
    // }
    return NextResponse.json(wallet, { status: 200 });
  } catch (error) {
    console.error('Error retrieving wallet:', error);
    return NextResponse.json({ error: 'Error retrieving wallet' }, { status: 500 });
  }
}