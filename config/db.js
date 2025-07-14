import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGO_URI is not set");

const client = new MongoClient(uri);

let db; // will hold the database instance

// Connect to MongoDB once
export const connectDB = async () => {
  try {
    if (!client.isConnected?.()) {
      await client.connect();
      console.log("MongoDB connected");
    }
    db = client.db(); // default DB from URI
  } catch (err) {
    console.error("MongoDB connection failed", err);
    throw err;
  }
};

// Get the connected DB instance
export const getDB = () => {
  if (!db) throw new Error("Database not connected. Call connectDB first.");
  return db;
};
