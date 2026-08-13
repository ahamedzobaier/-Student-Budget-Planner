// ==========================================================================
// TRANSACTIONS LOG CONTROLLER (transactions.js)
// Handles searching, multi-criteria filtering, and transaction log rendering
// ==========================================================================

const typeFilter = document.getElementById('filter-type');
const categoryFilter = document.getElementById('filter-category');
const monthFilter = document.getElementById('filter-month');
const searchInput = document.getElementById('search-input');
const tbody = document.getElementById('transactions-tbody');
const summaryBadge = document.getElementById('filter-summary-badge');
const modalTransactionForm = document.getElementById('modal-transaction-form');

let transactions = getStoredTransactions();

// Format date string for standard table display
function formatDateDisplay(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[d.getMonth()]} ${d.getDate()}`;
    } catch (e) {
        return dateStr;
    }
}

// Render the filtered transactions data table
function renderTransactionsTable() {
    transactions = getStoredTransactions();

    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedMonth = monthFilter ? monthFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    // Apply active filters
    let filtered = transactions.filter(t => {
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
        if (selectedMonth !== 'all') {
            if (!t.date || !t.date.startsWith(selectedMonth)) return false;
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
            <td>${descText}</td>
            <td><span class="t-category">${t.category}</span></td>
            <td style="text-transform: capitalize;">${t.type}</td>
            <td class="${amtClass}" style="font-weight: 600;">${sign}Tk ${formatMoney(t.amount)}</td>
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
        renderTransactionsTable();
        showToast("Transaction deleted", "info");
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
            date: new Date().toISOString().split('T')[0]
        };

        transactions.push(newTransaction);
        saveTransactions(transactions);

        modalTransactionForm.reset();
        closeModal('add-transaction-modal');
        renderTransactionsTable();
        showToast("Transaction added successfully!", "success");
    });
}

// Attach filter listeners
if (typeFilter) typeFilter.addEventListener('change', renderTransactionsTable);
if (categoryFilter) categoryFilter.addEventListener('change', renderTransactionsTable);
if (monthFilter) monthFilter.addEventListener('change', renderTransactionsTable);
if (searchInput) searchInput.addEventListener('input', renderTransactionsTable);

// Init table
renderTransactionsTable();
