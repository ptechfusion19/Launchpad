import { NextResponse } from 'next/server';
import connectDB from '@/config/database';
import { NextResponse } from 'next/server';
import LaunchSettings from '../../../models/launchSettingsModel';
// import Wallet from '../../../models/walletModel';
import User from '../../../models/userModel';
import connectDB from '../../../config/database';
// const solanaWeb3 = require('@solana/web3.js');
import { Connection, TransactionMessage, VersionedTransaction, TransactionInstruction } from "@solana/web3.js";
import { PublicKey, Keypair } from '@solana/web3.js';


// const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5");
const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e2090957-8cc3-44ab-bb60-82985d36cad5', 'processed');









export async function POST(req) {
    const {  projectId, userId  } = await req.json();
    
    try {
        await connectDB();
        const project = await LaunchSettings.findOne({
            projectId: projectId
        });
        const user = await User.findById(project.userId);
        let mint = project.mint;
        let lookupTableAddress = new PublicKey(project.lookupTableAddress);
        const owner = new PublicKey(user.walletAddress);
       
        return NextResponse.json({ hello: "hello" }, { status: 200 });
    } catch (error) {
        console.error('Error In Uploading MetaData', error);
        return NextResponse.json({ error: 'Error In Uploading MetaData' }, { status: 500 });
    }
}