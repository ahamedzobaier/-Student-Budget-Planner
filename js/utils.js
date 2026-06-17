// Format Number to currency string
function formatMoney(amount) {
    return Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Toast Notification System
function showToast(message, type = 'success') {
    // Check if container exists, if not create it
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

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300); // match CSS transition duration
    }, 3000);
}

// Clear All Data
function clearAllData() {
    if (confirm("Are you sure you want to delete all transactions and budgets? This cannot be undone.")) {
        localStorage.clear();
        showToast("All data cleared successfully.", "success");
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}
