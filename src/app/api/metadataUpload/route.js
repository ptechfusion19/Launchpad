
async function uploadMetadata(imageUrl, metadata) {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const metadataWithImage = {
        ...metadata,
        image: imageUrl
    };
    try {
        const metadataResponse = await axios.post(url, metadataWithImage, {
            headers: {
                pinata_api_key: API_KEY,
                pinata_secret_api_key: API_SECRET,
                Authorization: `Bearer ${JWT}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Metadata uploaded successfully:', metadataResponse.data);
        return metadataResponse.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading metadata:', error.response.data);
        throw error;
    }
}
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







import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import { NextResponse } from 'next/server';
import ProjectSettings from '@/models/projectSettingsModel';
import connectDB from '@/config/database';
const API_KEY = 'b0d3c83fda71caff078b';
const API_SECRET = 'b2893d5c88b25af6ef4e58fadb4be3afd89af090dce647247f818699819d00ae';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YmUyNTI4Ni1iMDQ0LTRjYzYtYWE3Ni1hZDgzZGY5YTVkNDgiLCJlbWFpbCI6ImVodGFzaGFtLnNweXJlc3luY0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjBkM2M4M2ZkYTcxY2FmZjA3OGIiLCJzY29wZWRLZXlTZWNyZXQiOiJiMjg5M2Q1Yzg4YjI1YWY2ZWY0ZTU4ZmFkYjRiZTNhZmQ4OWFmMDkwZGNlNjQ3MjQ3ZjgxODY5OTgxOWQwMGFlIiwiZXhwIjoxNzU4Nzc0MzY3fQ.i-UnCaUnIoKd_S19krFwqOxEKUcAA7XWfrtUEfn2VEA';

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
        // let projectSettings = await ProjectSettings.findOneAndUpdate(
        //     { projectId },
        //     { ...settingsData, projectId }, // Ensure projectId is set in both update and insert cases
        //     { new: true, runValidators: true, upsert: true } // upsert: true will create a new document if it doesn't exist
        // );

        const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

        try {
            console.log("Hello Metadata", metadata)
            const metadataResponse = await axios.post(url, metadata, {
                headers: {
                    pinata_api_key: API_KEY,
                    pinata_secret_api_key: API_SECRET,
                    Authorization: `Bearer ${JWT}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Metadata uploaded successfully:', metadataResponse.data);
            // return metadataResponse.data.IpfsHash;
            return NextResponse.json(metadataResponse.data.IpfsHash, { status: 200 });


        } catch (error) {
            console.error('Error uploading metadata:', error.response.data);
            throw error;
        }

        // let projectSettings = await ProjectSettings.findOne({ projectId });

        // if (projectSettings) {
        //   projectSettings = await ProjectSettings.findOneAndUpdate(
        //     { projectId },
        //     { ...settingsData },
        //     { new: true, runValidators: true }
        //   );
        // } else {
        //   projectSettings = new ProjectSettings({ projectId, ...settingsData });
        //   await projectSettings.save();
        // }

        // return NextResponse.json(projectSettings, { status: 200 });
    } catch (error) {
        console.error('Error In Uploading MetaData', error);
        return NextResponse.json({ error: 'Error In Uploading MetaData' }, { status: 500 });
    }
}