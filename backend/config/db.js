import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/biosecure_farm';
  try {
    const isLocalhost = uri.includes('localhost') || uri.includes('127.0.0.1');
    const options = isLocalhost ? { serverSelectionTimeoutMS: 2000 } : {};
    
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Could not connect to standard database: ${error.message}`);
    console.log('Attempting to launch an In-Memory MongoDB Server for presentation/demo mode...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const conn = await mongoose.connect(mongoUri);
      console.log(`In-Memory MongoDB Server Started and Connected: ${mongoUri}`);
      
      console.log('Seeding in-memory database...');
      const { seedInMemory } = await import('../seedInMemory.js');
      await seedInMemory();
      console.log('In-Memory Database Seeded successfully!');
    } catch (innerError) {
      console.error(`Failed to launch In-Memory MongoDB Server: ${innerError.message}`);
      process.exit(1);
    }
  }
};

export default connectDB;

