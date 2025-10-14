import { Router } from 'express';
import { createUserWallet } from '../controllers/userWallet.controller';

export const userWalletRouter = Router();

userWalletRouter.post('/', createUserWallet);


