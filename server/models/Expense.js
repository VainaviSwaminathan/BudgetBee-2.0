const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        amount: {
            type: Number,
            required: [true, "Expense amount is required"],
            min: [0, "Amount cannot be negative"],
        },

        category: {
            type: String,
            required: [true, "Expense category is required"],
            trim: true,
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
                "Other",
            ],
        },

        paymentMethod: {
            type: String,
            trim: true,
            enum: ["Cash", "UPI", "Card", "Net Banking", "Other"],
            default: "UPI",
        },

        date: {
            type: Date,
            default: Date.now,
        },

        notes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Expense", expenseSchema);