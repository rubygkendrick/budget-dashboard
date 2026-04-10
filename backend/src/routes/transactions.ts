// Transactions routes : create, read, update, and delete transactions for the logged in user.

import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/transactions
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { accountId, toAccountId, categoryId, amount, type, note, date } = req.body;

  if (!accountId || !amount || !type || !date) {
    return res.status(400).json({ error: 'accountId, amount, type, and date are required' });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        accountId,
        toAccountId: toAccountId || null,
        categoryId: categoryId || null,
        amount,
        type,
        note: note || null,
        date: new Date(date),
      },
    });
    return res.status(201).json(transaction);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/transactions
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { accountId, categoryId, startDate, endDate } = req.query;

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId!,
        ...(accountId && { accountId: String(accountId) }),
        ...(categoryId && { categoryId: String(categoryId) }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(String(startDate)),
            lte: new Date(String(endDate)),
          },
        }),
      },
      orderBy: { date: 'desc' },
    });
    return res.json(transactions);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/transactions/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    return res.json(transaction);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/transactions/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { amount, categoryId, date, note } = req.body;
  try {
    await prisma.transaction.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: {
        amount,
        categoryId: categoryId || null,
        date: new Date(date),
        note: note || null,
      },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.transaction.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;