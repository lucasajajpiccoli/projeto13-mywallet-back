import { Router } from 'express';
import { areCredentialsValid, areUserDataValid } from '../middlewares/auth.middleware.js';
import { signIn, signUp } from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/signin', areCredentialsValid, signIn);

authRouter.post('/signup', areUserDataValid, signUp);

export {
    authRouter
};