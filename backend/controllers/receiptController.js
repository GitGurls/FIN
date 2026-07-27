const Transaction = require("../models/Transaction");
const { extractReceiptData } = require("../utils/gemini");
const { emitToUser } = require("../sockets");
const { checkBudgetAlert } = require("../utils/budgetAlert");

// POST /api/receipts/scan  (multipart/form-data, field name: "receipt")
const scanReceipt = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No receipt file uploaded" });
    }
    const imageUrl = req.file.path; // Cloudinary URL from multer-storage-cloudinary

    const parsed = await extractReceiptData(imageUrl);

    res.json({
      receiptUrl: imageUrl,
      suggested: {
        type: "expense",
        amount: parsed.amount || 0,
        category: parsed.category || "Other",
        date: parsed.date || new Date().toISOString().slice(0, 10),
        note: parsed.merchant ? `${parsed.merchant}` : "",
        items: parsed.items || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/receipts/confirm - creates the transaction once the user approves the AI suggestion
const confirmReceipt = async (req, res, next) => {
  try {
    const { amount, category, date, note, receiptUrl } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: "amount and category are required" });
    }
    const transaction = await Transaction.create({
      user: req.user._id,
      type: "expense",
      amount,
      category,
      note,
      date: date || Date.now(),
      receiptUrl,
      source: "receipt_ocr",
    });

    emitToUser(req.user._id, "transaction:created", { transaction });
    await checkBudgetAlert(req.user);

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
};

module.exports = { scanReceipt, confirmReceipt };
