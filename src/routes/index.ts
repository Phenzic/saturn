import { Router } from 'express';
import { userWalletRouter } from './userWallet.routes';

export const router = Router();

router.use('/user-wallet', userWalletRouter);


