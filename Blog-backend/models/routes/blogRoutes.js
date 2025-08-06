const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('../Post');

const router = express.Router();

// --- In-memory Admin User Store ---
// In a real-world, high-security application, this would be in a database.
// IMPORTANT: The password hashes here are placeholders. You will generate real ones in the next step.
const adminUsers = [
    {
        username: 'Tjay Earl',
        passwordHash: '$2a$10$REPLACE_WITH_TJAYS_HASH'
    },
    {
        username: 'Ines Kibe',
        passwordHash: '$2a$10$REPLACE_WITH_INES_HASH'
    }
];

// --- Authentication Middleware ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // Make sure you have a JWT_SECRET in your .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user payload to request
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};


// --- Routes ---

// POST /api/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const user = adminUsers.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create JWT
    const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1d' } // Token expires in 1 day
    );

    res.json({ message: 'Login successful', token });
});

// GET /api/posts - Public route
router.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
});

// POST /api/posts - Protected
router.post('/posts', authMiddleware, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: 'Error creating post', error: error.message });
    }
});

// PATCH /api/posts/:id - Protected
router.patch('/posts/:id', authMiddleware, async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: 'Error updating post', error: error.message });
    }
});

// DELETE /api/posts/:id - Protected
router.delete('/posts/:id', authMiddleware, async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
});

module.exports = router;