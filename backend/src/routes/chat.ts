// Chat route: handles AI chat messages using the Anthropic API.
import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/chat
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // fetch user's financial context
    const [accounts, transactions, budgets, goals] = await Promise.all([
      prisma.account.findMany({ where: { userId: req.userId! } }),
      prisma.transaction.findMany({
        where: { userId: req.userId! },
        orderBy: { date: 'desc' },
        take: 20,
      }),
      prisma.budget.findMany({
        where: { userId: req.userId! },
        include: { category: true },
      }),
      prisma.goal.findMany({ where: { userId: req.userId! } }),
    ]);

    const context = `
You are a helpful financial assistant for a personal budgeting app. 
Here is the user's current financial data:

ACCOUNTS:
${accounts.map(a => `- ${a.name} (${a.type}): $${a.balance}`).join('\n')}

RECENT TRANSACTIONS (last 20):
${transactions.map(t => `- ${t.type}: $${t.amount} on ${new Date(t.date).toLocaleDateString()} ${t.note ? `(${t.note})` : ''}`).join('\n')}

BUDGETS:
${budgets.map(b => `- ${b.category.name}: $${b.limitAmount} limit (${b.period})`).join('\n')}

GOALS:
${goals.map(g => `- ${g.name}: $${g.currentAmount} of $${g.targetAmount} ${g.isAchieved ? '(achieved!)' : ''}`).join('\n')}

Answer the user's question based on this data. Be concise and helpful.
    `;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: context,
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not generate a response.';

    return res.json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;