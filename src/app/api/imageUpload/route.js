
import axios from "axios";
import FormData from 'form-data';
import fs from 'fs';
import { NextResponse } from 'next/server';
import ProjectSettings from '@/models/projectSettingsModel';
import connectDB from '@/config/database';
const API_KEY = 'b0d3c83fda71caff078b';
const API_SECRET = 'b2893d5c88b25af6ef4e58fadb4be3afd89af090dce647247f818699819d00ae';
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI5YmUyNTI4Ni1iMDQ0LTRjYzYtYWE3Ni1hZDgzZGY5YTVkNDgiLCJlbWFpbCI6ImVodGFzaGFtLnNweXJlc3luY0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiYjBkM2M4M2ZkYTcxY2FmZjA3OGIiLCJzY29wZWRLZXlTZWNyZXQiOiJiMjg5M2Q1Yzg4YjI1YWY2ZWY0ZTU4ZmFkYjRiZTNhZmQ4OWFmMDkwZGNlNjQ3MjQ3ZjgxODY5OTgxOWQwMGFlIiwiZXhwIjoxNzU4Nzc0MzY3fQ.i-UnCaUnIoKd_S19krFwqOxEKUcAA7XWfrtUEfn2VEA';





// export async function POST(req) {
//     const { file } = await req.json();
//     console.log(file, "IM image")
//     try {
//         const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
//         const form = new FormData();
//         form.append('file', imagePath);
//         // form.append('file', fs.createReadStream(imagePath));

//         try {
//             const imageResponse = await axios.post(url, form, {
//                 maxContentLength: Infinity,
//                 maxBodyLength: Infinity,
//                 headers: {
//                     pinata_api_key: API_KEY,
//                     pinata_secret_api_key: API_SECRET,
//                     Authorization: `Bearer ${JWT}`,
//                     ...form.getHeaders()
//                 }
//             });
//             console.log('Image uploaded successfully:', imageResponse.data);
//             const imageHash = imageResponse.data.IpfsHash;
//             const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

//             return NextResponse.json(imageUrl, { status: 200 });
//         } catch (error) {
//             console.error('Error uploading image:', error.response.data);
//             throw error;
//             // return NextResponse.json(error, { status: 500 });
//         }

//     } catch (error) {
//         console.error('Error In Uploading Image', error);
//         return NextResponse.json({ error: 'Error In Uploading Image' }, { status: 500 });
//     }
// }


export async function POST(req) {
    const { file } = await req.json();


    const buffer = Buffer.from(file, 'base64');
    const form = new FormData();
    form.append('file', buffer, { filename: 'image.png' });

    try {
        const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
        const imageResponse = await axios.post(url, form, {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {
                pinata_api_key: API_KEY,
                pinata_secret_api_key: API_SECRET,
                Authorization: `Bearer ${JWT}`,
                ...form.getHeaders(), // Get headers for multipart/form-data
            },
        });

        console.log('Image uploaded successfully:', imageResponse.data);
        const imageHash = imageResponse.data.IpfsHash;
        const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

        return NextResponse.json({ imageUrl }, { status: 200 }); // Return the image URL
    } catch (error) {
        console.error('Error uploading image:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
    }
}