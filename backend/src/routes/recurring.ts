// Recurring templates routes: create, read, update, and delete recurring transaction templates.
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/recurring
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, type, accountId, categoryId, frequency, nextDue } = req.body;

  if (!name || !amount || !type || !accountId || !frequency) {
    return res.status(400).json({ error: 'name, amount, type, accountId, and frequency are required' });
  }

  try {
    const template = await prisma.recurringTemplate.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        name,
        amount,
        type,
        accountId,
        categoryId: categoryId || null,
        frequency,
        nextDue: nextDue ? new Date(nextDue) : null,
        isActive: true,
      },
    });
    return res.status(201).json(template);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/recurring
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const templates = await prisma.recurringTemplate.findMany({
      where: { userId: req.userId! },
      orderBy: { nextDue: 'asc' },
    });
    return res.json(templates);
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/recurring/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, type, accountId, categoryId, frequency, nextDue, isActive } = req.body;
  try {
    await prisma.recurringTemplate.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: {
        name,
        amount,
        type,
        accountId,
        categoryId: categoryId || null,
        frequency,
        nextDue: nextDue ? new Date(nextDue) : null,
        isActive,
      },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/recurring/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.recurringTemplate.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;