// ==========================================================================
// 12-MONTH FINANCIAL MATRIX CONTROLLER (monthly.js)
// Renders annual income/expense matrix with summary stats and month highlights
// ==========================================================================

const matrixTbody = document.getElementById('monthly-matrix-tbody');
const monthlyYearSelect = document.getElementById('monthly-year-select');

const defaultIncomeCategories = ['Income', 'Tutoring', 'Scholarship', 'Other Income'];
const defaultExpenseCategories = ['Mess Bill', 'Tuition', 'Recharge', 'Other Expenses'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthIndexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Friendly category label maps
const categoryHumanNames = {
    'Income': 'Family Support / Allowance',
    'Tutoring': 'Part-time Tutoring',
    'Scholarship': 'Stipend & Scholarship',
    'Other Income': 'Other Income',
    'Mess Bill': 'Mess & Dining Bill',
    'Tuition': 'University Tuition & Fees',
    'Recharge': 'Mobile Recharge & Data',
    'Other Expenses': 'Other Daily Expenses'
};

function getHumanCategoryName(cat) {
    return categoryHumanNames[cat] || cat;
}

// Populate Year Selector for Monthly Matrix Page
function populateMonthlyYearSelect() {
    if (!monthlyYearSelect) return;

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
    const prevVal = monthlyYearSelect.value;
    const wasYear = prevVal && sortedYears.includes(parseInt(prevVal, 10));

    monthlyYearSelect.innerHTML = '';
    sortedYears.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        monthlyYearSelect.appendChild(opt);
    });

    monthlyYearSelect.value = wasYear ? prevVal : currentYear.toString();
}

// Update the annual summary stat cards above the matrix table
function updateMonthlySummaryCards(grandTotalInc, grandTotalExp) {
    const netSavings = grandTotalInc - grandTotalExp;
    const savingsRate = grandTotalInc > 0 ? Math.max(0, Math.round((netSavings / grandTotalInc) * 100)) : 0;

    const incEl = document.getElementById('annual-income-total');
    const expEl = document.getElementById('annual-expense-total');
    const netEl = document.getElementById('annual-net-savings');
    const rateEl = document.getElementById('annual-savings-rate');

    if (incEl) incEl.innerText = formatMoney(grandTotalInc);
    if (expEl) expEl.innerText = formatMoney(grandTotalExp);
    if (netEl) netEl.innerText = formatMoney(Math.abs(netSavings));
    if (rateEl) rateEl.innerText = savingsRate;

    // Change net savings card color dynamically
    const netCard = netEl ? netEl.closest('.stat-card') : null;
    if (netCard) {
        netCard.classList.remove('card-balance', 'card-expense');
        netCard.classList.add(netSavings >= 0 ? 'card-balance' : 'card-expense');
    }
}

// Highlight current month column in table header
function highlightCurrentMonthHeader(selectedYear) {
    const headerRow = document.getElementById('monthly-matrix-header');
    if (!headerRow) return;

    const now = new Date();
    const currentYear = now.getFullYear().toString();
    const currentMonthIndex = now.getMonth(); // 0-based (0=Jan, 7=Aug)

    // ths: index 0 = Category label, 1-12 = months, 13 = Total
    const ths = headerRow.querySelectorAll('th');
    ths.forEach((th, i) => {
        th.style.removeProperty('background');
        th.style.removeProperty('color');
        th.style.removeProperty('font-weight');
        if (i === 13) {
            // Total column always gets primary color
            th.style.background = 'var(--primary-color)';
            th.style.color = 'white';
        }
    });

    if (selectedYear === currentYear && ths[currentMonthIndex + 1]) {
        const th = ths[currentMonthIndex + 1];
        th.style.background = '#6366f1';
        th.style.color = 'white';
        th.style.fontWeight = '700';
        th.title = 'Current Month';
    }
}

