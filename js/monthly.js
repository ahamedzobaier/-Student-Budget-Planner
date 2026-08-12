// 12-Month Matrix View page logic (monthly.html)

const matrixTbody = document.getElementById('monthly-matrix-tbody');

const defaultCategories = ['Mess Bill', 'Transport', 'Tuition', 'Recharge', 'Other Expenses'];

function renderMonthlyMatrix() {
    const transactions = getStoredTransactions();

    // Collect all expense categories
    const expenseCategories = new Set(defaultCategories);
    transactions.forEach(t => {
        if (t.type === 'expense' && t.category) {
            expenseCategories.add(t.category);
        }
    });

    const categoryList = Array.from(expenseCategories);

    // Initialize matrix data structures
    const matrix = {}; // { category: { '2026-01': amount, ... } }
    categoryList.forEach(cat => {
        matrix[cat] = {};
        ALL_12_MONTHS.forEach(m => {
            matrix[cat][m.key] = 0;
        });
    });

    const monthlyTotalExp = {};
    const monthlyTotalInc = {};
    ALL_12_MONTHS.forEach(m => {
        monthlyTotalExp[m.key] = 0;
        monthlyTotalInc[m.key] = 0;
    });

    // Populate matrix from transactions
    transactions.forEach(t => {
        if (!t.date) return;
        const monthPrefix = t.date.substring(0, 7);

        if (ALL_12_MONTHS.some(m => m.key === monthPrefix)) {
            const amt = Number(t.amount || 0);
            if (t.type === 'income') {
                monthlyTotalInc[monthPrefix] += amt;
            } else if (t.type === 'expense') {
                monthlyTotalExp[monthPrefix] += amt;
                if (matrix[t.category]) {
                    matrix[t.category][monthPrefix] += amt;
                }
            }
        }
    });

    matrixTbody.innerHTML = '';

    // 1. Render Category Rows
    let grandTotalExp = 0;

    categoryList.forEach(cat => {
        const tr = document.createElement('tr');
        let rowHtml = `<td style="text-align: left;"><strong>${cat}</strong></td>`;
        let categoryYearTotal = 0;

        ALL_12_MONTHS.forEach(m => {
            const val = matrix[cat][m.key];
            categoryYearTotal += val;
            const displayVal = val > 0 ? `Tk ${formatMoney(val)}` : '-';
            rowHtml += `<td>${displayVal}</td>`;
        });

        grandTotalExp += categoryYearTotal;
        rowHtml += `<td style="font-weight: 700;">Tk ${formatMoney(categoryYearTotal)}</td>`;
        
        tr.innerHTML = rowHtml;
        matrixTbody.appendChild(tr);
    });

    // 2. Render Summary Row: Total Exp
    const trExp = document.createElement('tr');
    trExp.className = 'matrix-summary-row';
    let expRowHtml = `<td style="text-align: left; color: var(--red);">Total Exp</td>`;
    
    ALL_12_MONTHS.forEach(m => {
        expRowHtml += `<td style="color: var(--red);">Tk ${formatMoney(monthlyTotalExp[m.key])}</td>`;
    });
    expRowHtml += `<td style="color: var(--red); font-weight: 700;">Tk ${formatMoney(grandTotalExp)}</td>`;
    trExp.innerHTML = expRowHtml;
    matrixTbody.appendChild(trExp);

    // 3. Render Summary Row: Total Inc
    let grandTotalInc = 0;
    const trInc = document.createElement('tr');
    trInc.className = 'matrix-summary-row';
    let incRowHtml = `<td style="text-align: left; color: var(--green);">Total Inc</td>`;
    
    ALL_12_MONTHS.forEach(m => {
        const incVal = monthlyTotalInc[m.key];
        grandTotalInc += incVal;
        incRowHtml += `<td style="color: var(--green);">Tk ${formatMoney(incVal)}</td>`;
    });
    incRowHtml += `<td style="color: var(--green); font-weight: 700;">Tk ${formatMoney(grandTotalInc)}</td>`;
    trInc.innerHTML = incRowHtml;
    matrixTbody.appendChild(trInc);

    // 4. Render Summary Row: Net Balance
    const grandBalance = grandTotalInc - grandTotalExp;
    const trBal = document.createElement('tr');
    trBal.className = 'matrix-summary-row';
    trBal.style.backgroundColor = '#f8fafc';
    let balRowHtml = `<td style="text-align: left; font-weight: 700;">Net Balance</td>`;

    ALL_12_MONTHS.forEach(m => {
        const net = monthlyTotalInc[m.key] - monthlyTotalExp[m.key];
        const colorStyle = net >= 0 ? 'color: var(--green);' : 'color: var(--red);';
        balRowHtml += `<td style="${colorStyle} font-weight: 600;">Tk ${formatMoney(net)}</td>`;
    });
    const grandColorStyle = grandBalance >= 0 ? 'color: var(--green);' : 'color: var(--red);';
    balRowHtml += `<td style="${grandColorStyle} font-weight: 700;">Tk ${formatMoney(grandBalance)}</td>`;
    trBal.innerHTML = balRowHtml;
    matrixTbody.appendChild(trBal);
}

// Init
renderMonthlyMatrix();
