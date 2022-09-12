import { db } from '../database/db.js';
import dayjs from 'dayjs';

async function createTransaction (request, response) {
    const { description, decimalValue, nameTransaction, session } = response.locals;
    
    try {
        const newTransaction = {
            date: dayjs().format('DD/MM'),
            description,
            value: decimalValue,
            type: nameTransaction
        };

        const { userId } = session;
        const wallet = await db.collection('wallets').findOne({ userId });
        const updatedTransactions = [...wallet.transactions, newTransaction];
        await db.collection('wallets')
            .updateOne({ userId }, { $set: { transactions: updatedTransactions }});

        response.sendStatus(200);
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export {
    createTransaction
};