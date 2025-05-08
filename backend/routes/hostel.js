const express = require("express");
const router = express.Router();
const {
  getHostels,
  getHostelsById,
  createHostel,
  updateHostel,
  deleteHostel,
} = require("../controllers/hostelController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", getHostels);
router.get("/:id", getHostelsById);

// Protected routes
router.post("/", requireAuth, requireRole("dsw", "tusc"), createHostel);
router.put("/:id", requireAuth, requireRole("dsw", "tusc"), updateHostel);
router.delete("/:id", requireAuth, requireRole("dsw", "tusc"), deleteHostel);

module.exports = router;
