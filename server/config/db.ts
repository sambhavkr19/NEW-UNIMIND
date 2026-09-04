import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export interface DBConnectionStatus {
  isConnected: boolean;
  mode: 'real' | 'mock-fallback';
  uri?: string;
  error?: string;
}

const status: DBConnectionStatus = {
  isConnected: false,
  mode: 'mock-fallback',
};

function sanitizeMongoUri(uri: string): string {
  if (!uri) return uri;
  
  // Clean surrounding quotes and trim
  uri = uri.trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1).trim();
  }

  try {
    const lastAtIndex = uri.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const prefixAndAuth = uri.slice(0, lastAtIndex);
      const rest = uri.slice(lastAtIndex); // e.g., "@roomzent.bji5ldx.mongodb.net/?appName=roomzent"
      
      const protocolIndex = prefixAndAuth.indexOf('://');
      if (protocolIndex !== -1) {
        const protocol = prefixAndAuth.slice(0, protocolIndex + 3); // e.g., "mongodb+srv://"
        const auth = prefixAndAuth.slice(protocolIndex + 3); // e.g., "jeema2023_db_user:Samay@1919"
        
        const colonIndex = auth.indexOf(':');
        if (colonIndex !== -1) {
          const username = auth.slice(0, colonIndex);
          const password = auth.slice(colonIndex + 1);
          
          // Percent encode username and password
          const encodedUsername = encodeURIComponent(decodeURIComponent(username));
          const encodedPassword = encodeURIComponent(decodeURIComponent(password));
          
          return `${protocol}${encodedUsername}:${encodedPassword}${rest}`;
        }
      }
    }
  } catch (e) {
    logger.error('Error sanitizing URI:', e);
  }
  return uri;
}

export async function connectDB(): Promise<DBConnectionStatus> {
  let rawUri = process.env.MONGODB_URI;

  if (rawUri) {
    rawUri = rawUri.trim();
    if ((rawUri.startsWith('"') && rawUri.endsWith('"')) || (rawUri.startsWith("'") && rawUri.endsWith("'"))) {
      rawUri = rawUri.slice(1, -1).trim();
    }
  }

  if (!rawUri || rawUri === 'undefined' || rawUri === 'null' || rawUri === '') {
    logger.warn('MONGODB_URI is not set. Using real-time in-memory mockup data fallback for rapid prototyping.');
    status.isConnected = false;
    status.mode = 'mock-fallback';
    status.error = 'No connection string provided';
    return status;
  }

  const uri = sanitizeMongoUri(rawUri);

  // Validate MongoDB connection string prefix
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    logger.warn(`MONGODB_URI is not a valid MongoDB connection string format. Using real-time in-memory mockup data fallback.`);
    status.isConnected = false;
    status.mode = 'mock-fallback';
    status.error = 'Invalid connection string format';
    return status;
  }

  try {
    // Attempt real connection
    logger.info(`Attempting to connect to MongoDB...`);
    
    // Set mongoose connection options
    mongoose.set('strictQuery', true);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is not up
      dbName: 'unimind',
    });

    status.isConnected = true;
    status.mode = 'real';
    status.uri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'); // mask credentials in logs
    status.error = undefined;
    
    logger.info(`MongoDB connected successfully to cluster!`);

    // Seed default users if they do not exist in MongoDB
    try {
      const { User } = await import('../models/User');
      const studentEmail = 'student@unimind.edu';
      const adminEmail = 'admin@unimind.edu';

      const existingStudent = await (User as any).findOne({ email: studentEmail });
      if (!existingStudent) {
        logger.info('Seeding default student user into MongoDB...');
        const studentUser = new User({
          name: 'Jane Doe',
          email: studentEmail,
          password: 'student123', // hooks will auto hash
          role: 'student',
          department: 'Computer Science',
          studentId: 'CS2026-9481',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        });
        await studentUser.save();
        logger.info('Default student user successfully seeded.');
      }

      const existingAdmin = await (User as any).findOne({ email: adminEmail });
      if (!existingAdmin) {
        logger.info('Seeding default admin user into MongoDB...');
        const adminUser = new User({
          name: 'Admin Officer',
          email: adminEmail,
          password: 'admin123', // hooks will auto hash
          role: 'admin',
          department: 'Registrar Office',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        });
        await adminUser.save();
        logger.info('Default admin user successfully seeded.');
      }
    } catch (seedErr: any) {
      logger.error('Error seeding default database users in MongoDB:', seedErr);
    }
  } catch (err: any) {
    logger.warn(`Failed to connect to MongoDB. Falling back to in-memory/mock data structures to keep app online: ${err.message || err}`);
    status.isConnected = false;
    status.mode = 'mock-fallback';
    status.error = err.message || 'Connection failed';
  }

  return status;
}

export function getDBStatus(): DBConnectionStatus {
  return {
    ...status,
    isConnected: mongoose.connection.readyState === 1,
  };
}
