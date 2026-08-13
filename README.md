# Student Budget Planner (BD Edition)

> **Web Programming Course • Group Project • Uttara University**
> 
> 🌐 **Live Vercel App**: [https://budgetbd.vercel.app](https://budgetbd.vercel.app) (or [https://budgetbd.vercel.app/dashboard.html](https://budgetbd.vercel.app/dashboard.html))

A clean, responsive, client-side web application designed exclusively for Bangladesh university students. It empowers students to track daily local allowance & expenses, enforce strict balance spending validation, set monthly category budget limits, visualize full 12-month spending trends, manage routine monthly expenses side-by-side, and plan university semester academic fees.

---

## 👥 Group Team Members & Roles

- **Nasir Uddin** — *Planning & Project Coordination*
- **Zobaiar Hasan** — *UI/UX & Logic Development*
- **Sakib Hasan** — *Testing & Documentation*
- **Awsaf Islam** — *Data Visualization*
- **Maruf Ahmed Fardin** — *Frontend Engineering*

---

## 🌟 Key Application Features & Validation Rules

- **🛡️ Balance Validation Modal (`Total Expenses <= Current Balance`)**: Strictly prevents expenses from exceeding current available balance (`Total Income - Total Expenses`). Displays an interactive Insufficient Balance Warning Modal popup showing the shortage amount.
- **🇧🇩 Unified BDT Currency Flow**: Standardized Bangladeshi Taka (`Tk`) formatting across all pages and calculations.
- **💬 Interactive Modal Popup Forms**: Accessible, animated popup form modals for adding transactions, setting category budget limits, and adding academic costs.
- **📝 Everyday Humanized Code Comments**: Simple, warm, easy-to-read code comments throughout all HTML, CSS, and JS files.

---

## 🌟 5-Page Application Structure

The application features a responsive, glassmorphic floating navigation header connecting **5 core pages**:

| Page | File | Key Features & Responsibilities |
| :--- | :--- | :--- |
| **01. Dashboard** | [`dashboard.html`](file:///e:/project/Student_budget_planner/dashboard.html) | Main hub displaying 4 summary stat cards (*Current Balance*, *Total Income*, *Total Expenses*, *Remaining Goal %*), quick **+ Add Transaction** button opening popup modal, and 5 recent transactions. |
| **02. Transactions Log** | [`transactions.html`](file:///e:/project/Student_budget_planner/transactions.html) | Complete 12-month searchable data log. Filter by *Type*, *Category*, *Month* (Jan–Dec), or *Description Search query*. Supports instant entry deletion and modal additions. |
| **03. Category Budget** | [`budget.html`](file:///e:/project/Student_budget_planner/budget.html) | Set and update monthly spending limits per category. Tracks spent vs. limit with visual progress bars, progress % indicators, and `OVER` status red alerts. |
| **04. Spending Charts** | [`charts.html`](file:///e:/project/Student_budget_planner/charts.html) | Visual analytics powered by **Chart.js**. Features a Doughnut chart for Category Breakdown and a 12-Month Bar chart (`Jan`–`Dec`) for Monthly Spending Trends with a month dropdown filter. |
| **05. Monthly View** | [`monthly.html`](file:///e:/project/Student_budget_planner/monthly.html) | 12-month side-by-side financial matrix (`Jan`–`Dec`) sectioned into *INCOME SOURCES*, *REGULAR EXPENSES*, and *NET SAVINGS & BALANCE* with sticky category column for touch scrolling. |

---

## 🛠️ Technology Stack & Mobile Optimization

- **Structure:** HTML5 Semantic Markup
- **Styling:** Vanilla CSS3 (Glassmorphism design, CSS variables, 2x2 mobile stat grid, modal popups, sticky table columns, touch scrolling, responsive typography)
- **Logic & Storage:** Vanilla JavaScript (ES6+), HTML5 `localStorage` JSON API
- **Data Visualization:** Chart.js (12-month trends)
- **Icons & Typography:** Phosphor Icons, Google Inter Font

---

## 💾 Shared Data Structure (`localStorage`)

All application state is saved locally in the browser using structured JSON keys:

### 1. `transactions`
Array of logged transaction objects:
```json
[
  {
    "id": 101,
    "type": "income",
    "amount": 5000,
    "category": "Income",
    "description": "Family Allowance",
    "date": "2026-06-17"
  }
]
```

### 2. `categoryBudgets`
Key-value mapping of monthly limit thresholds per category:
```json
{
  "Mess Bill": 2000,
  "Tuition": 3000,
  "Recharge": 300,
  "Other Expenses": 500
}
```

---

## 🚀 How to Run

### Method 1: Local HTTP Server (Recommended)
Run a simple local web server from the project directory:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000/dashboard.html`** in your browser.

### Method 2: Direct File Launch
Double-click `dashboard.html` in any web browser.
