import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance
 * Gracefully handles errors and logs connection status
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
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

