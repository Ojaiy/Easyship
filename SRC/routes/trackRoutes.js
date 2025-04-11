const express = require("express");
const { startTracking, updateTracking, getTracking } = require("../controllers/trackController");

const router = express.Router();

router.post("/start", startTracking);
router.post("/update", updateTracking);
router.get("/:orderId", getTracking);

module.exports = router;
