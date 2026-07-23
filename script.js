// ================= DOM ELEMENTS =================
const search = document.getElementById("search");
const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");
const addBtn = document.getElementById("addBtn");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const saving = document.getElementById("saving");
 const budgetInput = document.getElementById("budgetInput");
const saveBudget = document.getElementById("saveBudget");

const themeBtn = document.getElementById("themeBtn");
const themeIcon = themeBtn.querySelector("i");
const budgetAmount = document.getElementById("budgetAmount");
const usedAmount = document.getElementById("usedAmount");
const remainingAmount = document.getElementById("remainingAmount");
const toast = document.getElementById("toast");
const progress = document.getElementById("progress");
const budgetWarning = document.getElementById("budgetWarning");

let monthlyBudget = Number(localStorage.getItem("monthlyBudget")) || 0;

const expenseForm = document.getElementById("expenseForm");

const text = document.getElementById("text");
const amount = document.getElementById("amount");
const type = document.getElementById("type");
const category = document.getElementById("category");
const date = document.getElementById("date");
const note = document.getElementById("note");

const transactionList = document.getElementById("transactionList");

const greeting = document.getElementById("greeting");
const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");

const totalTransaction = document.getElementById("totalTransaction");
const highestIncome = document.getElementById("highestIncome");
const highestExpense = document.getElementById("highestExpense");

// ================= ARRAY =================

let transactions = [];
let editId = null;
// ================= CHARTS =================

let pieChart;
let barChart;
// ================= LOCAL STORAGE =================

const savedTransactions = localStorage.getItem("transactions");

if (savedTransactions) {

    transactions = JSON.parse(savedTransactions);

    showTransactions();

    updateSummary();

}
// ================= DATE & TIME =================

function updateDateTime() {

    const now = new Date();

    currentDate.innerHTML = now.toLocaleDateString("en-IN",{

        day:"numeric",
        month:"long",
        year:"numeric"

    });

    currentTime.innerHTML = now.toLocaleTimeString("en-IN",{

        hour:"2-digit",
        minute:"2-digit"

    });

}

setInterval(updateDateTime,1000);

updateDateTime();
// ================= GREETING =================

function updateGreeting(){

    const hour = new Date().getHours();

    if(hour < 12){

        greeting.innerHTML="Good Morning 👋";

    }

    else if(hour < 17){

        greeting.innerHTML="Good Afternoon ☀️";

    }

    else{

        greeting.innerHTML="Good Evening 🌙";

    }

}

updateGreeting();
// ================= ADD TRANSACTION =================

expenseForm.addEventListener("submit", function(e){

    e.preventDefault();

    if(
        text.value.trim()==="" ||
        amount.value==="" ||
        type.value==="" ||
        category.value==="" ||
        date.value===""

    ){

        alert("Please fill all required fields.");

        return;

    }

    const transaction={

        id:Date.now(),

        text:text.value,

        amount:Number(amount.value),

        type:type.value,

        category:category.value,

        date:date.value,

        note:note.value

    };

    if(editId){

    const index = transactions.findIndex(item=>item.id===editId);

    transactions[index] = {

        ...transaction,

        id:editId

    };

    editId = null;

    addBtn.innerHTML="➕ Add Transaction";

}
else{

    transactions.push(transaction);

}


      saveTransactions();

      showTransactions();

      updateSummary();

      showToast("Transaction Added", "success");

     expenseForm.reset();
});
// ================= SHOW TRANSACTIONS =================

function showTransactions() {

    transactionList.innerHTML = "";

    const searchValue = search.value.toLowerCase();
    const typeValue = filterType.value;
    const categoryValue = filterCategory.value;

    const filteredTransactions = transactions.filter((item) => {

        const matchSearch = item.text.toLowerCase().includes(searchValue);

        const matchType =
            typeValue === "all" || item.type === typeValue;

        const matchCategory =
            categoryValue === "all" || item.category === categoryValue;

        return matchSearch && matchType && matchCategory;

    });

    filteredTransactions.forEach((item) => {

        transactionList.innerHTML += `
            <tr>

                <td>${item.text}</td>

                <td>${item.category}</td>

                <td>${item.type}</td>

                <td>₹${item.amount}</td>

                <td>${item.date}</td>

                <td>

                    <button onclick="editTransaction(${item.id})">
                        ✏️
                    </button>

                    <button onclick="deleteTransaction(${item.id})">
                        🗑️
                    </button>

                </td>

            </tr>
        `;

    });

}

// ================= UPDATE SUMMARY =================

