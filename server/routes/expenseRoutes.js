const express = require("express");
const upload = require("../config/multer");
const router = express.Router();

const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense
} = require("../controllers/expenseController");

router.post("/", upload.single("receipt"), addExpense);
router.get("/", getExpenses);
router.put("/:id", upload.single("receipt"), updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;