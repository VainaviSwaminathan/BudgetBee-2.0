const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please provide name, email, and password",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
        });

        return res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Signup Error:", error.message);
        return res.status(500).json({
            message: "Server error during signup",
        });
    }
};

// @desc    Login existing user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        return res.status(500).json({
            message: "Server error during login",
        });
    }
};

// @desc    Get logged-in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    return res.status(200).json({
        user: req.user,
    });
};

// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required",
            });
        }

        const existingUser = await User.findOne({ email });

        if (
            existingUser &&
            existingUser._id.toString() !== req.user._id.toString()
        ) {
            return res.status(400).json({
                message: "Email is already used by another account",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                name,
                email,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
            },
        });
    } catch (error) {
        console.error("Update Profile Error:", error.message);
        return res.status(500).json({
            message: "Server error while updating profile",
        });
    }
};

module.exports = {
    signupUser,
    loginUser,
    getMe,
    updateProfile,
};