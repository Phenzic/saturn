import { Router } from 'express';
import { userWalletRouter } from './userWallet.routes';
import { metadataRouter } from './metadata.routes';

export const router = Router();

router.use('/user-wallet', userWalletRouter);
router.use('/contracts', metadataRouter);


