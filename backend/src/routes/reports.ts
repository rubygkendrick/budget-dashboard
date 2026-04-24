// Reports routes: aggregated financial data for charts and summaries.
import { Router, Response } from 'express';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/reports/income-vs-expenses
router.get('/income-vs-expenses', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        type: { in: ['income', 'expense'] },
      },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    const grouped: Record<string, { income: number; expense: number }> = {};

    for (const tx of transactions) {
      const month = tx.date.toISOString().slice(0, 7);
      if (!grouped[month]) grouped[month] = { income: 0, expense: 0 };
      if (tx.type === 'income') grouped[month].income += parseFloat(String(tx.amount));
      if (tx.type === 'expense') grouped[month].expense += parseFloat(String(tx.amount));
    }

    const result = Object.entries(grouped).map(([month, data]) => ({
      month,
      income: data.income,
      expense: data.expense,
    }));

    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/spending-by-category
router.get('/spending-by-category', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        type: 'expense',
        categoryId: { not: null },
      },
      include: { category: { select: { name: true } } },
    });

    const grouped: Record<string, { name: string; total: number }> = {};

    for (const tx of transactions) {
      if (!tx.categoryId || !tx.category) continue;
      if (!grouped[tx.categoryId]) {
        grouped[tx.categoryId] = { name: tx.category.name, total: 0 };
      }
      grouped[tx.categoryId].total += parseFloat(String(tx.amount));
    }

    const result = Object.values(grouped).map(({ name, total }) => ({ name, total }));
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/reports/transfers
router.get('/transfers', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transfers = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        type: 'transfer',
      },
      include: {
        account: { select: { name: true } },
        toAccount: { select: { name: true } },
      },
      orderBy: { date: 'desc' },
    });
    return res.json(transfers);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;