import mongoose from 'mongoose';

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.warn('WARNING: MONGO_URI environment variable is not defined!');
    if (process.env.VERCEL) {
      console.error('Vercel serverless environment detected. You MUST configure MONGO_URI in your Vercel Project Settings -> Environment Variables.');
      return;
    }
  }

  const connectionUri = uri || 'mongodb://localhost:27017/biosecure_farm';

  try {
    const isLocalhost = connectionUri.includes('localhost') || connectionUri.includes('127.0.0.1');
    const options = isLocalhost ? { serverSelectionTimeoutMS: 2000 } : {};
    
    const conn = await mongoose.connect(connectionUri, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Could not connect to standard database: ${error.message}`);
    
    if (process.env.VERCEL) {
      console.error('Vercel serverless environment detected. Cannot fallback to In-Memory MongoDB Server on Vercel. Please verify your MONGO_URI environment variable and database IP whitelist/firewall settings.');
      return;
    }

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
      if (!process.env.VERCEL) {
        process.exit(1);
      }
    }
  }
};

export default connectDB;

