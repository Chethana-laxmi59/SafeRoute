import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance
 * Gracefully handles errors and logs connection status
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/saferoute';
  try {
    const conn = await mongoose.connect(mongoUri, {
      // Modern mongoose options are enabled by default in v6+
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Note] Make sure MongoDB is running locally or check your MONGO_URI in server/.env`);
    // In production, exit process on database connection failure
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;

