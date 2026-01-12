import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';

async function testConnection() {
  console.log('Testing DB Connection...');
  try {
    const { default: connectDB } = await import('@/lib/db');
    const { default: User } = await import('@/models/User');

    const conn = await connectDB();
    console.log(`Connected to MongoDB: ${conn.connection.host}`);
    
    // Check if User model works
    const count = await User.countDocuments();
    console.log(`User count: ${count}`);
    
    console.log('DB Connection Test Passed');
  } catch (error) {
    console.error('DB Connection Failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

testConnection();
