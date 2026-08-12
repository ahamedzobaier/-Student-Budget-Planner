# Student Budget Planner (BD Edition)

> **Web Programming Course • Group Project • Uttara University**

A clean, responsive, client-side web application prototype designed exclusively for Bangladesh university students. It empowers students to track their local allowance, manage daily expenses, set category budget limits, visualize spending trends, and compare month-by-month academic semester costs.

---

## 👥 Group Team Members & Roles

- **Nasir Uddin** — *Planning & Project Coordination*
- **Zobaiar Hasan** — *UI/UX & Logic Development*
- **Sakib Hasan** — *Testing & Documentation*
- **Awsaf Islam** — *Data Visualization*
- **Maruf Ahmed Fardin** — *Frontend Engineering*

---

## 🌟 5-Page Application Structure

The application is structured into **5 distinct pages** connected by a glassmorphic floating navigation bar:

| Page | File | Key Features & Responsibilities |
| :--- | :--- | :--- |
| **01. Dashboard** | [`index.html`](file:///e:/project/Student_budget_planner/index.html) | Main hub displaying 4 summary stat cards (*Current Balance*, *Total Income*, *Total Expenses*, *Remaining Goal %*), Quick Add form, and 5 recent transactions. |
| **02. Transactions Log** | [`transactions.html`](file:///e:/project/Student_budget_planner/transactions.html) | Complete searchable data log. Filter by *Type*, *Category*, *Month*, or *Description Search query*. Supports instant entry deletion. |
| **03. Category Budget** | [`budget.html`](file:///e:/project/Student_budget_planner/budget.html) | Set and update monthly spending limits per category. Tracks spent vs. limit with visual progress bars and `OVER` status red alerts. |
| **04. Spending Charts** | [`charts.html`](file:///e:/project/Student_budget_planner/charts.html) | Visual analytics powered by **Chart.js**. Features a Doughnut chart for Category Breakdown and a Bar chart for Monthly Spending Trends with a month dropdown filter. |
| **05. Semester View** | [`semester.html`](file:///e:/project/Student_budget_planner/semester.html) | Side-by-side automated matrix comparison grid across the semester (`Jan`–`Jun`). Computes monthly *Total Exp*, *Total Inc*, and *Net Balance*. |

---

## 🛠️ Technology Stack

- **Structure:** HTML5 Semantic Markup
- **Styling:** Vanilla CSS3 (Glassmorphism design, CSS variables, Flexbox & Grid layouts, responsive mobile navigation)
- **Logic & Storage:** Vanilla JavaScript (ES6+), HTML5 `localStorage` JSON API
- **Data Visualization:** Chart.js
- **Icons & Typography:** Phosphor Icons, Google Inter Font

---

## 💾 Shared Data Structure (`localStorage`)

All application state is saved locally in the browser using two structured JSON keys:

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
  },
  {
    "id": 102,
    "type": "expense",
    "amount": 500,
    "category": "Mess Bill",
    "description": "Mess Bill",
    "date": "2026-06-16"
  }
]
```

### 2. `categoryBudgets`
Key-value mapping of monthly limit thresholds per category:
```json
{
  "Mess Bill": 2000,
  "Transport": 800,
  "Tuition": 3000,
  "Recharge": 300,
  "Other Expenses": 500
}
```

---

## 🔄 Data Management

- **Clear All Data:** Located in the footer on all pages. Clears all stored JSON records from browser `localStorage`, resetting all tables, charts, and metrics to zero so users can manage their own data cleanly.

---

## 🚀 How to Run

Since the application is 100% client-side, no database installation or external dependencies are required.

### Method 1: Direct File Launch
Simply double-click `index.html` in any web browser.

### Method 2: Local HTTP Server (Recommended)
Run a simple local web server from the project directory:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000/index.html`** in your browser.
