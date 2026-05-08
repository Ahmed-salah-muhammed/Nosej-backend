import mongoose from "mongoose";

const uri = process.env.MONGODB_URI.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD,
);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri, {
      family: 4,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
