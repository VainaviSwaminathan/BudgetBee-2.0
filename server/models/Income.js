const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },

        amount: {
            type: Number,
            required: [true, "Income amount is required"],
            min: [0, "Amount cannot be negative"],
        },

        source: {
            type: String,
            required: [true, "Income source is required"],
            trim: true,
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

        isRecurring: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Income", incomeSchema);