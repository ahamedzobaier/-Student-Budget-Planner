// DOM Elements
const semesterForm = document.getElementById('semester-form');
const semNameEl = document.getElementById('semester-name');
const durationEl = document.getElementById('duration');
const totalIncomeEl = document.getElementById('total-income');

const costForm = document.getElementById('cost-form');
const costNameEl = document.getElementById('cost-name');
const costAmountEl = document.getElementById('cost-amount'); // Expected
const actualAmountEl = document.getElementById('actual-amount'); // Actual
const costListEl = document.getElementById('cost-list');

// Summary Elements
const displaySemName = document.getElementById('display-semester-name');
const sumIncome = document.getElementById('summary-income');
const sumCosts = document.getElementById('summary-costs');
const sumDisposable = document.getElementById('summary-disposable');
const sumMonthly = document.getElementById('summary-monthly');

// State
let semesterPlan = JSON.parse(localStorage.getItem('semesterPlan')) || {
    name: '',
    duration: 0,
    income: 0,
    costs: []
};

// Format Number to currency string
// (Moved to utils.js)

function updateUI() {
    // Populate forms if data exists
    if (semesterPlan.name) semNameEl.value = semesterPlan.name;
    if (semesterPlan.duration) durationEl.value = semesterPlan.duration;
    if (semesterPlan.income) totalIncomeEl.value = semesterPlan.income;

    // Render Summary
    displaySemName.innerText = semesterPlan.name || 'Not Set';
    sumIncome.innerText = formatMoney(semesterPlan.income);

    const totalCosts = semesterPlan.costs.reduce((acc, curr) => acc + curr.amount, 0);
    sumCosts.innerText = formatMoney(totalCosts);

    const remaining = semesterPlan.income - totalCosts;
    sumDisposable.innerText = formatMoney(remaining);

    if (semesterPlan.duration > 0) {
        sumMonthly.innerText = formatMoney(remaining / semesterPlan.duration);
    } else {
        sumMonthly.innerText = '0.00';
    }

    // Render Cost List
    costListEl.innerHTML = '';
    if (semesterPlan.costs.length === 0) {
        costListEl.innerHTML = '<div style="color: var(--text-muted); font-size: 0.875rem;">No costs added yet.</div>';
    } else {
        semesterPlan.costs.forEach(cost => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.gap = '8px';
            item.style.padding = '12px';
            item.style.border = '1px solid var(--border-color)';
            item.style.borderRadius = 'var(--radius-md)';
            item.style.backgroundColor = '#fff';
            
            const expected = cost.amount || 0;
            const actual = cost.actualAmount || 0;
            const variance = expected - actual;
            let badgeClass = variance >= 0 ? 'bg-green' : 'bg-red';
            let badgeText = variance >= 0 ? `Saved ৳${formatMoney(variance)}` : `Overspent ৳${formatMoney(Math.abs(variance))}`;
            
            // If actual is 0, maybe they haven't paid it yet.
            if (actual === 0 && expected > 0) {
                badgeClass = 'bg-yellow';
                badgeText = 'Pending';
            }

            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight: 600;">${cost.name}</span>
                    <button class="btn-delete" onclick="removeCost(${cost.id})" style="cursor:pointer; background:none; border:none; color:var(--text-muted);">✖</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.875rem;">
                    <div><span style="color:var(--text-muted);">Expected:</span> ৳${formatMoney(expected)}</div>
                    <div><span style="color:var(--text-muted);">Actual:</span> ৳${formatMoney(actual)}</div>
                </div>
                <div style="font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; color: #fff; width: fit-content;" class="${badgeClass}">
                    ${badgeText}
                </div>
            `;
            costListEl.appendChild(item);
        });
    }
}

function saveSemester(e) {
    e.preventDefault();
    semesterPlan.name = semNameEl.value;
    semesterPlan.duration = parseInt(durationEl.value);
    semesterPlan.income = parseFloat(totalIncomeEl.value);
    
    localStorage.setItem('semesterPlan', JSON.stringify(semesterPlan));
    updateUI();
    showToast('Semester details saved successfully!', 'success');
}

function addCost(e) {
    e.preventDefault();
    const newCost = {
        id: Date.now(),
        name: costNameEl.value,
        amount: parseFloat(costAmountEl.value),
        actualAmount: parseFloat(actualAmountEl.value) || 0
    };
    
    semesterPlan.costs.push(newCost);
    localStorage.setItem('semesterPlan', JSON.stringify(semesterPlan));
    
    costNameEl.value = '';
    costAmountEl.value = '';
    actualAmountEl.value = '';
    updateUI();
    showToast('Cost added to matrix', 'success');
}

function removeCost(id) {
    semesterPlan.costs = semesterPlan.costs.filter(c => c.id !== id);
    localStorage.setItem('semesterPlan', JSON.stringify(semesterPlan));
    updateUI();
    showToast('Cost removed from matrix', 'info');
}

semesterForm.addEventListener('submit', saveSemester);
costForm.addEventListener('submit', addCost);

// Init
updateUI();
