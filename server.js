const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const uri = "mongodb+srv://efty131331:1234@cluster0.hy9ig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Initialize express app
const app = express();

// Use CORS middleware
app.use(cors());

// Middleware to parse incoming request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

// Define a schema and model for Users with custom id
const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

const User = mongoose.model("User", UserSchema);

// GET route to send array of Users
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();  // Query MongoDB to get array of users
        res.json(users); // Send array of users to the client
    } catch (error) {
        res.status(500).json({ message: "Error fetching data", error });
    }
});

// GET route for the root path
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Users API",
        endpoints: {
            getAllUsers: "/users",
            createUser: "/users (POST method)",
        },
    });
});

// POST route to save new User with custom ID to MongoDB
app.post('/users', async (req, res) => {
    const { name, email } = req.body; // Extract name and email from request body

    // Validation
    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        // Get the highest id from the database and increment it
        const lastUser = await User.findOne().sort({ id: -1 });
        const newId = lastUser ? lastUser.id + 1 : 1; // Increment or start from 1

        // Create a new user with the custom id
        const newUser = new User({ id: newId, name, email });
        await newUser.save(); // Save user to database
        res.status(201).json({ message: "User saved successfully", user: newUser });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Email or ID already exists" });
        } else {
            res.status(500).json({ message: "Error saving user", error });
        }
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));