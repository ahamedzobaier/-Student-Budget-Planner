# Student Budget Planner (BD Edition)

A clean, responsive, client-side web application prototype designed exclusively for Bangladesh university students. It empowers students to track their local allowance, manage daily expenses, and gain insights into their financial habits.

## 🌟 Core Features

- **Localized Tracking:** Specifically tracks Bangladesh student income (Family support, tutoring, stipends) and expenses (Mess bills, Rickshaw fares, Mobile recharges, Photocopy costs).
- **Interactive Visual Insights:** Uses **Chart.js** to render real-time Doughnut (Category Breakdown) and Bar (Income vs. Expense) charts.
- **Color-Coded Budget Alerts:** Dynamically warns users when they exceed 80% or 100% of their logged income.
- **Semester-Wise Cost Matrix:** A dedicated tool for planning 4-6 month academic cycles. It calculates remaining disposable income and a safe monthly budget after fixed costs like admission fees.
- **Complete Privacy (Zero-Setup):** All financial data is persisted securely using the HTML5 **LocalStorage API** with structured JSON formatting. No data is sent to any server, ensuring complete privacy. Students can close and reopen the app without losing records — ideal for low-connectivity environments common in Bangladesh.

## 🛠️ Technology Stack

- **Structure:** HTML5
- **Styling:** Vanilla CSS3 (Flexbox/Grid layout, Modern 'Glassmorphism' UI)
- **Logic & Storage:** Vanilla JavaScript (ES6+), HTML5 LocalStorage
- **Data Visualization:** Chart.js

## 🚀 How to Run

Since the application is 100% client-side, there are no dependencies to install or servers to run.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. Start logging your transactions!

## 📱 Mobile-Friendly Design

The interface is fully responsive. It is built mobile-first to ensure it scales perfectly on phone browsers, making it easy for students to log expenses like rickshaw fares on the go.
