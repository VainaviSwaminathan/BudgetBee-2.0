const mongoose = require("mongoose");

const preferenceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
            unique: true,
        },

        monthlyIncome: {
            type: Number,
            required: [true, "Monthly income is required"],
            min: [0, "Monthly income cannot be negative"],
        },

        monthlyBudget: {
            type: Number,
            required: [true, "Monthly budget is required"],
            min: [0, "Monthly budget cannot be negative"],
        },

        emergencyFund: {
            type: Number,
            default: 0,
            min: [0, "Emergency fund cannot be negative"],
        },

        spendingCategories: {
            type: [String],
            default: [],
            enum: [
                "Food",
                "Travel",
                "Shopping",
                "Rent",
                "Bills",
                "Entertainment",
                "Education",
                "Health",
                "Subscriptions",
                "Savings",
                "Other",
            ],
        },

        savingsGoalName: {
            type: String,
            trim: true,
            default: "",
        },

        savingsGoalAmount: {
            type: Number,
            default: 0,
            min: [0, "Savings goal amount cannot be negative"],
        },

        budgetAlertLimit: {
            type: Number,
            default: 75,
            min: [1, "Budget alert limit must be at least 1"],
            max: [100, "Budget alert limit cannot exceed 100"],
        },

        onboardingCompleted: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Preference", preferenceSchema);