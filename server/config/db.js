import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        console.log(`Connecting to MongoDB at configured URI...`);
        const conn = await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        return;
      } catch (externalErr) {
        console.warn(`Could not connect to external MongoDB URI (${externalErr.message}). Falling back to embedded MongoMemoryServer...`);
      }
    }

    // Fallback to embedded in-memory MongoDB
    console.log('Initializing embedded MongoDB instance (MongoMemoryServer)...');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'knowledgetrack',
      },
    });
    mongoUri = mongodInstance.getUri();
    const conn = await mongoose.connect(mongoUri);
    console.log(`Connected to Embedded MongoDB instance: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
