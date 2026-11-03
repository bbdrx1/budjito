# ₱ Personal Monthly Budget Tracker

![PHP Currency](https://img.shields.io/badge/Currency-PHP%20(%E2%82%B1)-green.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Build](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![Excel & Web](https://img.shields.io/badge/Platform-Excel%20%7C%20Web%20App-orange.svg)

A professional, user-friendly, and maintainable personal financial management tool built to track monthly income, manage household expenses, monitor tithes/family support, track bill payment deadlines, and build long-term savings. 

Available as both a **fully automated Microsoft Excel workbook (`.xlsx`)** and a **single-page web application (HTML/CSS/JS)** with local data persistence.

---

## 📌 Table of Contents
- [Key Features](#-key-features)
- [Architecture & Layout](#-architecture--layout)
- [Salary Allocation Methodology (50/15/15/20 Rule)](#-salary-allocation-methodology-50151520-rule)
- [Getting Started](#-getting-started)
  - [Option A: Microsoft Excel Workbook](#option-a-microsoft-excel-workbook)
  - [Option B: Web Application](#option-b-web-application)
- [Application Flow & Usage](#-application-flow--usage)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Key Features

* 🇵🇭 **Philippine Peso (₱ / PHP) Default Formatting:** Built-in standard currency formatting for local financial tracking.
* 🔐 **User Registration & Login System:** User authentication with data isolation per profile using browser `localStorage`.
* 📊 **Executive Financial Dashboard:** Real-time KPI summary cards (*Total Income, Expenses, Remaining Balance, Total Savings, Unpaid Bills*) and interactive data visualizations.
* 💡 **Salary Allocation Planner:** Automatically allocates your monthly income across structured spending buckets (*Needs, Wants, Family & Faith, Savings*).
* ⏰ **Bill Due Date Reminders & Status Tracking:** Categorize bills as `Paid`, `Unpaid`, or `Pending` with instant dashboard alerts for upcoming payments.
* 📈 **Interactive Visual Analytics:**
  * **Expense Breakdown:** Doughnut Chart showing spending percentages.
  * **Budget vs. Actual:** Bar Chart comparing planned spending against actual consumption.
  * **12-Month Trend Line:** Line Chart mapping annual net cash flow and savings trajectories.
* 📁 **Data Export & Settings:** Easily modify expense categories, toggle currency symbols, or export system backups in standard JSON format.

---

## 📐 Architecture & Layout

The system is organized into **7 core modules**:

| Module / Sheet | Description |
| :--- | :--- |
| **`Dashboard`** | Main executive overview with KPI summary cards, month selector dropdown, salary allocation planner, and dynamic charts. |
| **`Income`** | Log basic salary, overtime pay, side income, and bonuses. |
| **`Expenses`** | Comprehensive daily transaction log with category tags, descriptions, variance calculation (`Budget - Actual`), and payment statuses. |
| **`Monthly Budget`** | Category-by-category variance report highlighting budget health (Green `<80%`, Yellow `80-100%`, Red `>100%`). |
| **`Savings Tracker`** | Goal-oriented wealth tracking (Emergency Fund, Travel, Investments) alongside monthly planned vs. actual deposits. |
| **`Annual Summary`** | 12-month consolidated table summarizing income, actual expenses, net cash flow, and overall savings rates. |
| **`Settings`** | System lookup tables for expense categories, payment statuses, and system defaults. |

---

## 🎯 Salary Allocation Methodology (50/15/15/20 Rule)

The built-in **Salary Allocation Planner** breaks down your net monthly income into four balanced financial buckets:
<img width="1903" height="947" alt="image-4" src="https://github.com/user-attachments/assets/50760bb7-767d-47ef-89d9-5039c6821119" />
<img width="1915" height="985" alt="image-6" src="https://github.com/user-attachments/assets/eb7ebad0-67ef-4519-a5dc-58dfc05fce03" />
<img width="1903" height="944" alt="image-5" src="https://github.com/user-attachments/assets/a911adef-f0a6-4aa8-be86-c0ec8dfd93f6" />

visit this link for more exploration: https://budjito.vercel.app/
