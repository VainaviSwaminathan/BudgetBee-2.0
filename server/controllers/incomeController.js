const Income = require("../models/Income");

// @desc    Add income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res) => {
    try {
        const { amount, source, date, notes, isRecurring } = req.body;

        if (!amount || !source) {
            return res.status(400).json({
                message: "Amount and source are required",
            });
        }

        const income = await Income.create({
            user: req.user._id,
            amount,
            source,
            date,
            notes,
            isRecurring,
        });

        return res.status(201).json({
            message: "Income added successfully",
            income,
        });
    } catch (error) {
        console.error("Add Income Error:", error.message);
        return res.status(500).json({
            message: "Server error while adding income",
        });
    }
};

// @desc    Get all income for logged-in user
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res) => {
    try {
        const income = await Income.find({ user: req.user._id }).sort({
            date: -1,
            createdAt: -1,
        });

        return res.status(200).json(income);
    } catch (error) {
        console.error("Get Income Error:", error.message);
        return res.status(500).json({
            message: "Server error while fetching income",
        });
    }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({
                message: "Income not found",
            });
        }

        if (income.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to update this income",
            });
        }

        const updatedIncome = await Income.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            message: "Income updated successfully",
            income: updatedIncome,
        });
    } catch (error) {
        console.error("Update Income Error:", error.message);
        return res.status(500).json({
            message: "Server error while updating income",
        });
    }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({
                message: "Income not found",
            });
        }

        if (income.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to delete this income",
            });
        }

        await income.deleteOne();

        return res.status(200).json({
            message: "Income deleted successfully",
            id: req.params.id,
        });
    } catch (error) {
        console.error("Delete Income Error:", error.message);
        return res.status(500).json({
            message: "Server error while deleting income",
        });
    }
};

module.exports = {
    addIncome,
    getIncome,
    updateIncome,
    deleteIncome,
};