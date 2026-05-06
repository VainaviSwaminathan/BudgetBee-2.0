const express = require("express");
const {
    addIncome,
    getIncome,
    updateIncome,
    deleteIncome,
} = require("../controllers/incomeController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, addIncome).get(protect, getIncome);

router.route("/:id").put(protect, updateIncome).delete(protect, deleteIncome);

module.exports = router;