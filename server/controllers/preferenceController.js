const Preference = require("../models/Preference");

// @desc    Create or update user preferences
// @route   POST /api/preferences
// @access  Private
const savePreferences = async (req, res) => {
    try {
        const {
            monthlyIncome,
            monthlyBudget,
            emergencyFund,
            spendingCategories,
            savingsGoalName,
            savingsGoalAmount,
            budgetAlertLimit,
        } = req.body;

        if (monthlyIncome === undefined || monthlyBudget === undefined) {
            return res.status(400).json({
                message: "Monthly income and monthly budget are required",
            });
        }

        const preferences = await Preference.findOneAndUpdate(
            { user: req.user._id },
            {
                user: req.user._id,
                monthlyIncome,
                monthlyBudget,
                emergencyFund,
                spendingCategories,
                savingsGoalName,
                savingsGoalAmount,
                budgetAlertLimit,
                onboardingCompleted: true,
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            message: "Preferences saved successfully",
            preferences,
        });
    } catch (error) {
        console.error("Save Preferences Error:", error.message);
        return res.status(500).json({
            message: "Server error while saving preferences",
        });
    }
};

// @desc    Get logged-in user's preferences
// @route   GET /api/preferences
// @access  Private
const getPreferences = async (req, res) => {
    try {
        const preferences = await Preference.findOne({ user: req.user._id });

        if (!preferences) {
            return res.status(404).json({
                message: "Preferences not found",
                onboardingCompleted: false,
            });
        }

        return res.status(200).json({
            preferences,
            onboardingCompleted: preferences.onboardingCompleted,
        });
    } catch (error) {
        console.error("Get Preferences Error:", error.message);
        return res.status(500).json({
            message: "Server error while fetching preferences",
        });
    }
};

module.exports = {
    savePreferences,
    getPreferences,
};