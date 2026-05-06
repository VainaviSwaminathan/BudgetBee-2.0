const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        name: {
            type: String,
            required: [true, "Subscription name is required"],
            trim: true,
        },

        amount: {
            type: Number,
            required: [true, "Subscription amount is required"],
            min: [0, "Amount cannot be negative"],
        },

        billingCycle: {
            type: String,
            enum: ["Monthly", "Yearly", "Weekly", "Quarterly"],
            default: "Monthly",
        },

        renewalDate: {
            type: Date,
            required: [true, "Renewal date is required"],
        },

        category: {
            type: String,
            trim: true,
            enum: [
                "Entertainment",
                "Education",
                "Productivity",
                "Fitness",
                "Food",
                "Shopping",
                "Other",
            ],
            default: "Other",
        },

        reminderEnabled: {
            type: Boolean,
            default: true,
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

module.exports = mongoose.model("Subscription", subscriptionSchema);