const express = require("express");
const multer = require("multer");
const { receiptStorage } = require("../config/cloudinary");
const { scanReceipt, confirmReceipt } = require("../controllers/receiptController");
const { protect } = require("../middleware/authMiddleware");

const upload = multer({ storage: receiptStorage, limits: { fileSize: 8 * 1024 * 1024 } });

const router = express.Router();
router.use(protect);

router.post("/scan", upload.single("receipt"), scanReceipt);
router.post("/confirm", confirmReceipt);

module.exports = router;
