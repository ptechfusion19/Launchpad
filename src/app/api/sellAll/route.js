

import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import { NextResponse } from 'next/server';
import ProjectSettings from '@/models/projectSettingsModel';
import connectDB from '@/config/database';

// async function uploadImage(imagePath) {

// }


// async function uploadMetadata(imageUrl, metadata) {
//     const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
//     const metadataWithImage = {
//         ...metadata,
//         image: imageUrl
//     };
//     try {
//         const metadataResponse = await axios.post(url, metadataWithImage, {
//             headers: {
//                 pinata_api_key: API_KEY,
//                 pinata_secret_api_key: API_SECRET,
//                 Authorization: `Bearer ${JWT}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         console.log('Metadata uploaded successfully:', metadataResponse.data);
//         return metadataResponse.data.IpfsHash;
//     } catch (error) {
//         console.error('Error uploading metadata:', error.response.data);
//         throw error;
//     }
// }
// async function main() {
//     const imagePath = './image.png';
//     const metadata = {
//         name: "Token Name",
//         symbol: "TKN",
//         description: "This is a description for the token",
//         attributes: [
//             {
//                 trait_type: "Twitter URL",
//                 value: "https://twitter.com/yourtoken"
//             },
//             {
//                 trait_type: "Telegram URL",
//                 value: "https://t.me/yourtoken"
//             },
//             {
//                 trait_type: "Discord URL",
//                 value: "https://discord.gg/yourtoken"
//             },
//             {
//                 trait_type: "Website URL",
//                 value: "https://yourtokenwebsite.com"
//             }
//         ]
//     };
//     try {
//         const imageUrl = await uploadImage(imagePath);
//         console.log('Uploaded Image URL:', imageUrl);
//         const metadataHash = await uploadMetadata(imageUrl, metadata);
//         console.log('Metadata IPFS Hash:', metadataHash);
//         console.log(`View the metadata at: https://gateway.pinata.cloud/ipfs/${metadataHash}`);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
// main();







export async function POST(req) {
    const { metadata } = await req.json();
    console.log(metadata, "Iam euygds")
    try {
        await connectDB();

       
        return NextResponse.json({ hello: "hello" }, { status: 200 });
    } catch (error) {
        console.error('Error In Uploading MetaData', error);
        return NextResponse.json({ error: 'Error In Uploading MetaData' }, { status: 500 });
    }
}