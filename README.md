# Student Budget Planner (BD Edition)

> **Web Programming Course • Group Project • Uttara University**  
> 🌐 **Live Web Application**: [https://budgetbd.vercel.app](https://budgetbd.vercel.app)

A clean, modern, fully responsive client-side web application built for university students in Bangladesh. It simplifies personal finance by tracking daily income and local expenses, enforcing strict balance validation rules, setting monthly category spending limits, visualizing 12-month financial trends, and storing data persistent in browser `localStorage`.

---

## 👥 Project Team & Roles

| Team Member | Role & Key Responsibilities |
| :--- | :--- |
| **Nasir Uddin** | *Planning & Project Coordination* |
| **Zobaiar Hasan** | *UI/UX Design & Core JavaScript Logic* |
| **Sakib Hasan** | *Testing, QA & Technical Documentation* |
| **Awsaf Islam** | *Data Visualization & Chart Analytics* |
| **Maruf Ahmed Fardin** | *Frontend Engineering & Layout Styling* |

---

## 🌟 Core Features & System Rules

- **🛡️ Strict Balance Validation (`Total Expenses <= Current Balance`)**: Prevents users from logging an expense that exceeds their available net balance (`Total Income - Total Expenses`). Triggers an interactive **Insufficient Balance Warning Modal** showing exact shortage amounts.
- **👤 Dynamic Student Profile Popover**: Interactive profile menu accessible via the top navbar avatar. Displays student details (*Name*, *University*, *Department*, *Student ID*, *Semester*) with real-time interactive edit & save functionality.
- **🔄 Dynamic Category Dropdowns**: Modal forms dynamically switch available category options based on selected transaction type (*Income* vs *Expense*).
- **🇧🇩 Unified BDT Currency Flow**: Standardized Bangladeshi Taka (`Tk`) currency formatting across stats, tables, limits, and charts.
- **📊 Interactive Financial Charts**: Powered by **Chart.js** with category doughnut breakdowns and a 12-month spending trend bar chart with month filtering.
- **💬 Glassmorphic Modal Popups**: Smooth animated popups for adding transactions, setting budget limits, and editing student profile details.

---

## 📱 5-Page Application Structure

The application features a responsive, glassmorphic floating top navigation header connecting **5 core pages**:

| Page | File | Key Features & Responsibilities |
| :--- | :--- | :--- |
| **01. Dashboard** | [`index.html`](file:///e:/project/Student_budget_planner/index.html) | Main hub displaying 4 summary stat cards (*Current Balance*, *Total Income*, *Total Expenses*, *Remaining Goal %*), Quick **+ Add Transaction** popup modal launcher, and 5 recent transactions. |
| **02. Transactions Log** | [`transactions.html`](file:///e:/project/Student_budget_planner/transactions.html) | Searchable 12-month data log. Filter by *Type*, *Category*, *Month* (Jan–Dec), or *Description Search query*. Supports instant entry deletion. |
| **03. Category Budget** | [`budget.html`](file:///e:/project/Student_budget_planner/budget.html) | Set and update monthly spending limits per category with visual progress bars, progress % indicators, and `OVER` status red alert banners. |
| **04. Spending Charts** | [`charts.html`](file:///e:/project/Student_budget_planner/charts.html) | Visual analytics powered by **Chart.js**. Features a Doughnut chart for Category Breakdown and a 12-Month Bar chart (`Jan`–`Dec`) with a month dropdown filter. |
| **05. Monthly View** | [`monthly.html`](file:///e:/project/Student_budget_planner/monthly.html) | 12-month side-by-side financial matrix (`Jan`–`Dec`) sectioned into *INCOME SOURCES*, *REGULAR EXPENSES*, and *NET SAVINGS & BALANCE* with sticky headers. |

---

## 🛠️ Technology Stack

| Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Markup** | **HTML5** | Semantic, accessible web page structure |
| **Styling** | **Vanilla CSS3** | Custom CSS Variables design system, Glassmorphism navbar, CSS Grid/Flexbox layouts, SVG chevron dropdowns, smooth micro-animations |
| **Logic** | **Vanilla JavaScript (ES6+)** | Pure client-side application logic, event listeners, dynamic DOM manipulation |
| **Storage** | **HTML5 Web Storage API** | Browser `localStorage` for zero-backend data persistence |
| **Visualization** | **Chart.js (v4.x)** | Canvas-based financial charts and monthly spending analytics |
| **Icons & Font** | **Phosphor Icons & Google Inter** | Modern icon set and clean typography |

---

## 💾 Local Storage Schema

All data persists in the browser via three `localStorage` JSON keys:

```json
// Key: "transactions"
[
  {
    "id": 1723594800000,
    "type": "expense",
    "amount": 1500,
    "category": "Mess Bill",
    "description": "August Dining Fee",
    "date": "2026-08-13"
  }
]

// Key: "categoryBudgets"
{
  "Mess Bill": 2500,
  "Tuition": 5000,
  "Recharge": 500,
  "Other Expenses": 1000
}

// Key: "studentProfile"
{
  "name": "Zobaier Hasan",
  "university": "Uttara University",
  "department": "Computer Science (CSE)",
  "studentId": "2241081345",
  "semester": "Summer 2026"
}
```

---

## 🚀 How to Run Locally

### Method 1: Local HTTP Server (Recommended)
Run a local web server from the project root directory:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000/`** in your browser.

### Method 2: Direct Browser Launch
Double-click **`index.html`** to open directly in any modern web browser.
