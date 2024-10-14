import mongoose from "mongoose"
const dbName = 'NewTestForMintTokens';
const mongoURI = process.env.MONGODB_URI
console.log(mongoURI);
// const mongoURI = `mongodb://127.0.0.1:27017/Launchpad`;

// const mongoURI = `mongodb+srv://ehtashamspyresync:L6zuREQ3cQhJCY8b@cluster0.6czzjz5.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    //console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

export default connectDB;
