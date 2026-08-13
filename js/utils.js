// ==========================================================================
// STUDENT BUDGET PLANNER - UTILITY HELPERS & STORAGE MANAGER
// Easy-to-read everyday functions for formatting money, storage, and modals
// ==========================================================================

// Format numbers nicely with commas and BDT currency formatting
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Category Constants for Expense and Income
const EXPENSE_CATEGORIES = [
    { value: 'Mess Bill', label: 'Mess & Dining Bill' },
    { value: 'Recharge', label: 'Mobile Recharge & Data' },
    { value: 'Tuition', label: 'University Tuition & Fees' },
    { value: 'Other Expenses', label: 'Other Daily Expenses' }
];

const INCOME_CATEGORIES = [
    { value: 'Income', label: 'Family Support / Allowance' },
    { value: 'Tutoring', label: 'Part-time Tutoring' },
    { value: 'Scholarship', label: 'Stipend & Scholarship' },
    { value: 'Other Income', label: 'Other Income' }
];

// Dynamically filter Category dropdown based on Transaction Type (Income vs Expense)
function setupDynamicCategoryDropdown(typeSelectId, categorySelectId) {
    const typeEl = document.getElementById(typeSelectId);
    const catEl = document.getElementById(categorySelectId);
    if (!typeEl || !catEl) return;

    function updateOptions() {
        const selectedType = typeEl.value;
        const list = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
        const currentVal = catEl.value;

        catEl.innerHTML = '';
        list.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.value;
            opt.textContent = cat.label;
            catEl.appendChild(opt);
        });

        if (list.some(c => c.value === currentVal)) {
            catEl.value = currentVal;
        }
    }

    typeEl.addEventListener('change', updateOptions);
    updateOptions();
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

// Get saved Student Profile details from localStorage
function getStoredStudentProfile() {
    return JSON.parse(localStorage.getItem('studentProfile')) || {
        name: 'Zobaier Hasan',
        university: 'Uttara University',
        department: 'Computer Science (CSE)',
        studentId: '2241081345',
        semester: 'Summer 2026'
    };
}

// Save Student Profile details to localStorage
function saveStudentProfile(profile) {
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    updateAvatarInitial();
}

// Update avatar initial letter across the page
function updateAvatarInitial() {
    const profile = getStoredStudentProfile();
    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'S';
    document.querySelectorAll('.avatar').forEach(el => {
        el.innerText = initial;
    });
}

// Show Interactive Demo Student Profile Modal Popover (with View & Edit modes)
function openProfileModal() {
    let modal = document.getElementById('demo-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'demo-profile-modal';
        modal.className = 'modal-backdrop profile-modal-no-blur';

        // Close when clicking outside card
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal('demo-profile-modal');
            }
        });

        document.body.appendChild(modal);
    }

    renderProfileViewMode();
    openModal('demo-profile-modal');
}

// Render View Mode inside Profile Modal
function renderProfileViewMode() {
    const modal = document.getElementById('demo-profile-modal');
    if (!modal) return;

    const profile = getStoredStudentProfile();
    const { totalIncome, totalExpense, currentBalance } = getCurrentFinancialSummary();
    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'S';

    modal.innerHTML = `
        <div class="modal-card profile-popover-card">
            <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #1e293b 0%, #475569 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.15rem; box-shadow: var(--shadow-md); border: 2px solid #6366f1;">${initial}</div>
                    <div>
                        <h3 style="font-size: 1.05rem; color: var(--text-main); font-weight: 700;">${profile.name}</h3>
                        <span style="font-size: 0.76rem; color: var(--green); font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                            <span style="width: 7px; height: 7px; background-color: var(--green); border-radius: 50%; display: inline-block;"></span> Active Account
                        </span>
                    </div>
                </div>
                <button class="modal-close-btn" onclick="closeModal('demo-profile-modal')">&times;</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background-color: #f8fafc; padding: 12px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.825rem;">
                        <span style="color: var(--text-muted);">University:</span>
                        <strong style="color: var(--text-main);">${profile.university}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.825rem;">
                        <span style="color: var(--text-muted);">Department:</span>
                        <strong style="color: var(--text-main);">${profile.department}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.825rem;">
                        <span style="color: var(--text-muted);">Student ID:</span>
                        <strong style="color: var(--text-main);">${profile.studentId}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.825rem;">
                        <span style="color: var(--text-muted);">Semester:</span>
                        <strong style="color: var(--text-main);">${profile.semester}</strong>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 8px 10px; border-radius: 10px; text-align: center;">
                        <span style="font-size: 0.725rem; color: #166534; font-weight: 600;">Total Income</span>
                        <div style="font-weight: 700; font-size: 1rem; color: var(--green); margin-top: 2px;">Tk ${formatMoney(totalIncome)}</div>
                    </div>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 8px 10px; border-radius: 10px; text-align: center;">
                        <span style="font-size: 0.725rem; color: #991b1b; font-weight: 600;">Total Expense</span>
                        <div style="font-weight: 700; font-size: 1rem; color: var(--red); margin-top: 2px;">Tk ${formatMoney(totalExpense)}</div>
                    </div>
                </div>

                <div style="background-color: #f1f5f9; padding: 10px 14px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.825rem; font-weight: 600; color: var(--text-main);">Available Balance:</span>
                    <strong style="font-size: 1.05rem; color: var(--primary-color);">Tk ${formatMoney(currentBalance)}</strong>
                </div>
            </div>

            <div class="modal-footer" style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-color); display: flex; gap: 8px;">
                <button class="btn-primary" onclick="renderProfileEditMode()" style="flex: 1; padding: 8px; font-size: 0.85rem;"><i class="ph ph-pencil-simple"></i> Edit Profile</button>
                <button class="btn-secondary" onclick="closeModal('demo-profile-modal')" style="flex: 1; padding: 8px; font-size: 0.85rem;">Close</button>
            </div>
        </div>
    `;
}

