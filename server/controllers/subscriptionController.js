const Subscription = require("../models/Subscription");

// @desc    Add subscription
// @route   POST /api/subscriptions
// @access  Private
const addSubscription = async (req, res) => {
    try {
        const {
            name,
            amount,
            billingCycle,
            renewalDate,
            category,
            reminderEnabled,
            notes,
        } = req.body;

        if (!name || !amount || !renewalDate) {
            return res.status(400).json({
                message: "Name, amount, and renewal date are required",
            });
        }

        const subscription = await Subscription.create({
            user: req.user._id,
            name,
            amount,
            billingCycle,
            renewalDate,
            category,
            reminderEnabled,
            notes,
        });

        return res.status(201).json({
            message: "Subscription added successfully",
            subscription,
        });
    } catch (error) {
        console.error("Add Subscription Error:", error.message);
        return res.status(500).json({
            message: "Server error while adding subscription",
        });
    }
};

// @desc    Get all subscriptions for logged-in user
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({
            user: req.user._id,
        }).sort({
            renewalDate: 1,
            createdAt: -1,
        });

        return res.status(200).json(subscriptions);
    } catch (error) {
        console.error("Get Subscriptions Error:", error.message);
        return res.status(500).json({
            message: "Server error while fetching subscriptions",
        });
    }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
            });
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to update this subscription",
            });
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            message: "Subscription updated successfully",
            subscription: updatedSubscription,
        });
    } catch (error) {
        console.error("Update Subscription Error:", error.message);
        return res.status(500).json({
            message: "Server error while updating subscription",
        });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            return res.status(404).json({
                message: "Subscription not found",
            });
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to delete this subscription",
            });
        }

        await subscription.deleteOne();

        return res.status(200).json({
            message: "Subscription deleted successfully",
            id: req.params.id,
        });
    } catch (error) {
        console.error("Delete Subscription Error:", error.message);
        return res.status(500).json({
            message: "Server error while deleting subscription",
        });
    }
};

module.exports = {
    addSubscription,
    getSubscriptions,
    updateSubscription,
    deleteSubscription,
};