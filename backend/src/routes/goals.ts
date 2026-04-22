// Goals routes: create, read, update, and delete savings goals for the logged in user.
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/goals
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, targetAmount, accountId, targetDate } = req.body;

  if (!name || !targetAmount) {
    return res.status(400).json({ error: 'name and targetAmount are required' });
  }

  try {
    const goal = await prisma.goal.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        name,
        targetAmount,
        currentAmount: 0,
        accountId: accountId || null,
        targetDate: targetDate ? new Date(targetDate) : null,
        isAchieved: false,
      },
    });
    return res.status(201).json(goal);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/goals
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId! },
    });
    return res.json(goals);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/goals/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, targetAmount, currentAmount, targetDate, isAchieved } = req.body;
  try {
    await prisma.goal.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: {
        name,
        targetAmount,
        currentAmount,
        targetDate: targetDate ? new Date(targetDate) : null,
        isAchieved,
      },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.goal.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;