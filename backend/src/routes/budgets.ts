// Budgets routes: create, read, update, and delete budgets for the logged in user.
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/budgets
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { categoryId, limitAmount, period, startDate, endDate } = req.body;

  if (!categoryId || !limitAmount || !period) {
    return res.status(400).json({ error: 'categoryId, limitAmount, and period are required' });
  }

  try {
    const budget = await prisma.budget.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        categoryId,
        limitAmount,
        period,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return res.status(201).json(budget);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/budgets
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId! },
      include: { category: true },
    });
    return res.json(budgets);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/budgets/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { limitAmount, period, startDate, endDate } = req.body;
  try {
    await prisma.budget.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: {
        limitAmount,
        period,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/budgets/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.budget.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;