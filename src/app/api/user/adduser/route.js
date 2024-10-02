import { NextResponse } from 'next/server';
import User from '@/models/userModel';
import connectDB from '@/config/database';

// export async function POST(req) {
//     await connectDB();
//     const { walletAddress } = await req.json();
//     try {
//         // Check if the user with the same walletAddress already exists
//         const existingUser = await User.findOne({ walletAddress });
        
//         if (existingUser) {
//             // If user exists, return a 409 Conflict response
//             return NextResponse.json({ error: 'User with this wallet address already exists' }, { status: 409 });
//         }

//         // If user doesn't exist, proceed to create a new one
//         const newUser = new User({ walletAddress });
//         const savedUser = await newUser.save();
//         //console.log('User added successfully:', savedUser);
//         return NextResponse.json(savedUser, { status: 201 });
//     } catch (error) {
//         console.error('Error adding user:', error);
//         return NextResponse.json({ error: 'Error adding user' }, { status: 500 });
//     }
// }




export async function POST(req) {
    await connectDB();
    const { walletAddress } = await req.json();
    
    try {
        // Find the user or insert a new one if it doesn't exist
        const savedUser = await User.findOneAndUpdate(
            { walletAddress },
            { walletAddress }, // Ensure walletAddress is part of the update data
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        // If a user already existed, return a conflict response
        // if (!savedUser.isNew) {
        //     return NextResponse.json({ error: 'User with this wallet address already exists' }, { status: 409 });
        // }

        // Return the newly created user
        return NextResponse.json(savedUser, { status: 201 });
        
    } catch (error) {
        console.error('Error adding user:', error);
        return NextResponse.json({ error: 'Error adding user' }, { status: 500 });
    }
}