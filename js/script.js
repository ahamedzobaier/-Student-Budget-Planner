// DOM Elements
const balanceEl = document.getElementById('current-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const formEl = document.getElementById('transaction-form');
const typeEl = document.getElementById('type');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const descriptionEl = document.getElementById('description');
const alertContainer = document.getElementById('budget-alert-container');
const budgetForm = document.getElementById('budget-form');
const budgetCategoryEl = document.getElementById('budget-category');
const budgetLimitEl = document.getElementById('budget-limit');
const categoryAlertsList = document.getElementById('category-alerts-list');

// Chart Instances
let spendingChart = null;
let incomeExpenseChart = null;

// Global State
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let categoryBudgets = JSON.parse(localStorage.getItem('categoryBudgets')) || {};

// Format Number to currency string
// (Moved to utils.js)

// Update Dashboard Numbers and Alerts
function updateDashboard() {
    const amounts = transactions.map(t => t.type === 'income' ? t.amount : -t.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0);
    const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0);
    const expense = amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1;

    balanceEl.innerText = formatMoney(total);
    incomeEl.innerText = formatMoney(income);
    expenseEl.innerText = formatMoney(expense);

    checkBudgetAlerts(income, expense);
}

// Color-Coded Budget Alerts
function checkBudgetAlerts(income, expense) {
    alertContainer.innerHTML = ''; // Clear existing alerts
    
    if (income === 0 && expense > 0) {
        showAlert('Warning: You have expenses but no logged income!', 'alert-warning');
        return;
    }
    
    if (income > 0) {
        const percentage = (expense / income) * 100;
        if (percentage >= 100) {
            showAlert('Critical Alert: You have exceeded your total income!', 'alert-danger');
        } else if (percentage >= 80) {
            showAlert(`Warning: You have spent ${percentage.toFixed(1)}% of your income. Pace yourself!`, 'alert-warning');
        }
    }
}

function showAlert(message, typeClass) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${typeClass}`;
    alertDiv.innerHTML = `<strong>Alert:</strong> ${message}`;
    alertContainer.appendChild(alertDiv);
}

// Render Transactions in History
function renderTransactions() {
    listEl.innerHTML = '';
    
    if (transactions.length === 0) {
        listEl.innerHTML = '<div class="empty-state">No transactions yet. Add one above!</div>';
        return;
    }

    const sortedTransactions = [...transactions].reverse();

    sortedTransactions.forEach(transaction => {
        const sign = transaction.type === 'income' ? '+' : '-';
        const typeClass = transaction.type === 'income' ? 'income' : 'expense';
        const descText = transaction.description || transaction.category;
        
        const item = document.createElement('div');
        item.classList.add('transaction-item');
        item.innerHTML = `
            <div class="t-info">
                <span class="t-desc">${descText}</span>
                <span class="t-category">${transaction.category}</span>
            </div>
            <div class="t-right">
                <span class="t-amount ${typeClass}">${sign}৳${formatMoney(transaction.amount)}</span>
                <button class="btn-delete" onclick="removeTransaction(${transaction.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        listEl.appendChild(item);
    });
}

