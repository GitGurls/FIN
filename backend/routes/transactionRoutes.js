const express = require("express");
const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { parseVoice } = require("../controllers/voiceController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getTransactions);
router.post("/", createTransaction);
router.post("/parse-voice", parseVoice);
router.patch("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

module.exports = router;
