import mongoose from "mongoose";
import { env } from "./config/env.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDb(uri = env.MONGODB_URI) {
  mongoose.set("strictQuery", true);

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
  return mongoose.connection;
}

export async function disconnectDb() {
  connectionPromise = null;
  await mongoose.disconnect();
}
