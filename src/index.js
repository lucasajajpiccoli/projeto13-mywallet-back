import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.router.js';
import { walletRouter } from './routes/wallet.router.js';
import { cashRouter } from './routes/cash.router.js';

dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

server.use(authRouter);
server.use(walletRouter);
server.use(cashRouter);

server.listen(process.env.PORT, () => console.log("Listening on port " + process.env.PORT));
