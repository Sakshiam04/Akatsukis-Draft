import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, adminSecret } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Admin role can only be granted with the secret from .env
    let finalRole = "user";
    if (role === "admin") {
      if (process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET) {
        finalRole = "admin";
      } else {
        return res.status(403).json({ message: "Invalid admin secret" });
      }
    }

    const user = await User.create({ name, email, password, role: finalRole });

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: userResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// GET /auth/me
export const getMe = async (req, res) => {
  res.json({ user: userResponse(req.user) });
};
