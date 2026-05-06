const express = require("express");

const {
    addSubscription,
    getSubscriptions,
    updateSubscription,
    deleteSubscription,
} = require("../controllers/subscriptionController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
    .route("/")
    .post(protect, addSubscription)
    .get(protect, getSubscriptions);

router
    .route("/:id")
    .put(protect, updateSubscription)
    .delete(protect, deleteSubscription);

module.exports = router;