const ctx = document.getElementById("expenseChart");

let expenseChart;
// ---------- Modal ----------

const modal = document.getElementById("expenseModal");

const addBtn = document.getElementById("addExpenseBtn");

const closeBtn = document.querySelector(".close-btn");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
function openModal() {

    document.getElementById("date").valueAsDate = new Date();

    modal.style.display = "flex";

}

function closeModal() {
    modal.style.display = "none";
}

addBtn.addEventListener("click", openModal);

closeBtn.addEventListener("click", closeModal);

window.addEventListener("click", (event) => {
    if (event.target === modal) {
        closeModal();
    }
});
const expenseForm = document.getElementById("expenseForm");

let editingExpenseId = null;
let expenses = [];

expenseForm.addEventListener("submit", saveExpense);
async function saveExpense(event) {

    event.preventDefault();
    const isEditing = editingExpenseId !== null;

    const formData = new FormData();

        formData.append("amount", document.getElementById("amount").value);
        formData.append("category", document.getElementById("category").value);
        formData.append("date", document.getElementById("date").value);
        formData.append("description", document.getElementById("description").value);

    const receipt = document.getElementById("receipt").files[0];

    if (receipt) {
        formData.append("receipt", receipt);
    }

    try {

        const url = editingExpenseId
            ? `http://localhost:5000/api/expenses/${editingExpenseId}`
            : "http://localhost:5000/api/expenses";

        const method = editingExpenseId ? "PUT" : "POST";

        const response = await fetch(url, {
        method,
        body: formData
        });
        
        const data = await response.json();

        console.log(data);

        alert(
            isEditing
                ? "Expense Updated Successfully!"
                : "Expense Added Successfully!"
        );

        expenseForm.reset();
        document.getElementById("receipt").value = "";
        editingExpenseId = null;

        document.querySelector("#expenseForm button[type='submit']").textContent =
        "Save Expense";

        
        await loadExpenses();

        closeModal();

    }

    catch(error){

        console.error(error);

        alert("Something went wrong.");

    }

}
async function loadExpenses() {

    try {

        const response = await fetch("http://localhost:5000/api/expenses");

        expenses = await response.json();
        const searchText = searchInput.value.toLowerCase().trim();
        const selectedCategory = categoryFilter.value;

        const tableBody = document.getElementById("expenseTableBody");

tableBody.innerHTML = "";
let hasResults = false;

expenses.forEach(expense => {
    const matchesSearch =
    expense.description.toLowerCase().includes(searchText) ||
    expense.category.toLowerCase().includes(searchText);

    const matchesCategory =
    selectedCategory === "All" ||
    expense.category === selectedCategory;

    if (!matchesSearch || !matchesCategory) {
    return;
    }
    hasResults = true;

    tableBody.innerHTML += `

        <tr>

            <td>${new Date(expense.date).toLocaleDateString()}</td>

            <td>${expense.category}</td>

            <td>${expense.description}</td>

            <td>₹${expense.amount}</td>

            <td>

               ${
                    expense.receiptImage
                        ?  `<a href="http://localhost:5000/uploads/${expense.receiptImage}" target="_blank">
                            <i class="fa-solid fa-paperclip"></i> View
                            </a>`
                        : "—"
                }

            </td>

            <td>

                <button class="edit-btn" onclick="editExpense('${expense._id}')">
                    <i class="fa-solid fa-pen"></i>
                </button>

                <button class="delete-btn" onclick="deleteExpense('${expense._id}')">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>

        </tr>

    `;

});
// ---------- Dashboard Cards ----------

const totalExpenses = expenses.reduce((sum, expense) => {

    return sum + Number(expense.amount);

}, 0);

document.getElementById("totalExpenses").textContent =
`₹${totalExpenses}`;
const currentMonth = new Date().getMonth();

const currentYear = new Date().getFullYear();

const monthlyExpenses = expenses.filter(expense => {

    const expenseDate = new Date(expense.date);

    return (

        expenseDate.getMonth() === currentMonth &&

        expenseDate.getFullYear() === currentYear

    );

});

const monthlyTotal = monthlyExpenses.reduce((sum, expense) => {

    return sum + Number(expense.amount);

}, 0);

document.getElementById("monthlyExpenses").textContent =
`₹${monthlyTotal}`;
document.getElementById("totalTransactions").textContent =
expenses.length;
// ---------- Category Totals ----------

const categoryTotals = {};

expenses.forEach(expense => {

    if (!categoryTotals[expense.category]) {

        categoryTotals[expense.category] = 0;

    }

    categoryTotals[expense.category] += Number(expense.amount);

});
if (!hasResults) {

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" style="text-align:center; padding:25px; color:#666;">
                No expenses found.
            </td>
        </tr>
    `;

}
// ---------- Update Chart ----------

if (expenseChart) {
    expenseChart.destroy();
}

expenseChart = new Chart(ctx, {

    type: "doughnut",

    data: {

        labels: Object.keys(categoryTotals),

        datasets: [{

            data: Object.values(categoryTotals),

            backgroundColor: [
                "#2563eb",
                "#16a34a",
                "#f59e0b",
                "#dc2626",
                "#9333ea",
                "#0891b2"
            ],

            borderWidth: 2

        }]

    },

    options: {

        responsive: true,

        plugins: {

            legend: {

                position: "right"

            }

        }

    }

});

    }

    catch(error){

        console.error(error);

    }

}
loadExpenses();
searchInput.addEventListener("input", loadExpenses);

categoryFilter.addEventListener("change", loadExpenses);
function editExpense(id) {

    const expense = expenses.find(exp => exp._id === id);

    if (!expense) return;

    editingExpenseId = id;

    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value =
        new Date(expense.date).toISOString().split("T")[0];
    document.getElementById("description").value = expense.description;

    modal.style.display = "flex";

    document.querySelector("#expenseForm button[type='submit']").textContent =
        "Update Expense";
}

async function deleteExpense(id) {

    const confirmDelete = confirm("Are you sure you want to delete this expense?");

    if (!confirmDelete) {
        return;
    }

    try {

        await fetch(`http://localhost:5000/api/expenses/${id}`, {

            method: "DELETE"

        });

        await loadExpenses();

    }

    catch (error) {

        console.error(error);

        alert("Failed to delete expense.");

    }

}