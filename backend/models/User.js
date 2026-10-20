const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      unique: true,
    },
    phoneNumber: { type: String, trim: true, maxlength: 30 },
    age: {
      type: Number,
      min: 1,
      max: 120,
      validate: { validator: (value) => value === null || Number.isInteger(value) },
    },
    gender: { type: String, trim: true, maxlength: 50 },
    profileImageUrl: { type: String, trim: true, maxlength: 2048 },
    jobTitle: { type: String, trim: true, maxlength: 100 },
    department: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 100 },
    country: { type: String, trim: true, maxlength: 100 },
    address: { type: String, trim: true, maxlength: 300 },
    bio: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ['Active', 'Inactive', 'Pending'], default: 'Active' },
    role: { type: String, enum: ['User', 'Admin', 'Manager'], default: 'User' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
