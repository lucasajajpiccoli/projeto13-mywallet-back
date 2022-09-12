import { Router } from 'express';
import { isTransactionValid } from '../middlewares/cash.middleware.js';
import { createTransaction } from '../controllers/cash.controller.js';

const cashRouter = Router();

cashRouter.post('/cash/:nameTransaction', isTransactionValid, createTransaction);

export {
    cashRouter
};