import { Router } from 'express';
import { isAuthenticated } from '../middlewares/wallet.middleware.js';
import { readWallet } from '../controllers/wallet.controller.js';

const walletRouter = Router();

walletRouter.use(isAuthenticated);

walletRouter.get('/wallet', readWallet);

export {
    walletRouter
};