const matrixTbody = document.getElementById('monthly-matrix-tbody');
const monthlyYearSelect = document.getElementById('monthly-year-select');

const defaultIncomeCategories = ['Income', 'Tutoring', 'Scholarship', 'Other Income'];
const defaultExpenseCategories = ['Mess Bill', 'Tuition', 'Recharge', 'Other Expenses'];

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

    monthlyYearSelect.innerHTML = '';
    sortedYears.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        monthlyYearSelect.appendChild(opt);
    });

    if (prevVal && sortedYears.includes(parseInt(prevVal, 10))) {
        monthlyYearSelect.value = prevVal;
    } else {
        monthlyYearSelect.value = currentYear.toString();
    }
}

function renderMonthlyMatrix() {
    if (!matrixTbody) return;

    const transactions = getStoredTransactions();
    const selectedYear = monthlyYearSelect ? monthlyYearSelect.value : new Date().getFullYear().toString();

    // 1. Separate Income and Expense categories
    const incomeCatSet = new Set(defaultIncomeCategories);
    const expenseCatSet = new Set(defaultExpenseCategories);

    transactions.forEach(t => {
        if (!t.category) return;
        if (t.type === 'income') {
            incomeCatSet.add(t.category);
        } else {
            expenseCatSet.add(t.category);
        }
    });

    const incomeCategories = Array.from(incomeCatSet);
    const expenseCategories = Array.from(expenseCatSet);

    // 2. Build Income & Expense Matrices for Months 1-12 of selected year
    const monthIndexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
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

    // Populate data for the selected year
    transactions.forEach(t => {
        if (!t.date) return;
        const parts = t.date.split('-');
        const txYr = parts[0];
        const txMo = parseInt(parts[1], 10);

        if (txYr !== selectedYear || isNaN(txMo) || txMo < 1 || txMo > 12) return;

        const amt = Number(t.amount || 0);

        if (t.type === 'income') {
            monthlyTotalInc[txMo] += amt;
            if (incomeMatrix[t.category]) {
                incomeMatrix[t.category][txMo] += amt;
            }
        } else if (t.type === 'expense') {
            monthlyTotalExp[txMo] += amt;
            if (expenseMatrix[t.category]) {
                expenseMatrix[t.category][txMo] += amt;
            }
        }
    });

    matrixTbody.innerHTML = '';

    // ==========================================
    // SECTION 1: INCOME SOURCES
    // ==========================================
    const sec1Title = document.createElement('tr');
    sec1Title.className = 'matrix-section-title';
    sec1Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-hand-coins" style="margin-right: 6px;"></i>INCOME SOURCES</td>`;
    matrixTbody.appendChild(sec1Title);

    let grandTotalInc = 0;

    incomeCategories.forEach(cat => {
        const tr = document.createElement('tr');
        let rowHtml = `<td style="text-align: left; padding-left: 20px;">${getHumanCategoryName(cat)}</td>`;
        let catYearTotal = 0;

        monthIndexes.forEach(m => {
            const val = incomeMatrix[cat][m];
            catYearTotal += val;
            const displayVal = val > 0 ? `Tk ${formatMoney(val)}` : '-';
            rowHtml += `<td>${displayVal}</td>`;
        });

        grandTotalInc += catYearTotal;
        rowHtml += `<td style="font-weight: 600;">Tk ${formatMoney(catYearTotal)}</td>`;
        tr.innerHTML = rowHtml;
        matrixTbody.appendChild(tr);
    });

    // Income Subtotal Row
    const trIncSub = document.createElement('tr');
    trIncSub.className = 'matrix-subtotal-row income-subtotal';
    let incSubHtml = `<td style="text-align: left; color: var(--green); font-weight: 700;">Total Monthly Income</td>`;
    monthIndexes.forEach(m => {
        const incVal = monthlyTotalInc[m];
        if (incVal > 0) {
            incSubHtml += `<td style="color: var(--green); font-weight: 600;">Tk ${formatMoney(incVal)}</td>`;
        } else {
            incSubHtml += `<td style="color: var(--text-muted); opacity: 0.6;">-</td>`;
        }
    });
    incSubHtml += `<td style="color: var(--green); font-weight: 700;">Tk ${formatMoney(grandTotalInc)}</td>`;
    trIncSub.innerHTML = incSubHtml;
    matrixTbody.appendChild(trIncSub);

    // ==========================================
    // SECTION 2: REGULAR LIVING EXPENSES
    // ==========================================
    const sec2Title = document.createElement('tr');
    sec2Title.className = 'matrix-section-title';
    sec2Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-shopping-bag" style="margin-right: 6px;"></i>REGULAR EXPENSES</td>`;
    matrixTbody.appendChild(sec2Title);

    let grandTotalExp = 0;

    expenseCategories.forEach(cat => {
        const tr = document.createElement('tr');
        let rowHtml = `<td style="text-align: left; padding-left: 20px;">${getHumanCategoryName(cat)}</td>`;
        let catYearTotal = 0;

        monthIndexes.forEach(m => {
            const val = expenseMatrix[cat][m];
            catYearTotal += val;
            const displayVal = val > 0 ? `Tk ${formatMoney(val)}` : '-';
            rowHtml += `<td>${displayVal}</td>`;
        });

        grandTotalExp += catYearTotal;
        rowHtml += `<td style="font-weight: 600;">Tk ${formatMoney(catYearTotal)}</td>`;
        tr.innerHTML = rowHtml;
        matrixTbody.appendChild(tr);
    });

    // Expense Subtotal Row
    const trExpSub = document.createElement('tr');
    trExpSub.className = 'matrix-subtotal-row expense-subtotal';
    let expSubHtml = `<td style="text-align: left; color: var(--red); font-weight: 700;">Total Monthly Expenses</td>`;
    monthIndexes.forEach(m => {
        const expVal = monthlyTotalExp[m];
        if (expVal > 0) {
            expSubHtml += `<td style="color: var(--red); font-weight: 600;">Tk ${formatMoney(expVal)}</td>`;
        } else {
            expSubHtml += `<td style="color: var(--text-muted); opacity: 0.6;">-</td>`;
        }
    });
    expSubHtml += `<td style="color: var(--red); font-weight: 700;">Tk ${formatMoney(grandTotalExp)}</td>`;
    trExpSub.innerHTML = expSubHtml;
    matrixTbody.appendChild(trExpSub);

    // ==========================================
    // SECTION 3: NET MONTHLY SAVINGS / BALANCE
    // ==========================================
    const sec3Title = document.createElement('tr');
    sec3Title.className = 'matrix-section-title';
    sec3Title.innerHTML = `<td colspan="14" style="text-align: left;"><i class="ph ph-scales" style="margin-right: 6px;"></i>NET SAVINGS & BALANCE</td>`;
    matrixTbody.appendChild(sec3Title);

    const grandBalance = grandTotalInc - grandTotalExp;
    const trBal = document.createElement('tr');
    trBal.className = 'matrix-subtotal-row balance-subtotal';
    let balRowHtml = `<td style="text-align: left; font-weight: 700;">Net Monthly Savings</td>`;

    monthIndexes.forEach(m => {
        const net = monthlyTotalInc[m] - monthlyTotalExp[m];
        let colorStyle = 'color: var(--text-muted); opacity: 0.6;';
        let formattedVal = '-';

        if (net > 0) {
            colorStyle = 'color: var(--green);';
            formattedVal = `+Tk ${formatMoney(net)}`;
        } else if (net < 0) {
            colorStyle = 'color: var(--red);';
            formattedVal = `-Tk ${formatMoney(Math.abs(net))}`;
        }

        balRowHtml += `<td style="${colorStyle} font-weight: 700;">${formattedVal}</td>`;
    });

    const grandColorStyle = grandBalance >= 0 ? 'color: var(--green);' : 'color: var(--red);';
    const grandSign = grandBalance >= 0 ? '+' : '-';
    balRowHtml += `<td style="${grandColorStyle} font-weight: 700;">${grandSign}Tk ${formatMoney(Math.abs(grandBalance))}</td>`;
    trBal.innerHTML = balRowHtml;
    matrixTbody.appendChild(trBal);
}

if (monthlyYearSelect) {
    monthlyYearSelect.addEventListener('change', renderMonthlyMatrix);
}

// Initial setup
populateMonthlyYearSelect();
renderMonthlyMatrix();
