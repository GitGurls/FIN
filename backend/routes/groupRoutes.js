const express = require("express");
const {
  createGroup,
  getGroups,
  getGroup,
  inviteMember,
  leaveGroup,
  deleteGroup,
  getGroupTransactions,
  createGroupTransaction,
  getGroupDashboard,
} = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroup);
router.post("/:id/invite", inviteMember);
router.delete("/:id/leave", leaveGroup);
router.delete("/:id", deleteGroup);
router.get("/:id/transactions", getGroupTransactions);
router.post("/:id/transactions", createGroupTransaction);
router.get("/:id/dashboard", getGroupDashboard);

module.exports = router;
