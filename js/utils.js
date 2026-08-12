// Format Number to currency string
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

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
    if (confirm("Are you sure you want to delete all transactions and budget limits? This will clear all data.")) {
        localStorage.clear();
        showToast("All data cleared successfully.", "success");
        setTimeout(() => {
            window.location.reload();
        }, 800);
    }
}

// Storage Helpers & Data Retrieval
function getStoredTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

function getStoredCategoryBudgets() {
    return JSON.parse(localStorage.getItem('categoryBudgets')) || {};
}

function saveTransactions(transactions) {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function saveCategoryBudgets(budgets) {
    localStorage.setItem('categoryBudgets', JSON.stringify(budgets));
}
