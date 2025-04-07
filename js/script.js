// Initialize variables to store budget data
let expenses = [];
let income = [];

// DOM elements
const expenseForm = document.getElementById('expenseForm');
const incomeForm = document.getElementById('incomeForm');
const expenseTable = document.getElementById('expenseTable');
const incomeTable = document.getElementById('incomeTable');
const totalExpensesEl = document.getElementById('totalExpenses');
const totalIncomeEl = document.getElementById('totalIncome');
const summaryIncomeEl = document.getElementById('summaryIncome');
const summaryExpensesEl = document.getElementById('summaryExpenses');
const balanceEl = document.getElementById('balance');
const categoryBreakdownEl = document.getElementById('categoryBreakdown');
const resetButton = document.getElementById('resetButton');
const exportButton = document.getElementById('exportButton');

// Load data from localStorage
function loadData() {
    const savedExpenses = localStorage.getItem('expenses');
    const savedIncome = localStorage.getItem('income');
    
    if (savedExpenses) {
        expenses = JSON.parse(savedExpenses);
    }
    
    if (savedIncome) {
        income = JSON.parse(savedIncome);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('income', JSON.stringify(income));
}

// Format currency
function formatCurrency(amount) {
    return '£' + parseFloat(amount).toFixed(2);
}

// Update the expenses table
function updateExpensesTable() {
    expenseTable.innerHTML = '';
    
    expenses.forEach((expense, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Name">${expense.name}</td>
            <td data-label="Category">${expense.category}</td>
            <td data-label="Amount">${formatCurrency(expense.amount)}</td>
            <td data-label="Action">
                <button class="btn-delete" data-index="${index}">
                    <i class="bi bi-trash">❌</i>
                </button>
            </td>
        `;
        expenseTable.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('#expenseTable .btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            expenses.splice(index, 1);
            saveData();
            updateUI();
        });
    });
}

// Update the income table
function updateIncomeTable() {
    incomeTable.innerHTML = '';
    
    income.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Source">${item.name}</td>
            <td data-label="Amount">${formatCurrency(item.amount)}</td>
            <td data-label="Action">
                <button class="btn-delete" data-index="${index}">
                    <i class="bi bi-trash">❌</i>
                </button>
            </td>
        `;
        incomeTable.appendChild(row);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('#incomeTable .btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            income.splice(index, 1);
            saveData();
            updateUI();
        });
    });
}

// Update category breakdown
function updateCategoryBreakdown() {
    categoryBreakdownEl.innerHTML = '';
    
    const totalExpenseAmount = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += parseFloat(expense.amount);
    });
    
    // Create rows for each category
    for (const category in categories) {
        const amount = categories[category];
        const percentage = totalExpenseAmount ? ((amount / totalExpenseAmount) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Category">${category}</td>
            <td data-label="Amount">${formatCurrency(amount)}</td>
            <td data-label="Percentage">${percentage}%</td>
        `;
        categoryBreakdownEl.appendChild(row);
    }
}

// Calculate totals and update summary
function updateSummary() {
    const totalExpenses = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    const totalIncome = income.reduce((total, item) => total + parseFloat(item.amount), 0);
    const balance = totalIncome - totalExpenses;
    
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
    totalIncomeEl.textContent = formatCurrency(totalIncome);
    summaryExpensesEl.textContent = formatCurrency(totalExpenses);
    summaryIncomeEl.textContent = formatCurrency(totalIncome);
    
    balanceEl.textContent = formatCurrency(balance);
    if (balance < 0) {
        balanceEl.className = 'text-danger';
    } else {
        balanceEl.className = 'text-success';
    }
}

// Update category breakdown
function updateCategoryBreakdown() {
    categoryBreakdownEl.innerHTML = '';
    
    const totalExpenseAmount = expenses.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
        if (!categories[expense.category]) {
            categories[expense.category] = 0;
        }
        categories[expense.category] += parseFloat(expense.amount);
    });
    
    // Create rows for each category
    for (const category in categories) {
        const amount = categories[category];
        const percentage = totalExpenseAmount ? ((amount / totalExpenseAmount) * 100).toFixed(1) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category}</td>
            <td>${formatCurrency(amount)}</td>
            <td>${percentage}%</td>
        `;
        categoryBreakdownEl.appendChild(row);
    }
}

// Update the entire UI
function updateUI() {
    updateExpensesTable();
    updateIncomeTable();
    updateSummary();
    updateCategoryBreakdown();
}

// Handle expense form submission
expenseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('expenseName').value;
    const category = document.getElementById('expenseCategory').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    
    expenses.push({ name, category, amount });
    saveData();
    updateUI();
    
    // Reset form
    this.reset();
});

// Handle income form submission
incomeForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('incomeName').value;
    const amount = parseFloat(document.getElementById('incomeAmount').value);
    
    income.push({ name, amount });
    saveData();
    updateUI();
    
    // Reset form
    this.reset();
});

// Handle reset button
resetButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the budget? This will delete all your data.')) {
        expenses = [];
        income = [];
        saveData();
        updateUI();
    }
});

// Handle export button
exportButton.addEventListener('click', function() {
    // Prepare data for CSV
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Type,Name,Category,Amount\n";
    
    // Add expense rows
    expenses.forEach(expense => {
        csvContent += `Expense,${expense.name},${expense.category},${expense.amount}\n`;
    });
    
    // Add income rows
    income.forEach(item => {
        csvContent += `Income,${item.name},,${item.amount}\n`;
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "budget.csv");
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
});

// Initialize the application
loadData();
updateUI();
