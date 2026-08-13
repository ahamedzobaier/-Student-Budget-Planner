// 12-Month Financial Summary Matrix logic (monthly.html)

const matrixTbody = document.getElementById('monthly-matrix-tbody');

const defaultIncomeCategories = ['Income', 'Tutoring', 'Scholarship', 'Other Income'];
const defaultExpenseCategories = ['Mess Bill', 'Transport', 'Tuition', 'Recharge', 'Other Expenses'];

// Friendly category label maps
const categoryHumanNames = {
    'Income': 'Family Support / Allowance',
    'Tutoring': 'Part-time Tutoring',
    'Scholarship': 'Stipend & Scholarship',
    'Other Income': 'Other Income',
    'Mess Bill': 'Mess & Dining Bill',
    'Transport': 'Transport & Rickshaw',
    'Tuition': 'University Tuition & Fees',
    'Recharge': 'Mobile Recharge & Data',
    'Other Expenses': 'Other Daily Expenses'
};

function getHumanCategoryName(cat) {
    return categoryHumanNames[cat] || cat;
}

function renderMonthlyMatrix() {
    const transactions = getStoredTransactions();

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

    // 2. Build Income & Expense Matrices
    const incomeMatrix = {};
    incomeCategories.forEach(cat => {
        incomeMatrix[cat] = {};
        ALL_12_MONTHS.forEach(m => incomeMatrix[cat][m.key] = 0);
    });

    const expenseMatrix = {};
    expenseCategories.forEach(cat => {
        expenseMatrix[cat] = {};
        ALL_12_MONTHS.forEach(m => expenseMatrix[cat][m.key] = 0);
    });

    const monthlyTotalInc = {};
    const monthlyTotalExp = {};
    ALL_12_MONTHS.forEach(m => {
        monthlyTotalInc[m.key] = 0;
        monthlyTotalExp[m.key] = 0;
    });

    // Populate data
    transactions.forEach(t => {
        if (!t.date) return;
        const monthPrefix = t.date.substring(0, 7);
        if (!ALL_12_MONTHS.some(m => m.key === monthPrefix)) return;

        const amt = Number(t.amount || 0);

        if (t.type === 'income') {
            monthlyTotalInc[monthPrefix] += amt;
            if (incomeMatrix[t.category]) {
                incomeMatrix[t.category][monthPrefix] += amt;
            }
        } else if (t.type === 'expense') {
            monthlyTotalExp[monthPrefix] += amt;
            if (expenseMatrix[t.category]) {
                expenseMatrix[t.category][monthPrefix] += amt;
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

        ALL_12_MONTHS.forEach(m => {
            const val = incomeMatrix[cat][m.key];
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
    let incSubHtml = `<td style="text-align: left; color: var(--green);">Total Monthly Income</td>`;
    ALL_12_MONTHS.forEach(m => {
        const incVal = monthlyTotalInc[m.key];
        incSubHtml += `<td style="color: var(--green);">Tk ${formatMoney(incVal)}</td>`;
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

        ALL_12_MONTHS.forEach(m => {
            const val = expenseMatrix[cat][m.key];
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
    let expSubHtml = `<td style="text-align: left; color: var(--red);">Total Monthly Expenses</td>`;
    ALL_12_MONTHS.forEach(m => {
        const expVal = monthlyTotalExp[m.key];
        expSubHtml += `<td style="color: var(--red);">Tk ${formatMoney(expVal)}</td>`;
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

    ALL_12_MONTHS.forEach(m => {
        const net = monthlyTotalInc[m.key] - monthlyTotalExp[m.key];
        let colorStyle = 'color: var(--text-muted);';
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

// Init
renderMonthlyMatrix();
