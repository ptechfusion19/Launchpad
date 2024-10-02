// // import { NextResponse } from 'next/server';
// // import Wallet from '@/models/walletModel';
// // import connectDB from '@/config/database';

// // export async function POST(req) {
// //   const { wallets } = await req.json();  // Expecting an array of wallet objects

// //   try {
// //     await connectDB();

// //     // Initialize an array to hold the results of the operations
// //     const results = [];

// //     for (const walletData of wallets) {
// //       const { projectId } = walletData;

// //       let wallet = await Wallet.findOne({ projectId });

// //       if (wallet) {
// //         // Update existing wallet
// //         wallet = await Wallet.findOneAndUpdate(
// //           { projectId },
// //           { ...walletData },
// //           { new: true, runValidators: true }
// //         );
// //       } else {
// //         // Create a new wallet
// //         wallet = new Wallet({ ...walletData });
// //         await wallet.save();
// //       }

// //       results.push(wallet);  // Collect the result for each operation
// //     }

// //     return NextResponse.json(results, { status: 200 });
// //   } catch (error) {
// //     console.error('Error upserting wallets:', error);
// //     return NextResponse.json({ error: 'Error upserting wallets' }, { status: 500 });
// //   }
// // }


// import { NextResponse } from 'next/server';
// import Wallet from '@/models/walletModel';
// import connectDB from '@/config/database';

// export async function POST(req) {
//   const { wallets } = await req.json(); // Expecting an array of wallet objects

//   try {
//     await connectDB();

//     // Prepare bulk operations for efficient upserting
//     const operations = wallets.map(walletData => {
//       const { projectId, ...updateFields } = walletData;

//       return {
//         updateOne: {
//           filter: { projectId },
//           update: { $set: updateFields },
//           upsert: true // Create a new document if it doesn't exist
//         }
//       };
//     });

//     // Perform bulk write operation
//     const result = await Wallet.bulkWrite(operations);

//     // Return the result of the bulk operation
//     return NextResponse.json(result, { status: 200 });
//   } catch (error) {
//     console.error('Error upserting wallets:', error);
//     return NextResponse.json({ error: 'Error upserting wallets' }, { status: 500 });
//   }
// }


// import { NextResponse } from 'next/server';
// import Wallet from '@/models/walletModel';
// import connectDB from '@/config/database';

// export async function POST(req) {
//   const wallets = await req.json(); // Expecting an array of wallet objects
//   //console.log(wallets, "hello")
//   try {
//     await connectDB();

//     // Check if wallets array is not empty
//     if (!wallets || wallets.length === 0) {
//       return NextResponse.json({ error: 'No wallets provided' }, { status: 400 });
//     }

//     const result = await Wallet.insertMany(wallets);

//     // Return the result of the operation
//     return NextResponse.json(result, { status: 200 });
//   } catch (error) {
//     console.error('Error inserting wallets:', error.message || error);
//     return NextResponse.json({ error: 'Error inserting wallets' }, { status: 500 });
//   }
// }




import { NextResponse } from 'next/server';
import Wallet from '@/models/walletModel';
import connectDB from '@/config/database';

export async function POST(req) {
  // console.log(first)
  const { wallets } = await req.json();
  console.log(wallets)

  try {
    await connectDB();

    // Check if wallets array is not empty
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ error: 'No wallets provided' }, { status: 400 });
    }

    // Extract all projectIds from incoming wallets
    const projectIds = wallets.map(wallet => wallet.projectId);

    // Find wallets in the DB that already have the same projectIds
    const existingWallets = await Wallet.find({ projectId: { $in: projectIds } });

    // Extract the existing projectIds from the found wallets
    const existingProjectIds = existingWallets.map(wallet => wallet.projectId);

    // Filter out wallets that already exist in the DB
    const newWallets = wallets.filter(wallet => !existingProjectIds.includes(wallet.projectId));

    // If there are new wallets to insert
    if (newWallets.length > 0) {
      const result = await Wallet.insertMany(newWallets);
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json({ message: 'No new wallets to insert. All wallets already exist.' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error inserting wallets:', error.message || error);
    return NextResponse.json({ error: 'Error inserting wallets' }, { status: 500 });
  }
}
