const Category = require("../models/Category");

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({ type: 1, name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, type, color, icon } = req.body;
    if (!name || !type) {
      return res.status(400).json({ message: "name and type are required" });
    }
    const category = await Category.create({ user: req.user._id, name, type, color, icon });
    res.status(201).json({ category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Category already exists" });
    }
    next(err);
  }
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user._id });
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.isDefault) {
      return res.status(400).json({ message: "Default categories cannot be deleted" });
    }
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCategories, createCategory, deleteCategory };
