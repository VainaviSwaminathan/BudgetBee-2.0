const Expense = require("../models/Expense");

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res) => {
    try {
        const { amount, category, paymentMethod, date, notes } = req.body;

        if (!amount || !category) {
            return res.status(400).json({
                message: "Amount and category are required",
            });
        }

        const expense = await Expense.create({
            user: req.user._id,
            amount,
            category,
            paymentMethod,
            date,
            notes,
        });

        return res.status(201).json({
            message: "Expense added successfully",
            expense,
        });
    } catch (error) {
        console.error("Add Expense Error:", error.message);
        return res.status(500).json({
            message: "Server error while adding expense",
        });
    }
};

// @desc    Get all expenses for logged-in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id }).sort({
            date: -1,
            createdAt: -1,
        });

        return res.status(200).json(expenses);
    } catch (error) {
        console.error("Get Expenses Error:", error.message);
        return res.status(500).json({
            message: "Server error while fetching expenses",
        });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to update this expense",
            });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        return res.status(200).json({
            message: "Expense updated successfully",
            expense: updatedExpense,
        });
    } catch (error) {
        console.error("Update Expense Error:", error.message);
        return res.status(500).json({
            message: "Server error while updating expense",
        });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found",
            });
        }

        if (expense.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                message: "Not authorized to delete this expense",
            });
        }

        await expense.deleteOne();

        return res.status(200).json({
            message: "Expense deleted successfully",
            id: req.params.id,
        });
    } catch (error) {
        console.error("Delete Expense Error:", error.message);
        return res.status(500).json({
            message: "Server error while deleting expense",
        });
    }
};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense,
};