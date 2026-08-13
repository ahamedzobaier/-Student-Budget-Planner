// ==========================================================================
// UNIVERSITY SEMESTER MATRIX CONTROLLER (semester.js)
// Manages semester academic setup, fixed university fees, and safe monthly budget
// ==========================================================================

const semesterForm = document.getElementById('semester-form');
const semNameEl = document.getElementById('semester-name');
const durationEl = document.getElementById('duration');
const totalIncomeEl = document.getElementById('total-income');

const costForm = document.getElementById('cost-form');
const modalCostForm = document.getElementById('modal-cost-form');
const costNameEl = document.getElementById('cost-name');
const costAmountEl = document.getElementById('cost-amount');
const actualAmountEl = document.getElementById('actual-amount');
const costListEl = document.getElementById('cost-list');

const displaySemName = document.getElementById('display-semester-name');
const sumIncome = document.getElementById('summary-income');
const sumCosts = document.getElementById('summary-costs');
const sumDisposable = document.getElementById('summary-disposable');
const sumMonthly = document.getElementById('summary-monthly');

let semesterPlan = getStoredSemesterPlan();

// Update University Semester Summary Header & Cost List UI
function updateSemesterUI() {
    if (!semesterPlan) semesterPlan = getStoredSemesterPlan();

    if (semNameEl) semNameEl.value = semesterPlan.name || '';
    if (durationEl) durationEl.value = semesterPlan.duration || 4;
    if (totalIncomeEl) totalIncomeEl.value = semesterPlan.income || 0;

    if (displaySemName) displaySemName.innerText = semesterPlan.name || 'Not Set';
    if (sumIncome) sumIncome.innerText = formatMoney(semesterPlan.income || 0);

    const totalCosts = (semesterPlan.costs || []).reduce((acc, curr) => acc + Number(curr.actualAmount || curr.amount || 0), 0);
    if (sumCosts) sumCosts.innerText = formatMoney(totalCosts);

    const remaining = (semesterPlan.income || 0) - totalCosts;
    if (sumDisposable) sumDisposable.innerText = formatMoney(remaining);

    const duration = Number(semesterPlan.duration || 0);
    if (duration > 0) {
        if (sumMonthly) sumMonthly.innerText = formatMoney(remaining / duration);
    } else {
        if (sumMonthly) sumMonthly.innerText = '0';
    }

    if (!costListEl) return;
    costListEl.innerHTML = '';

    if (!semesterPlan.costs || semesterPlan.costs.length === 0) {
        costListEl.innerHTML = '<div class="empty-state" style="padding: 16px;">No fixed university costs added yet.</div>';
        return;
    }

    semesterPlan.costs.forEach(cost => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.flexDirection = 'column';
        item.style.gap = '6px';
        item.style.padding = '10px 12px';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = 'var(--radius-md)';
        item.style.backgroundColor = '#fff';
        
        const expected = Number(cost.amount || 0);
        const actual = Number(cost.actualAmount || 0);
        const variance = expected - actual;

        let badgeClass = 'status-ok';
        let badgeText = `Saved Tk ${formatMoney(variance)}`;

        if (variance < 0) {
            badgeClass = 'status-over';
            badgeText = `Overspent Tk ${formatMoney(Math.abs(variance))}`;
        } else if (actual === 0 && expected > 0) {
            badgeClass = 'status-pending';
            badgeText = 'Pending Payment';
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 0.9rem;">${cost.name}</span>
                <button class="btn-danger-outline" onclick="removeCost(${cost.id})" style="padding: 2px 6px; font-size: 0.7rem;" title="Remove cost">Del</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8rem;">
                <div><span style="color: var(--text-muted);">Expected:</span> Tk ${formatMoney(expected)}</div>
                <div><span style="color: var(--text-muted);">Actual:</span> Tk ${formatMoney(actual)}</div>
            </div>
            <div style="width: fit-content;" class="status-badge ${badgeClass}">
                ${badgeText}
            </div>
        `;
        costListEl.appendChild(item);
    });
}

// Save semester setup
function saveSemester(e) {
    e.preventDefault();
    semesterPlan.name = semNameEl.value.trim();
    semesterPlan.duration = parseInt(durationEl.value) || 1;
    semesterPlan.income = parseFloat(totalIncomeEl.value) || 0;
    
    saveSemesterPlan(semesterPlan);
    updateSemesterUI();
    showToast('University semester setup saved successfully!', 'success');
}

// Add cost item to semester plan
function handleAddAcademicCost(name, expectedAmount, actualAmount) {
    const expAmt = parseFloat(expectedAmount);
    const actAmt = parseFloat(actualAmount);

    if (!name || isNaN(expAmt) || expAmt < 0) {
        showToast('Please enter a cost name and expected amount', 'error');
        return false;
    }

    const newCost = {
        id: Date.now(),
        name: name,
        amount: expAmt,
        actualAmount: isNaN(actAmt) ? expAmt : actAmt
    };
    
    if (!semesterPlan.costs) semesterPlan.costs = [];
    semesterPlan.costs.push(newCost);
    saveSemesterPlan(semesterPlan);
    
    updateSemesterUI();
    showToast('Academic cost added to matrix', 'success');
    return true;
}

// Remove cost item
function removeCost(id) {
    semesterPlan.costs = (semesterPlan.costs || []).filter(c => c.id !== id);
    saveSemesterPlan(semesterPlan);
    updateSemesterUI();
    showToast('Academic cost removed', 'info');
}

// Handle Inline Form Submit
if (costForm) {
    costForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = costNameEl.value.trim();
        const expAmt = costAmountEl.value;
        const actAmt = actualAmountEl.value;

        const success = handleAddAcademicCost(name, expAmt, actAmt);
        if (success) {
            costNameEl.value = '';
            costAmountEl.value = '';
            actualAmountEl.value = '';
        }
    });
}

// Handle Modal Popup Form Submit
if (modalCostForm) {
    modalCostForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('modal-cost-name').value.trim();
        const expAmt = document.getElementById('modal-cost-amount').value;
        const actAmt = document.getElementById('modal-actual-amount').value;

        const success = handleAddAcademicCost(name, expAmt, actAmt);
        if (success) {
            modalCostForm.reset();
            closeModal('add-cost-modal');
        }
    });
}

if (semesterForm) semesterForm.addEventListener('submit', saveSemester);

// Init UI
updateSemesterUI();
