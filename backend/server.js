
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('MongoDB connection failed: MONGODB_URI is not defined.');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('MongoDB connected successfully');

    app.listen(process.env.PORT || 5000, () => {
      console.log('Server is running on port 5000');
    });
 } catch (error) {
  console.error('MongoDB connection failed:', error.message);
  console.error('Error code:', error.code);
}
  }


startServer();
