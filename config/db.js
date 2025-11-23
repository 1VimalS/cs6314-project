import mongoose from "mongoose";
import bluebird from "bluebird";

export default async function connectDB() {
  mongoose.Promise = bluebird;
  mongoose.set("strictQuery", false);
  try {
    // Await the connection promise
    await mongoose.connect("mongodb://127.0.0.1/project3", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}