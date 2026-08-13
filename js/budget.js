// ==========================================================================
// CATEGORY BUDGET LIMITS CONTROLLER (budget.js)
// Manages category spending limits, spent calculations, and progress indicators
// ==========================================================================

const budgetTbody = document.getElementById('budget-tbody');
const modalBudgetForm = document.getElementById('modal-budget-form');

const defaultCategories = ['Mess Bill', 'Tuition', 'Recharge', 'Other Expenses'];

const categoryHumanNames = {
    'Mess Bill': 'Mess & Dining Bill',
    'Tuition': 'University Tuition & Fees',
    'Recharge': 'Mobile Recharge & Data',
    'Other Expenses': 'Other Daily Expenses',
    'Income': 'Family Support / Allowance',
    'Tutoring': 'Part-time Tutoring',
    'Scholarship': 'Stipend & Scholarship',
    'Other Income': 'Other Income'
};

function getHumanCategoryName(cat) {
    return categoryHumanNames[cat] || cat;
}

// Render the Category Budget Limits Table
const budgetMonthSelect = document.getElementById('budget-month-select');
const budgetYearSelect = document.getElementById('budget-year-select');

// Auto-select current month (e.g. August = 8) on load
function initBudgetMonthSelect() {
    if (!budgetMonthSelect) return;
    if (!budgetMonthSelect.value) {
        const currentMonth = (new Date().getMonth() + 1).toString();
        budgetMonthSelect.value = currentMonth;
    }
}

// Populate Year Selector for Budget Page
function populateBudgetYearSelect() {
    if (!budgetYearSelect) return;

    const transactions = getStoredTransactions();
    const years = new Set();
    const currentYear = new Date().getFullYear();
    years.add(currentYear);

    transactions.forEach(t => {
        if (t.date) {
            const yr = parseInt(t.date.split('-')[0], 10);
            if (!isNaN(yr)) years.add(yr);
        }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    const prevVal = budgetYearSelect.value;

    budgetYearSelect.innerHTML = '<option value="all">All Years</option>';
    sortedYears.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        budgetYearSelect.appendChild(opt);
    });

    if (prevVal && Array.from(budgetYearSelect.options).some(o => o.value === prevVal)) {
        budgetYearSelect.value = prevVal;
    } else {
        budgetYearSelect.value = currentYear.toString();
    }
}

// Render Budget Limits Table for selected month and year
function renderBudgetLimitsTable() {
    const transactions = getStoredTransactions();
    const budgets = getStoredCategoryBudgets();

    const currentYearStr = new Date().getFullYear().toString();
    const currentMonthNum = (new Date().getMonth() + 1).toString();

    const selectedMonth = budgetMonthSelect ? budgetMonthSelect.value : currentMonthNum;
    const selectedYear = budgetYearSelect ? budgetYearSelect.value : currentYearStr;

    // Calculate total spent per category for selected month and year
    const spentByCategory = {};
    transactions.forEach(t => {
        if (t.type === 'expense' && t.category && t.date) {
            const parts = t.date.split('-');
            const txYr = parts[0];
            const txMo = parseInt(parts[1], 10).toString();

            if (selectedYear !== 'all' && txYr !== selectedYear) return;
            if (selectedMonth !== 'all' && txMo !== selectedMonth) return;

            spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
        }
    });

    if (!budgetTbody) return;
    budgetTbody.innerHTML = '';

    // Render default categories plus any additional categories with custom limits set
    const categoriesToRender = Array.from(new Set([...defaultCategories, ...Object.keys(budgets)]));

    categoriesToRender.forEach(cat => {
        const limit = Number(budgets[cat] || 0);
        const spent = Number(spentByCategory[cat] || 0);
        const remaining = limit > 0 ? limit - spent : 0;
        
        let percent = 0;
        if (limit > 0) {
            percent = Math.min(100, Math.round((spent / limit) * 100));
        }

        let badgeClass = 'status-ok';
        let badgeText = 'Within Budget';
        let barColor = 'var(--green)';

        if (limit === 0) {
            badgeClass = 'status-pending';
            badgeText = 'No Limit Set';
            barColor = '#94a3b8';
        } else if (spent > limit) {
            badgeClass = 'status-over';
            badgeText = 'Over Limit!';
            barColor = 'var(--red)';
        } else if (percent >= 85) {
            badgeClass = 'status-pending';
            badgeText = 'Near Limit';
            barColor = 'var(--amber)';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${getHumanCategoryName(cat)}</strong></td>
            <td>${limit > 0 ? 'Tk ' + formatMoney(limit) : '<em>Not set</em>'}</td>
            <td class="text-red">Tk ${formatMoney(spent)}</td>
            <td style="font-weight: 600;">${limit > 0 ? 'Tk ' + formatMoney(remaining) : '-'}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="table-progress-bar">
                        <div class="table-progress-fill" style="width: ${percent}%; background-color: ${barColor};"></div>
                    </div>
                    <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${percent}%</span>
                </div>
            </td>
            <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
        `;
        budgetTbody.appendChild(tr);
    });
}

// Auto-fill existing limit when category changes in modal
const modalBudgetCat = document.getElementById('modal-budget-cat');
const modalBudgetLimit = document.getElementById('modal-budget-limit');

function syncModalCategoryLimit() {
    if (!modalBudgetCat || !modalBudgetLimit) return;
    const cat = modalBudgetCat.value;
    const budgets = getStoredCategoryBudgets();
    if (budgets[cat]) {
        modalBudgetLimit.value = budgets[cat];
    } else {
        modalBudgetLimit.value = '';
    }
}

if (modalBudgetCat) {
    modalBudgetCat.addEventListener('change', syncModalCategoryLimit);
}

// Save budget limit for a category
function saveCategoryLimit(category, limitAmount) {
    const limit = parseFloat(limitAmount);
    if (isNaN(limit) || limit <= 0) {
        showToast('Please enter a valid monthly limit amount', 'error');
        return false;
    }

    const budgets = getStoredCategoryBudgets();
    budgets[category] = limit;
    saveCategoryBudgets(budgets);

    renderBudgetLimitsTable();
    showToast(`Monthly limit for ${getHumanCategoryName(category)} updated to Tk ${formatMoney(limit)}`, 'success');
    return true;
}

// Handle Modal Budget Form Submit
if (modalBudgetForm) {
    modalBudgetForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const cat = document.getElementById('modal-budget-cat').value;
        const limit = document.getElementById('modal-budget-limit').value;

        const success = saveCategoryLimit(cat, limit);
        if (success) {
            modalBudgetForm.reset();
            closeModal('set-budget-modal');
        }
    });
}

[budgetMonthSelect, budgetYearSelect].forEach(el => {
    if (el) el.addEventListener('change', renderBudgetLimitsTable);
});

// Initial setup
initBudgetMonthSelect();
populateBudgetYearSelect();
renderBudgetLimitsTable();
syncModalCategoryLimit();
