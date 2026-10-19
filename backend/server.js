
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('./models/Posts');

const app = express();

app.use(express.json());

function isValidPostId(id) {
  return mongoose.isValidObjectId(id);
}

function validatePostInput(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }

  const { title, body: content } = body;
  if (typeof title !== 'string' || !title.trim()) {
    return { error: 'Title is required.' };
  }

  if (typeof content !== 'string' || !content.trim()) {
    return { error: 'Body is required.' };
  }

  return { value: { title: title.trim(), body: content.trim() } };
}

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Get all posts from MongoDB
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Create a new post in MongoDB
app.post('/api/posts', async (req, res) => {
  const input = validatePostInput(req.body);
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }

  try {
    const post = await Post.create(input.value);

    res.status(201).json(post);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error creating post:', error.message);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// Get one post by ID
app.get('/api/posts/:id', async (req, res) => {
  if (!isValidPostId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching post:', error.message);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
});

// Update a post by ID
app.put('/api/posts/:id', async (req, res) => {
  if (!isValidPostId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  const input = validatePostInput(req.body);
  if (input.error) {
    return res.status(400).json({ message: input.error });
  }

  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      input.value,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Error updating post:', error.message);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// Delete a post by ID
app.delete('/api/posts/:id', async (req, res) => {
  if (!isValidPostId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});


async function startServer() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
  }
}

startServer();
