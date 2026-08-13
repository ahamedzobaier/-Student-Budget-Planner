// ==========================================================================
// TRANSACTIONS LOG CONTROLLER (transactions.js)
// Handles searching, multi-criteria filtering, and transaction log rendering
// ==========================================================================

const typeFilter = document.getElementById('filter-type');
const categoryFilter = document.getElementById('filter-category');
const yearFilter = document.getElementById('filter-year');
const monthFilter = document.getElementById('filter-month');
const searchInput = document.getElementById('search-input');
const tbody = document.getElementById('transactions-tbody');
const summaryBadge = document.getElementById('filter-summary-badge');
const modalTransactionForm = document.getElementById('modal-transaction-form');

let transactions = getStoredTransactions();

// Populate Year Filter dropdown dynamically from transactions
function populateYearFilter() {
    if (!yearFilter) return;

    transactions = getStoredTransactions();
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
    const selectedVal = yearFilter.value;

    yearFilter.innerHTML = '<option value="all">All Years</option>';
    sortedYears.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        yearFilter.appendChild(opt);
    });

    if (selectedVal && Array.from(yearFilter.options).some(o => o.value === selectedVal)) {
        yearFilter.value = selectedVal;
    }
}

// Format date string for standard table display (timezone-safe)
function formatDateDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const yr = parts[0];
            const moIdx = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (moIdx >= 0 && moIdx < 12 && !isNaN(day)) {
                return `${months[moIdx]} ${day}, ${yr}`;
            }
        }
        return dateStr;
    } catch (e) {
        return dateStr;
    }
}

// Render the filtered transactions data table
function renderTransactionsTable() {
    transactions = getStoredTransactions();

    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedYear = yearFilter ? yearFilter.value : 'all';
    const selectedMonth = monthFilter ? monthFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Apply active filters
    let filtered = transactions.filter(t => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        if (t.date) {
            const parts = t.date.split('-');
            const txYr = parts[0];
            const txMo = parseInt(parts[1], 10).toString();

            if (selectedYear !== 'all' && txYr !== selectedYear) return false;
            if (selectedMonth !== 'all' && txMo !== selectedMonth) return false;
        }

        if (searchQuery) {
            const desc = (t.description || '').toLowerCase();
            const cat = (t.category || '').toLowerCase();
            if (!desc.includes(searchQuery) && !cat.includes(searchQuery)) return false;
        }

        return true;
    });

    // Sort newest transactions first
    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);

    // Calculate totals for filtered view
    let filteredInc = 0;
    let filteredExp = 0;
    filtered.forEach(t => {
        if (t.type === 'income') filteredInc += Number(t.amount);
        else filteredExp += Number(t.amount);
    });

    if (summaryBadge) {
        summaryBadge.innerHTML = `Showing ${filtered.length} entries | Net: <span class="${filteredInc >= filteredExp ? 'text-green' : 'text-red'}">Tk ${formatMoney(filteredInc - filteredExp)}</span>`;
    }

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">
                    No transactions found matching the selected filters.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(t => {
        const isInc = t.type === 'income';
        const sign = isInc ? '+' : '-';
        const amtClass = isInc ? 'text-green' : 'text-red';
        const descText = t.description || t.category;
        const dateText = formatDateDisplay(t.date);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${dateText}</strong></td>
            <td style="text-transform: capitalize;">${t.type}</td>
            <td><span class="t-category">${t.category}</span></td>
            <td>${descText}</td>
            <td class="${amtClass}" style="font-weight: 600; text-align: right;">${sign}Tk ${formatMoney(t.amount)}</td>
            <td style="text-align: center;">
                <button class="btn-danger-outline" onclick="deleteTransactionItem(${t.id})" title="Delete entry" style="padding: 2px 8px; font-size: 0.75rem;">Del</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Delete transaction item after confirmation
function deleteTransactionItem(id) {
    if (confirm("Delete this transaction entry?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions(transactions);
        populateYearFilter();
        renderTransactionsTable();
        showToast("Transaction deleted", "info");
    }
}

// Pre-fill today's current date on modal date picker automatically
function initModalDate() {
    const dateInput = document.getElementById('modal-date');
    if (dateInput) {
        dateInput.value = getLocalDateString();
    }
}

// Handle Modal Transaction Submit on Transactions Log page
if (modalTransactionForm) {
    modalTransactionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const type = document.getElementById('modal-type').value;
        const amt = parseFloat(document.getElementById('modal-amount').value);
        const category = document.getElementById('modal-category').value;
        const description = document.getElementById('modal-description').value;
        const dateInput = document.getElementById('modal-date');
        const customDate = dateInput ? dateInput.value : getLocalDateString();

        if (isNaN(amt) || amt <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        // BALANCE VALIDATION RULE: Total Expenses <= Current Balance
        if (type === 'expense') {
            const { currentBalance } = getCurrentFinancialSummary();
            if (amt > currentBalance) {
                showBalanceWarningModal(amt, currentBalance);
                return;
            }
        }

        const newTransaction = {
            id: Date.now(),
            type: type,
            amount: amt,
            category: category,
            description: description,
            date: customDate
        };

        transactions.push(newTransaction);
        saveTransactions(transactions);

        modalTransactionForm.reset();
        initModalDate();
        closeModal('add-transaction-modal');
        populateYearFilter();
        renderTransactionsTable();
        showToast("Transaction added successfully!", "success");
    });
}

// Dynamic Category Filter listener for Filter Bar
if (typeFilter && categoryFilter) {
    typeFilter.addEventListener('change', function() {
        const selectedType = typeFilter.value;
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        let list = [];
        if (selectedType === 'income') {
            list = INCOME_CATEGORIES;
        } else if (selectedType === 'expense') {
            list = EXPENSE_CATEGORIES;
        } else {
            list = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
        }

        list.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.value;
            opt.textContent = cat.label;
            categoryFilter.appendChild(opt);
        });

        renderTransactionsTable();
    });
}

// Attach filter listeners
[categoryFilter, yearFilter, monthFilter, searchInput].forEach(el => {
    if (el) {
        el.addEventListener('change', renderTransactionsTable);
        if (el === searchInput) {
            el.addEventListener('input', renderTransactionsTable);
        }
    }
});

// Initial load setup
setupDynamicCategoryDropdown('modal-type', 'modal-category');
initModalDate();
populateYearFilter();
renderTransactionsTable();
