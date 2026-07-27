const express = require("express");
const {
  getSummary,
  getMonthlyTrend,
  getByCategory,
  getHeatmap,
  getAiInsight,
  getHealthScore,
  getMonthlyReport,
} = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.get("/summary", getSummary);
router.get("/monthly-trend", getMonthlyTrend);
router.get("/by-category", getByCategory);
router.get("/heatmap", getHeatmap);
router.get("/ai-insight", getAiInsight);
router.get("/health-score", getHealthScore);
router.get("/monthly-report", getMonthlyReport);

module.exports = router;
