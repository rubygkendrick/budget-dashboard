# Budget Dashboard

A full-stack personal budgeting application for tracking transactions, managing budgets, setting savings goals, and getting AI-powered insights into spending.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Recharts
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- Anthropic SDK (Claude AI)

### Database
- PostgreSQL 16
- Prisma ORM

### Auth
- JWT (JSON Web Tokens)
- bcryptjs

---

## Features

- User authentication — register, login, logout, update profile
- Account management — checking, savings, credit, and cash accounts with live balance tracking
- Transactions — log income, expenses, and transfers with category tagging
- Recurring templates — set up repeating transactions with frequency and due dates
- Custom categories and subcategories
- Budget limits per category with progress tracking
- Savings goals with progress bars and achieved status
- Reports — income vs expenses chart, spending by category pie chart, account balance history
- AI financial assistant — powered by Claude, answers questions based on your real financial data
- Protected routes — all authenticated pages require a valid JWT

---

## Project Structure

```
budget-dashboard/
├── src/                        # React frontend
│   ├── components/
│   │   ├── AppTitle.tsx
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Sidebar.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── AccountsPage.tsx
│   │   ├── AIChatPage.tsx
│   │   ├── BudgetsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── GoalsPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── RecurringPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── TransactionsPage.tsx
│   ├── App.tsx
│   └── main.tsx
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── routes/
│   │   │   ├── accounts.ts
│   │   │   ├── auth.ts
│   │   │   ├── budgets.ts
│   │   │   ├── categories.ts
│   │   │   ├── chat.ts
│   │   │   ├── goals.ts
│   │   │   ├── recurring.ts
│   │   │   ├── reports.ts
│   │   │   └── transactions.ts
│   │   ├── db.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── .env
│   └── package.json
├── package.json
└── vite.config.ts
```

---

## Database Schema

11 models: `User` · `Account` · `Category` · `Transaction` · `RecurringTemplate` · `Tag` · `TransactionTag` · `Budget` · `Goal` · `Conversation` · `Message`

---

## Running the Project

### Frontend
```
npm install
npm run dev
```
Runs at `http://localhost:5173`

### Backend
```
cd backend
npm install
npm run dev
```
Runs at `http://localhost:5000`

### Database
```
cd backend
npx prisma migrate dev
```

---

## Environment Variables

Create `backend/.env`:
```
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/budget_app"
JWT_SECRET=your_secret_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

Never commit `.env` to version control.

---

## Development Progress

1. Project setup — React, Vite, TypeScript
2. Backend scaffolding — Node.js, Express, TypeScript
3. Database — PostgreSQL + Prisma schema and migration
4. Auth — register, login, logout, update profile, JWT middleware, protected routes
5. Accounts — full CRUD with live balance updates on transactions
6. Categories — top-level and subcategories
7. Transactions — income, expense, transfer with filtering
8. Recurring Templates — with frequency, due dates, and active/inactive toggle
9. Budgets — spending limits per category with progress bars
10. Goals — savings goals with progress tracking and achieved status
11. Reports — income vs expenses, spending by category, balance history charts
12. Navigation — sidebar with Lucide icons and active state highlighting
13. AI Assistant — Claude-powered chat with real financial data context