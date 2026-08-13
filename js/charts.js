// ==========================================================================
// SPENDING CHARTS CONTROLLER (charts.js)
// Renders Category Doughnut Chart and 12-Month Spending Trend Bar Chart
// ==========================================================================

const yearSelect = document.getElementById('chart-year-select');
const monthSelect = document.getElementById('chart-month-select');
let pieChartInstance = null;
let trendChartInstance = null;

// Palette for Category Doughnut Chart slices
const colorPalette = [
    '#1e3a8a', // Dark Navy
    '#d97706', // Gold / Amber
    '#10b981', // Emerald Green
    '#ef4444', // Crimson Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899'  // Pink
];

// Populate Year dropdown dynamically from logged transactions
function populateChartYearSelect() {
    if (!yearSelect) return;

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
    const prevVal = yearSelect.value;

    yearSelect.innerHTML = '';
    sortedYears.forEach(yr => {
        const opt = document.createElement('option');
        opt.value = yr.toString();
        opt.textContent = yr.toString();
        yearSelect.appendChild(opt);
    });

    if (prevVal && sortedYears.includes(parseInt(prevVal, 10))) {
        yearSelect.value = prevVal;
    } else {
        yearSelect.value = currentYear.toString();
    }
}

// Main function to draw and refresh all Chart.js visualizations
function renderCharts() {
    const transactions = getStoredTransactions();
    const selectedYear = yearSelect ? yearSelect.value : new Date().getFullYear().toString();
    const selectedMonth = monthSelect ? monthSelect.value : 'all';

    // Filter expense transactions for selected year
    const yearExpenses = transactions.filter(t => {
        if (t.type !== 'expense' || !t.date) return false;
        return t.date.startsWith(selectedYear);
    });

    let filteredExpenses = yearExpenses;
    if (selectedMonth !== 'all') {
        filteredExpenses = yearExpenses.filter(t => {
            const parts = t.date.split('-');
            const mo = parseInt(parts[1], 10).toString();
            return mo === selectedMonth;
        });
    }

    // Group expenses by Category
    const categoryTotals = {};
    filteredExpenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const pieLabels = Object.keys(categoryTotals);
    const pieData = Object.values(categoryTotals);

    // Render Doughnut Pie Chart
    const pieCanvas = document.getElementById('categoryPieChart');
    if (pieCanvas) {
        if (pieChartInstance) pieChartInstance.destroy();

        const ctxPie = pieCanvas.getContext('2d');
        pieChartInstance = new Chart(ctxPie, {
            type: 'doughnut',
            data: {
                labels: pieLabels.length > 0 ? pieLabels : ['No Expenses Logged'],
                datasets: [{
                    data: pieData.length > 0 ? pieData : [1],
                    backgroundColor: pieData.length > 0 ? colorPalette.slice(0, pieLabels.length) : ['#e2e8f0'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { font: { family: 'Inter', size: 11 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                if (pieData.length === 0) return 'No expenses';
                                return `${context.label}: Tk ${formatMoney(context.parsed)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Render 12-Month Spending Trend Bar Chart (Jan - Dec) for Selected Year
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = Array(12).fill(0);

    yearExpenses.forEach(t => {
        const parts = t.date.split('-');
        const moIndex = parseInt(parts[1], 10) - 1;
        if (moIndex >= 0 && moIndex < 12) {
            monthlyTotals[moIndex] += Number(t.amount);
        }
    });

    const trendCanvas = document.getElementById('monthlyTrendChart');
    if (trendCanvas) {
        if (trendChartInstance) trendChartInstance.destroy();

        const ctxTrend = trendCanvas.getContext('2d');
        trendChartInstance = new Chart(ctxTrend, {
            type: 'bar',
            data: {
                labels: monthNames,
                datasets: [{
                    label: `Expenses ${selectedYear} (Tk)`,
                    data: monthlyTotals,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 4,
                    hoverBackgroundColor: '#d97706'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Expenses: Tk ${formatMoney(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { font: { size: 10 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                }
            }
        });
    }
}

// Attach filter listeners
[yearSelect, monthSelect].forEach(el => {
    if (el) el.addEventListener('change', renderCharts);
});

// Auto-select current month in the chart month dropdown
function initDefaultChartMonth() {
    if (!monthSelect) return;
    const currentMonth = (new Date().getMonth() + 1).toString();
    monthSelect.value = currentMonth;
}

// Initial load
populateChartYearSelect();
initDefaultChartMonth();
renderCharts();