// Render Edit Mode inside Profile Modal
function renderProfileEditMode() {
    const modal = document.getElementById('demo-profile-modal');
    if (!modal) return;

    const profile = getStoredStudentProfile();

    modal.innerHTML = `
        <div class="modal-card profile-popover-card">
            <div class="modal-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px;">
                <h3 style="font-size: 1.05rem; color: var(--text-main); font-weight: 700;"><i class="ph ph-pencil-simple" style="color: #6366f1;"></i> Edit Student Details</h3>
                <button class="modal-close-btn" onclick="renderProfileViewMode()">&times;</button>
            </div>

            <form id="edit-profile-form" style="display: flex; flex-direction: column; gap: 10px;">
                <div class="form-group">
                    <label style="font-size: 0.775rem; font-weight: 600;">Student Name</label>
                    <input type="text" id="prof-name" value="${profile.name}" required style="padding: 7px 10px; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label style="font-size: 0.775rem; font-weight: 600;">University</label>
                    <input type="text" id="prof-uni" value="${profile.university}" required style="padding: 7px 10px; font-size: 0.85rem;">
                </div>
                <div class="form-group">
                    <label style="font-size: 0.775rem; font-weight: 600;">Department</label>
                    <input type="text" id="prof-dept" value="${profile.department}" required style="padding: 7px 10px; font-size: 0.85rem;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div class="form-group">
                        <label style="font-size: 0.775rem; font-weight: 600;">Student ID</label>
                        <input type="text" id="prof-id" value="${profile.studentId}" required style="padding: 7px 10px; font-size: 0.85rem;">
                    </div>
                    <div class="form-group">
                        <label style="font-size: 0.775rem; font-weight: 600;">Semester</label>
                        <input type="text" id="prof-sem" value="${profile.semester}" required style="padding: 7px 10px; font-size: 0.85rem;">
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px; margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn-secondary" onclick="renderProfileViewMode()" style="flex: 1; padding: 8px; font-size: 0.85rem;">Cancel</button>
                    <button type="submit" class="btn-primary" style="flex: 1; padding: 8px; font-size: 0.85rem;">Save Profile</button>
                </div>
            </form>
        </div>
    `;

    const editForm = document.getElementById('edit-profile-form');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const updatedProfile = {
                name: document.getElementById('prof-name').value.trim(),
                university: document.getElementById('prof-uni').value.trim(),
                department: document.getElementById('prof-dept').value.trim(),
                studentId: document.getElementById('prof-id').value.trim(),
                semester: document.getElementById('prof-sem').value.trim()
            };

            saveStudentProfile(updatedProfile);
            showToast('Student profile details updated successfully!', 'success');
            renderProfileViewMode();
        });
    }
}

// Auto-attach avatar click handlers and sync avatar letter when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    updateAvatarInitial();
    const avatarEls = document.querySelectorAll('.avatar, .user-profile');
    avatarEls.forEach(el => {
        el.style.cursor = 'pointer';
        el.addEventListener('click', openProfileModal);
    });
});