function updateSummary(){

    let totalIncome=0;

    let totalExpense=0;

    transactions.forEach((item)=>{

        if(item.type==="income"){

            totalIncome+=item.amount;

        }

        else{

            totalExpense+=item.amount;

        }

    });

    const totalBalance=totalIncome-totalExpense;

    balance.innerHTML=`₹${totalBalance}`;

    income.innerHTML=`₹${totalIncome}`;

    expense.innerHTML=`₹${totalExpense}`;

    saving.innerHTML=`₹${totalBalance}`;

    totalTransaction.innerHTML=transactions.length;
    budgetAmount.textContent = `₹${monthlyBudget}`;

    usedAmount.textContent = `₹${totalExpense}`;

  const remaining = monthlyBudget - totalExpense;

  remainingAmount.textContent = `₹${remaining}`;
  // ===== Progress Bar =====

let percent = 0;

if (monthlyBudget > 0) {
    percent = (totalExpense / monthlyBudget) * 100;

    if (percent > 100) {
        percent = 100;
    }
}

progress.style.width = `${percent}%`;


// ===== Budget Warning =====

if (monthlyBudget === 0) {

    budgetWarning.textContent = "Please set your monthly budget.";

    progress.style.background = "#999";

}
else if (totalExpense > monthlyBudget) {

    budgetWarning.textContent = "⚠️ Budget Exceeded!";

    showToast("Budget Exceeded!", "error");

    progress.style.background = "#ff3b30";

}
else {

    budgetWarning.textContent = "";

    progress.style.background = "#22c55e";

}
    updateCharts();
    
}

function updateCharts() {

    const totalIncome = transactions
        .filter(item => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);

    const totalExpense = transactions
        .filter(item => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

    // ================= PIE CHART =================

    const pieCtx = document.getElementById("pieChart").getContext("2d");

    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(pieCtx, {

        type: "doughnut",

        data: {

            labels: ["Income", "Expense"],

            datasets: [{

                data: [totalIncome, totalExpense],

                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
                ]

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            cutout: "65%"

        }

    });

    // ================= CATEGORY WISE BAR CHART =================

    const expenseData = {};

    transactions.forEach((item) => {

        if (item.type === "expense") {

            expenseData[item.category] =
                (expenseData[item.category] || 0) + item.amount;

        }

    });

    const barCtx = document.getElementById("barChart").getContext("2d");

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(barCtx, {

        type: "bar",

        data: {

            labels: Object.keys(expenseData),

            datasets: [{

                label: "Expense (₹)",

                data: Object.values(expenseData),

                backgroundColor: [
                    "#ef4444",
                    "#3b82f6",
                    "#22c55e",
                    "#f59e0b",
                    "#8b5cf6",
                    "#ec4899",
                    "#06b6d4"
                ],

                borderRadius: 8

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true

                }

            }

        }

    });

}
// ================= SAVE DATA =================

function saveTransactions() {

    localStorage.setItem("transactions", JSON.stringify(transactions));

}
// ================= EDIT =================

function editTransaction(id) {

    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    text.value = transaction.text;
    amount.value = transaction.amount;
    type.value = transaction.type;
    category.value = transaction.category;
    date.value = transaction.date;
    note.value = transaction.note;

    editId = id;

    addBtn.innerHTML = "💾 Update Transaction";

    showToast("Transaction Updated", "success");

}
//------------delete--------//

function deleteTransaction(id){

    transactions = transactions.filter((item)=>item.id!==id);

    saveTransactions();

    showTransactions();

    updateSummary();

    showToast("Transaction Deleted", "warning");

}

search.addEventListener("input", showTransactions);

filterType.addEventListener("change", showTransactions);

filterCategory.addEventListener("change", showTransactions);

saveBudget.addEventListener("click", () => {

    monthlyBudget = Number(budgetInput.value);

    localStorage.setItem("monthlyBudget", monthlyBudget);

    budgetInput.value = "";

    updateSummary();

    showToast("Budget Saved Successfully", "success");
});
function showToast(message, type = "success"){

    toast.textContent = message;

    toast.className = "";

    toast.classList.add("show", type);

    setTimeout(() => {

        toast.classList.remove("show");

    },3000);

}

// Light mode load
if (localStorage.getItem("theme") === "light") {

    document.body.classList.add("light");

    themeIcon.className = "fa-solid fa-sun";

}

themeBtn.addEventListener("click", () => {
     
    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        localStorage.setItem("theme", "light");

        themeIcon.className = "fa-solid fa-sun";

    } else {

        localStorage.setItem("theme", "dark");

        themeIcon.className = "fa-solid fa-moon";

    }

});
if ("serviceWorker" in navigator) {

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("service-worker.js")

            .then(() => {

                console.log("Service Worker Registered");

            });

    });

}