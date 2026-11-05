import mongoose from 'mongoose';

/**
 * Connect to MongoDB database instance
 * Supports both MONGODB_URI (standard Atlas/cloud convention) and MONGO_URI
 * Gracefully handles errors and logs connection status
 */
const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/saferoute';

  try {
    const conn = await mongoose.connect(mongoUri);
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} (${maskedUri})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.warn(`[Database Note] Make sure MongoDB is running or check your MONGODB_URI in server/.env`);
    // In production, exit process on database connection failure
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;

