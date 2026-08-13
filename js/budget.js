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
function renderBudgetLimitsTable() {
    const transactions = getStoredTransactions();
    const budgets = getStoredCategoryBudgets();

    // Calculate total spent/earned per category
    const spentByCategory = {};
    transactions.forEach(t => {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
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

// Init table
renderBudgetLimitsTable();
