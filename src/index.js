import express from 'express';
import cors from 'cors';

import { authRouter } from './routes/auth.router.js';
import { walletRouter } from './routes/wallet.router.js';
import { cashRouter } from './routes/cash.router.js';

const server = express();
server.use(cors());
server.use(express.json());

server.use(authRouter);
server.use(walletRouter);
server.use(cashRouter);

server.listen(5000, () => console.log("Listening on port 5000"));