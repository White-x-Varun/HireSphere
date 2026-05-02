const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hiresphere';
  console.log("Connecting to:", uri);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("Connected successfully");
    await mongoose.disconnect();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

check();
