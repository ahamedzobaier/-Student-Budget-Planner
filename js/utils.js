// ==========================================================================
// STUDENT BUDGET PLANNER - UTILITY HELPERS & STORAGE MANAGER
// Easy-to-read everyday functions for formatting money, storage, and modals
// ==========================================================================

// Format numbers nicely with commas and BDT currency formatting
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Full 12-Month Configuration List for dropdowns and tables
const ALL_12_MONTHS = [
    { key: '2026-01', name: 'Jan', fullName: 'January 2026' },
    { key: '2026-02', name: 'Feb', fullName: 'February 2026' },
    { key: '2026-03', name: 'Mar', fullName: 'March 2026' },
    { key: '2026-04', name: 'Apr', fullName: 'April 2026' },
    { key: '2026-05', name: 'May', fullName: 'May 2026' },
    { key: '2026-06', name: 'Jun', fullName: 'June 2026' },
    { key: '2026-07', name: 'Jul', fullName: 'July 2026' },
    { key: '2026-08', name: 'Aug', fullName: 'August 2026' },
    { key: '2026-09', name: 'Sep', fullName: 'September 2026' },
    { key: '2026-10', name: 'Oct', fullName: 'October 2026' },
    { key: '2026-11', name: 'Nov', fullName: 'November 2026' },
    { key: '2026-12', name: 'Dec', fullName: 'December 2026' }
];

// Show slide-in toast messages at the bottom right corner
function showToast(message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.display = 'flex';
        toastContainer.style.flexDirection = 'column';
        toastContainer.style.gap = '10px';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'warning-circle';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
        <i class="ph ph-${icon}" style="font-size: 1.25rem;"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Clear all local data safely after confirmation
function clearAllData() {
    if (confirm("Are you sure you want to delete all transactions, budget limits, and university semester data? This will clear all data.")) {
        localStorage.clear();
        showToast("All data cleared successfully.", "success");
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
}

// Get saved transactions array from localStorage (with auto-fix for old 'Misc' labels)
function getStoredTransactions() {
    const raw = JSON.parse(localStorage.getItem('transactions')) || [];
    return raw.map(t => {
        if (t.category === 'Misc') {
            return { ...t, category: 'Other Expenses' };
        }
        return t;
    });
}

// Get saved category budget limits
function getStoredCategoryBudgets() {
    const raw = JSON.parse(localStorage.getItem('categoryBudgets')) || {};
    if (raw['Misc']) {
        raw['Other Expenses'] = (raw['Other Expenses'] || 0) + raw['Misc'];
        delete raw['Misc'];
        localStorage.setItem('categoryBudgets', JSON.stringify(raw));
    }
    return raw;
}

// Save updated transactions array to localStorage
function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Save category budget limits to localStorage
function saveCategoryBudgets(budgets) {
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
}

// Get saved University Semester Plan
function getStoredSemesterPlan() {
    return JSON.parse(localStorage.getItem('semesterPlan')) || {
        name: '',
        duration: 0,
        income: 0,
        costs: []
    };
}

// Save University Semester Plan
function saveSemesterPlan(plan) {
    localStorage.setItem('semesterPlan', JSON.stringify(plan));
}

// ==========================================================================
// EXPENSE VALIDATION RULE: Total Expenses <= Current Balance
// ==========================================================================
function getCurrentFinancialSummary() {
    const transactions = getStoredTransactions();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
        const amt = Number(t.amount || 0);
        if (t.type === 'income') {
            totalIncome += amt;
        } else if (t.type === 'expense') {
            totalExpense += amt;
        }
    });

    const currentBalance = totalIncome - totalExpense;
    return { totalIncome, totalExpense, currentBalance };
}

// Validate if an expense can be added without exceeding current available balance
function canAffordExpense(expenseAmount) {
    const { currentBalance } = getCurrentFinancialSummary();
    return expenseAmount <= currentBalance;
}

// Show Warning Modal Popup when total expenses would exceed current balance
function showBalanceWarningModal(attemptedAmount, currentBalance) {
    let modal = document.getElementById('balance-warning-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'balance-warning-modal';
        modal.className = 'modal-backdrop';
        document.body.appendChild(modal);
    }

    const shortBy = attemptedAmount - currentBalance;

    modal.innerHTML = `
        <div class="modal-card">
            <div class="modal-header warning-modal-header">
                <h3><i class="ph ph-warning-octagon" style="color: #d97706; font-size: 1.4rem;"></i> Insufficient Balance</h3>
                <button class="modal-close-btn" onclick="closeModal('balance-warning-modal')">&times;</button>
            </div>
            <div class="warning-box">
                <i class="ph ph-warning"></i>
                <div>
                    <strong>Expense Exceeds Current Balance!</strong>
                    <p style="margin-top: 4px;">Your total expenses cannot be greater than your current available balance.</p>
                </div>
            </div>
            <div class="warning-details">
                <div><span>Expense Attempted:</span> <strong>Tk ${formatMoney(attemptedAmount)}</strong></div>
                <div><span>Current Balance Available:</span> <strong style="color: var(--green);">Tk ${formatMoney(currentBalance)}</strong></div>
                <div style="border-top: 1px dashed var(--border-color); padding-top: 6px; margin-top: 4px;">
                    <span style="color: var(--red);">Shortage Amount:</span> <strong style="color: var(--red);">Tk ${formatMoney(shortBy)}</strong>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary" onclick="closeModal('balance-warning-modal')">I Understand</button>
            </div>
        </div>
    `;

    openModal('balance-warning-modal');
}

// Generic Modal Open / Close Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}
