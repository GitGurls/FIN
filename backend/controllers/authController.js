const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Category = require("../models/Category");

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "income", color: "#6EE7B7", icon: "banknote" },
  { name: "Freelance", type: "income", color: "#A78BFA", icon: "briefcase" },
  { name: "Food", type: "expense", color: "#F5B754", icon: "utensils" },
  { name: "Groceries", type: "expense", color: "#60A5FA", icon: "shopping-cart" },
  { name: "Transport", type: "expense", color: "#F87171", icon: "car" },
  { name: "Shopping", type: "expense", color: "#F472B6", icon: "shopping-bag" },
  { name: "Bills", type: "expense", color: "#FB923C", icon: "receipt" },
  { name: "Entertainment", type: "expense", color: "#C084FC", icon: "clapperboard" },
  { name: "Health", type: "expense", color: "#34D399", icon: "heart-pulse" },
  { name: "Other", type: "expense", color: "#94A3B8", icon: "more-horizontal" },
];

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password });

    await Category.insertMany(
      DEFAULT_CATEGORIES.map((c) => ({ ...c, user: user._id, isDefault: true }))
    );

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ token, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
};

// PATCH /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const { name, currency, monthlyBudget, avatarUrl } = req.body;
    const user = req.user;
    if (name !== undefined) user.name = name;
    if (currency !== undefined) user.currency = currency;
    if (monthlyBudget !== undefined) user.monthlyBudget = monthlyBudget;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    await user.save();
    res.json({ user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/auth/me
const deleteMe = async (req, res, next) => {
  try {
    const Transaction = require("../models/Transaction");
    await Transaction.deleteMany({ user: req.user._id });
    await Category.deleteMany({ user: req.user._id });
    await req.user.deleteOne();
    res.json({ message: "Account deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateMe, deleteMe };
