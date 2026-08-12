// Transactions Page logic (transactions.html)

const typeFilter = document.getElementById('filter-type');
const categoryFilter = document.getElementById('filter-category');
const monthFilter = document.getElementById('filter-month');
const searchInput = document.getElementById('search-input');
const tbody = document.getElementById('transactions-tbody');
const summaryBadge = document.getElementById('filter-summary-badge');

let transactions = getStoredTransactions();

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

function renderTransactionsTable() {
    transactions = getStoredTransactions();

    const selectedType = typeFilter ? typeFilter.value : 'all';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedMonth = monthFilter ? monthFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = transactions.filter(t => {
        // Type Filter
        if (selectedType !== 'all' && t.type !== selectedType) return false;
        
        // Category Filter
        if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

        // Month Filter (expecting YYYY-MM prefix match)
        if (selectedMonth !== 'all') {
            if (!t.date || !t.date.startsWith(selectedMonth)) return false;
        }

        // Search Query
        if (searchQuery) {
            const desc = (t.description || '').toLowerCase();
            const cat = (t.category || '').toLowerCase();
            if (!desc.includes(searchQuery) && !cat.includes(searchQuery)) return false;
        }

        return true;
    });

    // Sort newest first
    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || b.id - a.id);

    // Calculate Summary Totals for Filtered View
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
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    No transactions found matching the current filters.
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
                <button class="btn-delete" onclick="deleteTransactionItem(${t.id})" title="Delete entry" style="color: var(--red); font-weight: bold; cursor: pointer;">X</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deleteTransactionItem(id) {
    if (confirm("Delete this transaction entry?")) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions(transactions);
        renderTransactionsTable();
        showToast("Transaction deleted", "info");
    }
}

// Event Listeners for Filter Controls
if (typeFilter) typeFilter.addEventListener('change', renderTransactionsTable);
if (categoryFilter) categoryFilter.addEventListener('change', renderTransactionsTable);
if (monthFilter) monthFilter.addEventListener('change', renderTransactionsTable);
if (searchInput) searchInput.addEventListener('input', renderTransactionsTable);

// Init
renderTransactionsTable();
