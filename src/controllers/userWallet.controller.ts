import { Request, Response } from 'express';
import { z } from 'zod';
import { insertUserWallet } from '../models/userWallet.model';

const createSchema = z.object({
  user_id: z.string().uuid(),
  user_wallet: z.string().min(1),
});

export async function createUserWallet(req: Request, res: Response) {
  const parse = createSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid body', details: parse.error.flatten() });
  }

  try {
    const created = await insertUserWallet(parse.data.user_id, parse.data.user_wallet);
    return res.status(201).json(created);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'server error' });
  }
}


