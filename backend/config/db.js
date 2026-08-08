import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connString = process.env.MONGODB_URI || 'mongodb://localhost:27017/ripoma_farm';
    console.log(`Connecting to MongoDB at: ${connString}`);
    
    // Set a timeout for connection to not hang the server startup
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000, 
    });
    
    global.dbConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    global.dbConnected = false;
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ MongoDB not running or connection string invalid.');
    console.warn('⚠️ SERVER FALLING BACK TO LOCAL JSON DATABASE SYSTEM (Friction-Free Mode).');
  }
};

export default connectDB;
