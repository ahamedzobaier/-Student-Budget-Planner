// ==========================================================================
// DASHBOARD CONTROLLER (script.js)
// Handles balance stat updates, transaction additions, and balance validations
// ==========================================================================

const modalTransactionForm = document.getElementById('modal-transaction-form');

const currentBalanceEl = document.getElementById('current-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const remainingGoalEl = document.getElementById('remaining-goal');
const recentListEl = document.getElementById('recent-transaction-list');
const alertContainer = document.getElementById('budget-alert-container');

// Load stored transactions and budgets from localStorage
let transactions = getStoredTransactions();
let categoryBudgets = getStoredCategoryBudgets();

// Update all stat cards, alert banners, and recent transaction list
function updateDashboardUI() {
    transactions = getStoredTransactions();
    categoryBudgets = getStoredCategoryBudgets();

    let incomeTotal = 0;
    let expenseTotal = 0;

    transactions.forEach(t => {
        const amt = Number(t.amount || 0);
        if (t.type === 'income') {
            incomeTotal += amt;
        } else if (t.type === 'expense') {
            expenseTotal += amt;
        }
    });

    const netBalance = incomeTotal - expenseTotal;

    // Update Top 4 Stat Cards
    if (currentBalanceEl) currentBalanceEl.innerText = formatMoney(netBalance);
    if (totalIncomeEl) totalIncomeEl.innerText = formatMoney(incomeTotal);
    if (totalExpenseEl) totalExpenseEl.innerText = formatMoney(expenseTotal);

    // Calculate remaining budget percentage
    if (remainingGoalEl) {
        if (incomeTotal > 0) {
            const percentRemaining = Math.max(0, Math.round((netBalance / incomeTotal) * 100));
            remainingGoalEl.innerText = percentRemaining;
        } else {
            remainingGoalEl.innerText = netBalance <= 0 ? 0 : 100;
        }
    }

    // Render Recent 5 Transactions
    renderRecentTransactions();

    // Check Category Spending Limits for Warning Banners
    checkBudgetWarnings(transactions);
}

// Render the 5 most recent transactions on the dashboard
function renderRecentTransactions() {
    if (!recentListEl) return;
    recentListEl.innerHTML = '';

    if (transactions.length === 0) {
        recentListEl.innerHTML = '<div class="empty-state">No transactions logged yet. Add your first income or expense above!</div>';
        return;
    }

    // Sort newest first
    const sorted = [...transactions].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);
    const recent = sorted.slice(0, 5);

    recent.forEach(t => {
        const item = document.createElement('div');
        item.className = 'transaction-item';

        const isInc = t.type === 'income';
        const sign = isInc ? '+' : '-';
        const amtClass = isInc ? 'income' : 'expense';
        const note = t.description || t.category;

        item.innerHTML = `
            <div class="t-info">
                <span class="t-desc">${note}</span>
                <span class="t-category">${t.category}</span>
            </div>
            <div class="t-right">
                <span class="t-amount ${amtClass}">${sign}Tk ${formatMoney(t.amount)}</span>
            </div>
        `;
        recentListEl.appendChild(item);
    });
}

// Check category spending limits and show warning banners if over limit
function checkBudgetWarnings(allTransactions) {
    if (!alertContainer) return;
    alertContainer.innerHTML = '';

    const expensesByCategory = {};
    allTransactions.forEach(t => {
        if (t.type === 'expense') {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Number(t.amount);
        }
    });

    Object.keys(categoryBudgets).forEach(cat => {
        const limit = Number(categoryBudgets[cat] || 0);
        const spent = Number(expensesByCategory[cat] || 0);

        if (limit > 0 && spent > limit) {
            const overBy = spent - limit;
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.innerHTML = `<i class="ph ph-warning-diamond" style="margin-right: 6px;"></i><strong>${cat} Budget Alert:</strong> You have exceeded your monthly limit by Tk ${formatMoney(overBy)}! (Spent Tk ${formatMoney(spent)} / Limit Tk ${formatMoney(limit)})`;
            alertContainer.appendChild(alertDiv);
        }
    });
}

// Add transaction with strict Total Expenses <= Current Balance validation rule
function handleAddTransaction(type, amount, category, description) {
    const amt = parseFloat(amount);

    if (isNaN(amt) || amt <= 0) {
        showToast('Please enter a valid amount greater than 0', 'error');
        return false;
    }

    // STRICT VALIDATION RULE: Total Expenses cannot exceed Current Balance
    if (type === 'expense') {
        const { currentBalance } = getCurrentFinancialSummary();
        if (amt > currentBalance) {
            // Show friendly Balance Warning Modal Popup and block saving invalid transaction
            showBalanceWarningModal(amt, currentBalance);
            return false;
        }
    }

    // Build new transaction object
    const newTransaction = {
        id: Date.now(),
        type: type,
        amount: amt,
        category: category,
        description: description,
        date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    };

    transactions.push(newTransaction);
    saveTransactions(transactions);

    updateDashboardUI();
    showToast(`${type === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    return true;
}

// Handle Modal Popup Form Submit
if (modalTransactionForm) {
    modalTransactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('modal-type').value;
        const amount = document.getElementById('modal-amount').value;
        const category = document.getElementById('modal-category').value;
        const description = document.getElementById('modal-description').value;

        const success = handleAddTransaction(type, amount, category, description);
        if (success) {
            modalTransactionForm.reset();
            closeModal('add-transaction-modal');
        }
    });
}

// Initialize Dashboard UI & Dynamic Category Dropdowns on load
setupDynamicCategoryDropdown('modal-type', 'modal-category');

updateDashboardUI();