// Render Chart.js Spending Insights
function renderChart() {
    const expenses = transactions.filter(t => t.type === 'expense');
    const chartCanvas = document.getElementById('spendingChart');
    const emptyState = document.getElementById('empty-chart-state');

    if (expenses.length === 0) {
        chartCanvas.style.display = 'none';
        emptyState.style.display = 'block';
        if (spendingChart) {
            spendingChart.destroy();
            spendingChart = null;
        }
        return;
    }

    chartCanvas.style.display = 'block';
    emptyState.style.display = 'none';

    const categoryTotals = {};
    expenses.forEach(t => {
        if (!categoryTotals[t.category]) {
            categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Bangladesh themed aesthetic colors
    const bgColors = [
        '#10b981', // Emerald green
        '#3b82f6', // Blue
        '#f59e0b', // Amber
        '#ef4444', // Red
        '#8b5cf6', // Purple
        '#ec4899', // Pink
        '#64748b'  // Slate
    ];

    if (spendingChart) {
        spendingChart.destroy();
    }

    // Render Spending (Doughnut) Chart
    const ctx = chartCanvas.getContext('2d');
    spendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Inter', size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed !== null) {
                                label += '৳' + formatMoney(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Render Income vs Expense (Bar) Chart
    const incExpCanvas = document.getElementById('incomeExpenseChart');
    if (!incExpCanvas) return;

    if (incomeExpenseChart) {
        incomeExpenseChart.destroy();
    }

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const ctxIncExp = incExpCanvas.getContext('2d');
    incomeExpenseChart = new Chart(ctxIncExp, {
        type: 'bar',
        data: {
            labels: ['Total Income', 'Total Expense'],
            datasets: [{
                label: 'Amount (৳)',
                data: [totalIncome, totalExpense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '৳' + formatMoney(context.parsed.y);
                        }
                    }
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

// Add New Transaction
function addTransaction(e) {
    e.preventDefault();

    if (amountEl.value.trim() === '' || categoryEl.value.trim() === '') {
        showToast('Please add amount and category', 'error');
        return;
    }

    const transaction = {
        id: Math.floor(Math.random() * 100000000),
        type: typeEl.value,
        amount: +amountEl.value,
        category: categoryEl.value,
        description: descriptionEl.value,
        date: new Date().toISOString()
    };

    transactions.push(transaction);
    updateLocalStorage();
    init();

    amountEl.value = '';
    descriptionEl.value = '';
    showToast('Transaction added successfully!', 'success');
}

// Remove Transaction
function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
    showToast('Transaction removed', 'info');
}

// Update Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('categoryBudgets', JSON.stringify(categoryBudgets));
}

// Set Category Budget
function setBudget(e) {
    e.preventDefault();
    const cat = budgetCategoryEl.value;
    const limit = +budgetLimitEl.value;
    if (limit <= 0) return;
    
    categoryBudgets[cat] = limit;
    updateLocalStorage();
    budgetLimitEl.value = '';
    init();
    showToast(`Budget for ${cat} set to ৳${formatMoney(limit)}`, 'success');
}

// Render Category Alerts
function renderCategoryAlerts() {
    if (Object.keys(categoryBudgets).length === 0) {
        categoryAlertsList.innerHTML = '<div class="empty-state">No category budgets set yet.</div>';
        return;
    }
    
    categoryAlertsList.innerHTML = '';
    
    // Calculate spent per category
    const expenses = transactions.filter(t => t.type === 'expense');
    const spentPerCategory = {};
    expenses.forEach(t => {
        spentPerCategory[t.category] = (spentPerCategory[t.category] || 0) + t.amount;
    });
    
    Object.keys(categoryBudgets).forEach(cat => {
        const limit = categoryBudgets[cat];
        const spent = spentPerCategory[cat] || 0;
        const percentage = Math.min((spent / limit) * 100, 100);
        
        let colorClass = 'bg-green';
        let statusText = 'Safe';
        
        if (spent > limit) {
            colorClass = 'bg-red';
            statusText = 'Overspent!';
        } else if (percentage >= 75) {
            colorClass = 'bg-yellow';
            statusText = 'Caution';
        }
        
        const item = document.createElement('div');
        item.style.border = '1px solid var(--border-color)';
        item.style.padding = '12px';
        item.style.borderRadius = 'var(--radius-md)';
        item.style.backgroundColor = '#fff';
        
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <strong>${cat}</strong>
                <span style="font-size: 0.875rem;">${statusText} (৳${formatMoney(spent)} / ৳${formatMoney(limit)})</span>
            </div>
            <div style="width: 100%; background-color: #e5e7eb; border-radius: 999px; height: 8px; overflow: hidden;">
                <div class="${colorClass}" style="width: ${percentage}%; height: 100%; transition: width 0.3s ease;"></div>
            </div>
        `;
        categoryAlertsList.appendChild(item);
    });
}

// Toggle income/expense options (Localized)
typeEl.addEventListener('change', () => {
    if (typeEl.value === 'income') {
        categoryEl.innerHTML = `
            <option value="Family Support">Family Support</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Stipend">Stipend/Scholarship</option>
            <option value="Other Income">Other</option>
        `;
    } else {
        categoryEl.innerHTML = `
            <option value="Mess Bill">Mess Bill</option>
            <option value="Rickshaw Fare">Rickshaw Fare</option>
            <option value="Mobile Recharge">Mobile Recharge</option>
            <option value="Photocopy/Print">Photocopy/Print</option>
            <option value="Food">Food/Snacks</option>
            <option value="Tuition">Tuition Fee</option>
            <option value="Other">Other Expense</option>
        `;
    }
});

// Init App
function init() {
    updateDashboard();
    renderTransactions();
    renderChart();
    renderCategoryAlerts();
}

formEl.addEventListener('submit', addTransaction);
budgetForm.addEventListener('submit', setBudget);

// Run init on load
init();
