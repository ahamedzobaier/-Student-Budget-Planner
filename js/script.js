// Dashboard logic (index.html)

const balanceEl = document.getElementById('current-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const goalEl = document.getElementById('remaining-goal');

const formEl = document.getElementById('transaction-form');
const typeEl = document.getElementById('type');
const amountEl = document.getElementById('amount');
const categoryEl = document.getElementById('category');
const descriptionEl = document.getElementById('description');
const recentListEl = document.getElementById('recent-transaction-list');
const alertContainer = document.getElementById('budget-alert-container');

let transactions = getStoredTransactions();

function updateDashboard() {
    transactions = getStoredTransactions();
    
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        if (t.type === 'income') {
            totalIncome += Number(t.amount);
        } else {
            totalExpense += Number(t.amount);
        }
    });

    const currentBalance = totalIncome - totalExpense;
    
    // Remaining goal / budget progress calculation (% of income remaining)
    let remainingGoalPct = 100;
    if (totalIncome > 0) {
        const pct = ((totalIncome - totalExpense) / totalIncome) * 100;
        remainingGoalPct = Math.max(0, Math.round(pct));
    } else if (totalExpense > 0) {
        remainingGoalPct = 0;
    }

    if (balanceEl) balanceEl.innerText = formatMoney(currentBalance);
    if (incomeEl) incomeEl.innerText = formatMoney(totalIncome);
    if (expenseEl) expenseEl.innerText = formatMoney(totalExpense);
    if (goalEl) goalEl.innerText = remainingGoalPct;

    checkBudgetAlerts(totalIncome, totalExpense);
    renderRecentTransactions();
}

function checkBudgetAlerts(income, expense) {
    if (!alertContainer) return;
    alertContainer.innerHTML = '';
    
    if (income === 0 && expense > 0) {
        showAlert('Warning: You have logged expenses but no income!', 'alert-warning');
        return;
    }
    
    if (income > 0) {
        const percentage = (expense / income) * 100;
        if (percentage >= 100) {
            showAlert('Critical Alert: Expenses have exceeded total logged income!', 'alert-danger');
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

function renderRecentTransactions() {
    if (!recentListEl) return;
    recentListEl.innerHTML = '';

    if (transactions.length === 0) {
        recentListEl.innerHTML = '<div class="empty-state">No transactions yet. Add one above!</div>';
        return;
    }

    // Sort newest first by date or id, take top 5
    const sorted = [...transactions].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id).slice(0, 5);

    sorted.forEach(t => {
        const sign = t.type === 'income' ? '+' : '-';
        const typeClass = t.type === 'income' ? 'income' : 'expense';
        const descText = t.description || t.category;

        const item = document.createElement('div');
        item.classList.add('transaction-item');
        item.innerHTML = `
            <div class="t-info">
                <span class="t-desc">${descText}</span>
                <span class="t-category">${t.category}</span>
            </div>
            <div class="t-right">
                <span class="t-amount ${typeClass}">${sign}Tk ${formatMoney(t.amount)}</span>
            </div>
        `;
        recentListEl.appendChild(item);
    });
}

function addTransaction(e) {
    e.preventDefault();

    const amt = parseFloat(amountEl.value);
    if (isNaN(amt) || amt <= 0) {
        showToast('Please enter a valid positive amount', 'error');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newTransaction = {
        id: Date.now(),
        type: typeEl.value,
        amount: amt,
        category: categoryEl.value,
        description: descriptionEl.value.trim(),
        date: today
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);

    amountEl.value = '';
    descriptionEl.value = '';
    
    updateDashboard();
    showToast('Transaction added successfully!', 'success');
}

// Category option toggle based on Type select
if (typeEl) {
    typeEl.addEventListener('change', () => {
        if (typeEl.value === 'income') {
            categoryEl.innerHTML = `
                <option value="Income">Income (Allowance / Stipend)</option>
                <option value="Tutoring">Part-time Tutoring</option>
                <option value="Scholarship">Scholarship</option>
                <option value="Other">Other Income</option>
            `;
        } else {
            categoryEl.innerHTML = `
                <option value="Mess Bill">Mess Bill</option>
                <option value="Transport">Transport</option>
                <option value="Recharge">Recharge</option>
                <option value="Tuition">Tuition</option>
                <option value="Other Expenses">Other Expenses</option>
            `;
        }
    });
}

if (formEl) {
    formEl.addEventListener('submit', addTransaction);
}

// Init Dashboard
updateDashboard();
