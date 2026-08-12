// Charts Page logic (charts.html)

const monthSelect = document.getElementById('chart-month-select');
let pieChartInstance = null;
let trendChartInstance = null;

const colorPalette = [
    '#1e3a8a', // Dark Navy
    '#d97706', // Gold / Amber
    '#10b981', // Emerald Green
    '#ef4444', // Crimson Red
    '#8b5cf6', // Violet
    '#06b6d4', // Cyan
    '#ec4899'  // Pink
];

function renderCharts() {
    const transactions = getStoredTransactions();
    const selectedMonth = monthSelect ? monthSelect.value : '2026-06';

    // Filter expenses for Pie Chart
    const expenses = transactions.filter(t => t.type === 'expense');
    
    let filteredExpenses = expenses;
    if (selectedMonth !== 'all') {
        filteredExpenses = expenses.filter(t => t.date && t.date.startsWith(selectedMonth));
    }

    // Group expenses by Category
    const categoryTotals = {};
    filteredExpenses.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Number(t.amount);
    });

    const pieLabels = Object.keys(categoryTotals);
    const pieData = Object.values(categoryTotals);

    // 1. Render Pie / Doughnut Chart
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
                        labels: { font: { family: 'Inter', size: 12 } }
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

    // 2. Render Monthly Spending Trend Bar Chart (Jan - Jun)
    const monthKeys = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const monthlyTotals = monthKeys.map(key => {
        return expenses
            .filter(t => t.date && t.date.startsWith(key))
            .reduce((sum, t) => sum + Number(t.amount), 0);
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
                    label: 'Total Expenses (Tk)',
                    data: monthlyTotals,
                    backgroundColor: '#1e3a8a',
                    borderRadius: 6,
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
                        grid: { color: '#f1f5f9' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

if (monthSelect) {
    monthSelect.addEventListener('change', renderCharts);
}

// Init
renderCharts();