// Build a table cell with optional current-month highlight style
function buildCell(value, isCurrentMonth, colorStyle = '', extraStyle = '') {
    const highlight = isCurrentMonth ? 'background: #f0f0ff;' : '';
    return `<td style="${highlight} ${colorStyle} ${extraStyle}">${value}</td>`;
}

function renderMonthlyMatrix() {
    if (!matrixTbody) return;

    const transactions = getStoredTransactions();
    const selectedYear = monthlyYearSelect ? monthlyYearSelect.value : new Date().getFullYear().toString();

    // Determine current month for highlighting (1-based)
    const now = new Date();
    const currentMonthNum = now.getFullYear().toString() === selectedYear ? (now.getMonth() + 1) : -1;

    // 1. Collect all categories from actual transactions
    const incomeCatSet = new Set(defaultIncomeCategories);
    const expenseCatSet = new Set(defaultExpenseCategories);

    transactions.forEach(t => {
        if (!t.category) return;
        if (t.type === 'income') incomeCatSet.add(t.category);
        else expenseCatSet.add(t.category);
    });

    const incomeCategories = Array.from(incomeCatSet);
    const expenseCategories = Array.from(expenseCatSet);

    // 2. Initialize matrices
    const incomeMatrix = {};
    incomeCategories.forEach(cat => {
        incomeMatrix[cat] = {};
        monthIndexes.forEach(m => incomeMatrix[cat][m] = 0);
    });

    const expenseMatrix = {};
    expenseCategories.forEach(cat => {
        expenseMatrix[cat] = {};
        monthIndexes.forEach(m => expenseMatrix[cat][m] = 0);
    });

    const monthlyTotalInc = {};
    const monthlyTotalExp = {};
    monthIndexes.forEach(m => {
        monthlyTotalInc[m] = 0;
        monthlyTotalExp[m] = 0;
    });

    // 3. Populate from transactions for selected year
    transactions.forEach(t => {
        if (!t.date) return;
        const parts = t.date.split('-');
        const txYr = parts[0];
        const txMo = parseInt(parts[1], 10);

        if (txYr !== selectedYear || isNaN(txMo) || txMo < 1 || txMo > 12) return;

        const amt = Number(t.amount || 0);

        if (t.type === 'income') {
            monthlyTotalInc[txMo] += amt;
            if (incomeMatrix[t.category]) incomeMatrix[t.category][txMo] += amt;
        } else if (t.type === 'expense') {
            monthlyTotalExp[txMo] += amt;
            if (expenseMatrix[t.category]) expenseMatrix[t.category][txMo] += amt;
        }
    });

    matrixTbody.innerHTML = '';

    // ==========================================
    // SECTION 1: INCOME SOURCES
    // ==========================================
    const sec1Title = document.createElement('tr');
    sec1Title.className = 'matrix-section-title';
    sec1Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-hand-coins" style="margin-right: 6px; color: var(--green);"></i>INCOME SOURCES</td>`;
    matrixTbody.appendChild(sec1Title);

    let grandTotalInc = 0;

    incomeCategories.forEach(cat => {
        const tr = document.createElement('tr');
        const isCurrent = (m) => m === currentMonthNum;
        let rowHtml = `<td style="text-align: left; padding-left: 20px; font-size: 0.82rem;">${getHumanCategoryName(cat)}</td>`;
        let catYearTotal = 0;

        monthIndexes.forEach(m => {
            const val = incomeMatrix[cat][m];
            catYearTotal += val;
            const displayVal = val > 0 ? `Tk ${formatMoney(val)}` : '<span style="color:#cbd5e1;">—</span>';
            const bg = isCurrent(m) ? 'background: #f0f0ff;' : '';
            rowHtml += `<td style="${bg} font-size: 0.8rem;">${displayVal}</td>`;
        });

        grandTotalInc += catYearTotal;
        rowHtml += `<td style="font-weight: 600; font-size: 0.82rem; background: #f8fafc;">Tk ${formatMoney(catYearTotal)}</td>`;
        tr.innerHTML = rowHtml;
        matrixTbody.appendChild(tr);
    });

    // Income Subtotal Row
    const trIncSub = document.createElement('tr');
    trIncSub.className = 'matrix-subtotal-row income-subtotal';
    let incSubHtml = `<td style="text-align: left; color: var(--green); font-weight: 700;"><i class="ph ph-arrow-up" style="margin-right:4px;"></i>Total Income</td>`;
    monthIndexes.forEach(m => {
        const incVal = monthlyTotalInc[m];
        const bg = m === currentMonthNum ? 'background: #e8f5e9;' : '';
        if (incVal > 0) {
            incSubHtml += `<td style="${bg} color: var(--green); font-weight: 700;">Tk ${formatMoney(incVal)}</td>`;
        } else {
            incSubHtml += `<td style="${bg} color: var(--text-muted); opacity: 0.5;">—</td>`;
        }
    });
    incSubHtml += `<td style="color: var(--green); font-weight: 700; background: #f0fdf4;">Tk ${formatMoney(grandTotalInc)}</td>`;
    trIncSub.innerHTML = incSubHtml;
    matrixTbody.appendChild(trIncSub);

    // ==========================================
    // SECTION 2: REGULAR LIVING EXPENSES
    // ==========================================
    const sec2Title = document.createElement('tr');
    sec2Title.className = 'matrix-section-title';
    sec2Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-shopping-bag" style="margin-right: 6px; color: var(--red);"></i>REGULAR EXPENSES</td>`;
    matrixTbody.appendChild(sec2Title);

    let grandTotalExp = 0;

    expenseCategories.forEach(cat => {
        const tr = document.createElement('tr');
        let rowHtml = `<td style="text-align: left; padding-left: 20px; font-size: 0.82rem;">${getHumanCategoryName(cat)}</td>`;
        let catYearTotal = 0;

        monthIndexes.forEach(m => {
            const val = expenseMatrix[cat][m];
            catYearTotal += val;
            const displayVal = val > 0 ? `Tk ${formatMoney(val)}` : '<span style="color:#cbd5e1;">—</span>';
            const bg = m === currentMonthNum ? 'background: #f0f0ff;' : '';
            rowHtml += `<td style="${bg} font-size: 0.8rem;">${displayVal}</td>`;
        });

        grandTotalExp += catYearTotal;
        rowHtml += `<td style="font-weight: 600; font-size: 0.82rem; background: #f8fafc;">Tk ${formatMoney(catYearTotal)}</td>`;
        tr.innerHTML = rowHtml;
        matrixTbody.appendChild(tr);
    });

    // Expense Subtotal Row
    const trExpSub = document.createElement('tr');
    trExpSub.className = 'matrix-subtotal-row expense-subtotal';
    let expSubHtml = `<td style="text-align: left; color: var(--red); font-weight: 700;"><i class="ph ph-arrow-down" style="margin-right:4px;"></i>Total Expenses</td>`;
    monthIndexes.forEach(m => {
        const expVal = monthlyTotalExp[m];
        const bg = m === currentMonthNum ? 'background: #fff0f0;' : '';
        if (expVal > 0) {
            expSubHtml += `<td style="${bg} color: var(--red); font-weight: 700;">Tk ${formatMoney(expVal)}</td>`;
        } else {
            expSubHtml += `<td style="${bg} color: var(--text-muted); opacity: 0.5;">—</td>`;
        }
    });
    expSubHtml += `<td style="color: var(--red); font-weight: 700; background: #fef2f2;">Tk ${formatMoney(grandTotalExp)}</td>`;
    trExpSub.innerHTML = expSubHtml;
    matrixTbody.appendChild(trExpSub);

    // ==========================================
    // SECTION 3: NET SAVINGS & BALANCE
    // ==========================================
    const sec3Title = document.createElement('tr');
    sec3Title.className = 'matrix-section-title';
    sec3Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-scales" style="margin-right: 6px; color: #6366f1;"></i>NET SAVINGS &amp; BALANCE</td>`;
    matrixTbody.appendChild(sec3Title);

    const grandBalance = grandTotalInc - grandTotalExp;

    // Net Monthly Savings Row
    const trBal = document.createElement('tr');
    trBal.className = 'matrix-subtotal-row balance-subtotal';
    let balRowHtml = `<td style="text-align: left; font-weight: 700;"><i class="ph ph-piggy-bank" style="margin-right:4px; color:#6366f1;"></i>Net Savings</td>`;

    let cumulative = 0;
    const cumulativeVals = [];

    monthIndexes.forEach(m => {
        const net = monthlyTotalInc[m] - monthlyTotalExp[m];
        cumulative += net;
        cumulativeVals.push(cumulative);

        const bg = m === currentMonthNum ? 'background: #f5f3ff;' : '';
        let colorStyle = 'color: var(--text-muted); opacity: 0.5;';
        let formattedVal = '—';

        if (net > 0) {
            colorStyle = 'color: var(--green);';
            formattedVal = `+Tk ${formatMoney(net)}`;
        } else if (net < 0) {
            colorStyle = 'color: var(--red);';
            formattedVal = `-Tk ${formatMoney(Math.abs(net))}`;
        }

        balRowHtml += `<td style="${bg} ${colorStyle} font-weight: 700;">${formattedVal}</td>`;
    });

    const grandColorStyle = grandBalance >= 0 ? 'color: var(--green);' : 'color: var(--red);';
    const grandSign = grandBalance >= 0 ? '+' : '-';
    balRowHtml += `<td style="${grandColorStyle} font-weight: 700; background: #f5f3ff;">${grandSign}Tk ${formatMoney(Math.abs(grandBalance))}</td>`;
    trBal.innerHTML = balRowHtml;
    matrixTbody.appendChild(trBal);

    // Cumulative Balance Row
    const trCum = document.createElement('tr');
    trCum.className = 'matrix-subtotal-row';
    trCum.style.borderTop = '2px dashed var(--border-color)';
    let cumRowHtml = `<td style="text-align: left; font-weight: 600; color: var(--text-muted); font-size: 0.8rem;"><i class="ph ph-chart-line" style="margin-right:4px;"></i>Running Balance</td>`;

    cumulativeVals.forEach((val, idx) => {
        const m = idx + 1;
        const bg = m === currentMonthNum ? 'background: #f5f3ff;' : '';
        const isActive = monthlyTotalInc[m] > 0 || monthlyTotalExp[m] > 0;
        if (!isActive) {
            cumRowHtml += `<td style="${bg} color: var(--text-muted); opacity: 0.4; font-size: 0.78rem;">—</td>`;
        } else {
            const color = val >= 0 ? 'color: #0891b2;' : 'color: var(--red);';
            const sign = val >= 0 ? '' : '-';
            cumRowHtml += `<td style="${bg} ${color} font-weight: 600; font-size: 0.78rem;">${sign}Tk ${formatMoney(Math.abs(val))}</td>`;
        }
    });
    cumRowHtml += `<td style="color: #6366f1; font-weight: 700; font-size: 0.82rem; background: #f5f3ff;">Tk ${formatMoney(Math.max(0, grandBalance))}</td>`;
    trCum.innerHTML = cumRowHtml;
    matrixTbody.appendChild(trCum);

    // Update summary stat cards and header highlights
    updateMonthlySummaryCards(grandTotalInc, grandTotalExp);
    highlightCurrentMonthHeader(selectedYear);
}

if (monthlyYearSelect) {
    monthlyYearSelect.addEventListener('change', renderMonthlyMatrix);
}

// Initial setup
populateMonthlyYearSelect();
renderMonthlyMatrix();
