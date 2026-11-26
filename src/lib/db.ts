import mongoose from "mongoose";
import { env } from "./config";
import { logger } from "./logger";
const globalForMongoose = globalThis as unknown as { mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined };
export async function connectDb() { const cached = globalForMongoose.mongoose ??= { conn: null, promise: null }; if (cached.conn) return cached.conn; if (!cached.promise) cached.promise = mongoose.connect(env.MONGODB_URI).catch((error) => { logger.error({ err: error }, "Database connection failed"); throw error; }); cached.conn = await cached.promise; return cached.conn; }
