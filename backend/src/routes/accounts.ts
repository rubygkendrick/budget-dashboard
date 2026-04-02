// Accounts routes: create, read, update, and delete accounts for the logged in user.
import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/accounts (route handlers)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, type, balance, currency } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  try {
    const account = await prisma.account.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        name,
        type,
        balance: balance || 0,
        currency: currency || 'USD',
      },
    });
    return res.status(201).json(account);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/accounts
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { userId: req.userId! },
    });
    return res.json(accounts);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/accounts/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const account = await prisma.account.findFirst({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    if (!account) return res.status(404).json({ error: 'Account not found' });
    return res.json(account);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/accounts/:id
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, type } = req.body;
  try {
    const account = await prisma.account.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: { name, type },
    });
    return res.json(account);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/accounts/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.account.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;