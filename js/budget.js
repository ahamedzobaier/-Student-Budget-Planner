// Category Budget page logic (budget.html)

const budgetTbody = document.getElementById('budget-tbody');
const budgetForm = document.getElementById('budget-set-form');
const catSelect = document.getElementById('budget-cat-select');
const limitInput = document.getElementById('budget-limit-input');

const defaultCategories = ['Mess Bill', 'Transport', 'Tuition', 'Recharge', 'Misc'];

function renderBudgetTable() {
    const transactions = getStoredTransactions();
    const budgets = getStoredCategoryBudgets();

    // Sum expenses per category for latest month (June 2026 / current month)
    const spentPerCategory = {};
    
    // Find latest month prefix in transactions or default to 2026-06
    let latestMonth = '2026-06';
    const dates = transactions.map(t => t.date).filter(Boolean).sort().reverse();
    if (dates.length > 0) {
        latestMonth = dates[0].substring(0, 7);
    }

    transactions.forEach(t => {
        if (t.type === 'expense' && t.date && t.date.startsWith(latestMonth)) {
            spentPerCategory[t.category] = (spentPerCategory[t.category] || 0) + Number(t.amount);
        }
    });

    budgetTbody.innerHTML = '';

    // Merge default categories and any extra custom categories in budgets or transactions
    const allCategories = Array.from(new Set([...defaultCategories, ...Object.keys(budgets)]));

    allCategories.forEach(cat => {
        const limit = Number(budgets[cat] || 0);
        const spent = Number(spentPerCategory[cat] || 0);
        const remaining = Math.max(0, limit - spent);
        
        let pct = 0;
        if (limit > 0) {
            pct = Math.round((spent / limit) * 100);
        }

        const isOver = limit > 0 && spent > limit;
        const statusBadge = isOver
            ? `<span class="status-badge status-over">OVER</span>`
            : `<span class="status-badge status-ok">OK</span>`;
        
        const progressColor = isOver ? 'var(--red)' : (pct >= 75 ? '#f59e0b' : 'var(--green)');

        const tr = document.createElement('tr');
        if (isOver) {
            tr.style.backgroundColor = '#fff1f2'; // Red tint alert for over budget
        }

        tr.innerHTML = `
            <td><strong>${cat}</strong></td>
            <td>Tk ${formatMoney(limit)}</td>
            <td class="${spent > 0 ? 'text-red' : ''}">Tk ${formatMoney(spent)}</td>
            <td>Tk ${formatMoney(remaining)}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="table-progress-bar">
                        <div class="table-progress-fill" style="width: ${Math.min(100, pct)}%; background-color: ${progressColor};"></div>
                    </div>
                    <span style="font-size: 0.8rem; font-weight: 600;">${pct}%</span>
                </div>
            </td>
            <td>${statusBadge}</td>
        `;

        budgetTbody.appendChild(tr);
    });
}

function setBudgetLimit(e) {
    e.preventDefault();
    const cat = catSelect.value;
    const limit = parseFloat(limitInput.value);

    if (isNaN(limit) || limit <= 0) {
        showToast('Please enter a valid positive limit', 'error');
        return;
    }

    const budgets = getStoredCategoryBudgets();
    budgets[cat] = limit;
    saveCategoryBudgets(budgets);

    limitInput.value = '';
    renderBudgetTable();
    showToast(`Monthly limit for ${cat} updated to Tk ${formatMoney(limit)}`, 'success');
}

if (budgetForm) {
    budgetForm.addEventListener('submit', setBudgetLimit);
}

// Init
renderBudgetTable();
