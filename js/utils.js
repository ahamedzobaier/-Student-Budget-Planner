// Format Number to currency string
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// 12-Month Configuration List
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

// Toast Notification System
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

// Clear All User Data
function clearAllData() {
    if (confirm("Are you sure you want to delete all transactions, budget limits, and university semester data? This will clear all data.")) {
        localStorage.clear();
        showToast("All data cleared successfully.", "success");
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
}

// Storage Helpers & Data Retrieval
function getStoredTransactions() {
    const raw = JSON.parse(localStorage.getItem('transactions')) || [];
    return raw.map(t => {
        if (t.category === 'Misc') {
            return { ...t, category: 'Other Expenses' };
        }
        return t;
    });
}

function getStoredCategoryBudgets() {
    const raw = JSON.parse(localStorage.getItem('categoryBudgets')) || {};
    if (raw['Misc']) {
        raw['Other Expenses'] = (raw['Other Expenses'] || 0) + raw['Misc'];
        delete raw['Misc'];
        localStorage.setItem('categoryBudgets', JSON.stringify(raw));
    }
    return raw;
}

function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveCategoryBudgets(budgets) {
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
}

// University Semester Plan Storage Helpers (Zero Demo Fallback)
function getStoredSemesterPlan() {
    return JSON.parse(localStorage.getItem('semesterPlan')) || {
        name: '',
        duration: 0,
        income: 0,
        costs: []
    };
}

function saveSemesterPlan(plan) {
    localStorage.setItem('semesterPlan', JSON.stringify(plan));
}
