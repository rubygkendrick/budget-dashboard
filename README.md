# Budget Dashboard

A full-stack budgeting application for tracking transactions, managing budgets, setting savings goals, and getting AI-powered insights into spending.

---

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- Node.js
- Express
- TypeScript

### Database
- PostgreSQL 16
- Prisma ORM

---

## Features

- User authentication with JWT
- Account management (checking, savings, credit, cash)
- Income, expense, and transfer transactions
- Recurring transaction templates
- Custom categories and subcategories
- Budget limits per category and time period
- Savings goals with progress tracking
- Reports and spending charts
- AI chat assistant for financial queries

---

## Project Structure
```
budget-dashboard/
├── src/                  # React frontend
│   ├── components/
│   ├── App.tsx
│   └── main.tsx
├── backend/              # Node.js + Express API
│   ├── src/
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
```

Never commit `.env` to version control.

---

## Development Progress

1. Project setup — React, Vite, TypeScript
2. Backend scaffolding — Node.js, Express, TypeScript
3. Database — PostgreSQL + Prisma schema and migration
4. Auth — register, login, JWT middleware
5. Accounts, Categories, Transactions
6. Recurring Templates, Budgets, Goals
7. Reports and data visualization
8. AI Assistant