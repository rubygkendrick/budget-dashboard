// Categories routes: create, read, update, and delete categories for the logged in user.
import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import prisma from "../db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/categories
router.post("/", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, type, parentId } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: "Name and type are required" });
  }

  try {
    const category = await prisma.category.create({
      data: {
        id: uuidv4(),
        userId: req.userId!,
        name,
        type,
        parentId: parentId || null,
      },
    });
    return res.status(201).json(category);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/categories
router.get("/", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.userId! },
    });
    return res.json(categories);
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/categories/:id
router.put("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  try {
    await prisma.category.updateMany({
      where: { id: String(req.params.id), userId: req.userId! },
      data: { name },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/categories/:id
router.delete("/:id", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.category.deleteMany({
      where: { id: String(req.params.id), userId: req.userId! },
    });
    return res.status(204).send();
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
