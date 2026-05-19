// Dashboard route: returns summary data for the main dashboard view.
import { Router, Response } from 'express';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/dashboard
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [accounts, transactions, recentTransactions, upcomingRecurring] = await Promise.all([
      // all accounts for total balance
      prisma.account.findMany({
        where: { userId: req.userId! },
      }),
      // this month's transactions for income/expense summary
      prisma.transaction.findMany({
        where: {
          userId: req.userId!,
          date: { gte: startOfMonth, lte: endOfMonth },
          type: { in: ['income', 'expense'] },
        },
      }),
      // last 5 transactions
      prisma.transaction.findMany({
        where: { userId: req.userId! },
        orderBy: { date: 'desc' },
        take: 5,
        include: {
          account: { select: { name: true } },
          category: { select: { name: true } },
        },
      }),
      // upcoming recurring templates
      prisma.recurringTemplate.findMany({
        where: { userId: req.userId!, isActive: true },
        orderBy: { nextDue: 'asc' },
        take: 5,
      }),
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(String(a.balance)), 0);
    const monthlyIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);

    return res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      recentTransactions,
      upcomingRecurring,
    });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;