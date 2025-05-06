const express = require("express");
const router = express.Router();
const {
  getHostels,
  createHostel,
  getHostelsById,
  updateHostel,
  deleteHostel,
} = require("../controllers/hostelController");

router.get("/getAll", getHostels);
router.post("/addHostel", createHostel);
router.get("/get/:id", getHostelsById);
router.put("/upadteHostel/:id", updateHostel);
router.delete("/deleteHostel/:id", deleteHostel);

module.exports = router;