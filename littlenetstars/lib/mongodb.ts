import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

if (!global._mongooseCache) {
  global._mongooseCache = { conn: null, promise: null };
}

export default async function dbConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable not set");

  if (global._mongooseCache.conn) return global._mongooseCache.conn;

  if (!global._mongooseCache.promise) {
    global._mongooseCache.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  }

  try {
    global._mongooseCache.conn = await global._mongooseCache.promise;
  } catch (err) {
    // Clear cache so next request retries instead of hitting the same failed promise
    global._mongooseCache.promise = null;
    throw err;
  }

  return global._mongooseCache.conn;
}
