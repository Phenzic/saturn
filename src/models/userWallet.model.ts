import { pool } from './db';

export type UserWallet = {
  id: string;
  user_id: string;
  wallet_address: string;
  created_at: string;
  deleted_at: string | null;
};

export async function insertUserWallet(user_id: string, wallet_address: string): Promise<UserWallet> {
  const q = `
    insert into user_wallet (user_id, wallet_address)
    values ($1, $2)
    returning id, user_id, wallet_address, created_at, deleted_at
  `;
  const res = await pool.query(q, [user_id, wallet_address.toLowerCase()]);
  return res.rows[0] as UserWallet;
}


