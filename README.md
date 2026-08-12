# Student Budget Planner (BD Edition)

> **Web Programming Course • Group Project • Uttara University**

A clean, responsive, client-side web application designed exclusively for Bangladesh university students. It empowers students to track daily local allowance & expenses, set monthly category budget limits, visualize full 12-month spending trends, manage routine monthly expenses side-by-side, and plan university semester academic fees.

---

## 👥 Group Team Members & Roles

- **Nasir Uddin** — *Planning & Project Coordination*
- **Zobaiar Hasan** — *UI/UX & Logic Development*
- **Sakib Hasan** — *Testing & Documentation*
- **Awsaf Islam** — *Data Visualization*
- **Maruf Ahmed Fardin** — *Frontend Engineering*

---

## 🌟 6-Page Application Structure

The application features a responsive, glassmorphic floating navigation header connecting **6 core pages**:

| Page | File | Key Features & Responsibilities |
| :--- | :--- | :--- |
| **01. Dashboard** | [`index.html`](file:///e:/project/Student_budget_planner/index.html) | Main hub displaying 4 summary stat cards (*Current Balance*, *Total Income*, *Total Expenses*, *Remaining Goal %*), Quick Add form, and 5 recent transactions. |
| **02. Transactions Log** | [`transactions.html`](file:///e:/project/Student_budget_planner/transactions.html) | Complete 12-month searchable data log. Filter by *Type*, *Category*, *Month* (Jan–Dec), or *Description Search query*. Supports instant entry deletion. |
| **03. Category Budget** | [`budget.html`](file:///e:/project/Student_budget_planner/budget.html) | Set and update monthly spending limits per category. Tracks spent vs. limit with visual progress bars and `OVER` status red alerts. |
| **04. Spending Charts** | [`charts.html`](file:///e:/project/Student_budget_planner/charts.html) | Visual analytics powered by **Chart.js**. Features a Doughnut chart for Category Breakdown and a 12-Month Bar chart (`Jan`–`Dec`) for Monthly Spending Trends with a month dropdown filter. |
| **05. Monthly View** | [`monthly.html`](file:///e:/project/Student_budget_planner/monthly.html) | 12-month side-by-side expense matrix (`Jan`–`Dec`) for routine student living costs with sticky category column for touch scrolling. |
| **06. Semester Matrix** | [`semester.html`](file:///e:/project/Student_budget_planner/semester.html) | Dedicated University Academic Cost Planner (*Admission Fee*, *Credit/Tuition Fee*, *Exam Fee*, *Hall/Hostel Bill*, *Books & Lab Manuals*). Calculates expected vs actual variance, disposable income, and safe monthly budget. |

---

## 🛠️ Technology Stack & Mobile Optimization

- **Structure:** HTML5 Semantic Markup
- **Styling:** Vanilla CSS3 (Glassmorphism design, CSS variables, 2x2 mobile stat grid, sticky table columns, touch scrolling, responsive typography)
- **Logic & Storage:** Vanilla JavaScript (ES6+), HTML5 `localStorage` JSON API
- **Data Visualization:** Chart.js (12-month trends)
- **Icons & Typography:** Phosphor Icons, Google Inter Font

---

## 💾 Shared Data Structure (`localStorage`)

All application state is saved locally in the browser using three structured JSON keys:

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
  "Transport": 800,
  "Tuition": 3000,
  "Recharge": 300,
  "Other Expenses": 500
}
```

### 3. `semesterPlan`
University academic fee plan object:
```json
{
  "name": "Spring 2026",
  "duration": 4,
  "income": 25000,
  "costs": [
    { "id": 1, "name": "Admission Fee", "amount": 15000, "actualAmount": 15000 }
  ]
}
```

---

## 🚀 How to Run

### Method 1: Local HTTP Server (Recommended)
Run a simple local web server from the project directory:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000/index.html`** in your browser.

### Method 2: Direct File Launch
Double-click `index.html` in any web browser.
