const express = require("express");
const {
  getInvestments,
  createInvestment,
  updateInvestment,
  deleteInvestment,
} = require("../controllers/investmentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/", getInvestments);
router.post("/", createInvestment);
router.patch("/:id", updateInvestment);
router.delete("/:id", deleteInvestment);

module.exports = router;
