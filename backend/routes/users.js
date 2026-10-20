const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { validateUserInput } = require('../validation/userInput');

const router = express.Router();

function isValidUserId(id) {
  return mongoose.isValidObjectId(id);
}

function handleWriteError(res, error, action) {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'A user with this email already exists.' });
  }
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  console.error(`Error ${action} user:`, error.message);
  return res.status(500).json({ message: `Failed to ${action} user` });
}

router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.post('/', async (req, res) => {
  const input = validateUserInput(req.body);
  if (input.error) return res.status(400).json({ message: input.error });

  try {
    const user = await User.create(input.value);
    res.status(201).json(user);
  } catch (error) {
    handleWriteError(res, error, 'create');
  }
});

router.get('/:id', async (req, res) => {
  if (!isValidUserId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

router.put('/:id', async (req, res) => {
  if (!isValidUserId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  const input = validateUserInput(req.body, { partial: true });
  if (input.error) return res.status(400).json({ message: input.error });

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: input.value },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    handleWriteError(res, error, 'update');
  }
});

router.delete('/:id', async (req, res) => {
  if (!isValidUserId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;
