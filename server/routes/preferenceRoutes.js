const express = require("express");
const {
    savePreferences,
    getPreferences,
} = require("../controllers/preferenceController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, savePreferences).get(protect, getPreferences);

module.exports = router;