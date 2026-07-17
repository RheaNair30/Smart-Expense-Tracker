const Expense = require("../models/Expense");

// Add Expense
const addExpense = async (req, res) => {

    try {

        const expense = await Expense.create({

            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date,
            description: req.body.description,

            receiptImage: req.file
                ? req.file.filename
                : ""

        });

        res.status(201).json(expense);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// Get All Expenses
const getExpenses = async (req, res) => {
    try {

        const expenses = await Expense.find().sort({ date: -1 });

        res.status(200).json(expenses);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// Update Expense
const updateExpense = async (req, res) => {
    try {

        const updateData = {
            amount: req.body.amount,
            category: req.body.category,
            date: req.body.date,
            description: req.body.description
        };

        // Only replace the receipt if a new one was uploaded
        if (req.file) {
            updateData.receiptImage = req.file.filename;
        }

        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(expense);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// Delete Expense
const deleteExpense = async (req, res) => {

    try {

        const expense = await Expense.findByIdAndDelete(req.params.id);

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense
    
}; 