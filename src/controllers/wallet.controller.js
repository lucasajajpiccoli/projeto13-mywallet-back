import { db } from '../database/db.js';

function getIntegerTotal (transactions) {
    let value = 0;
    transactions.forEach(transaction => {
        if (transaction.type === "in") {
            value += transaction.value;
        } else {
            value -= transaction.value;
        }
    });
    const type = value >= 0 ? "in" : "out";
    value = Math.abs(value);
    return {type, value};
}

function integerToDecimal (transactions, total) {
    const decimalTransactions = transactions.map(transaction => ({
        ...transaction,
        value: ((transaction.value)/100).toFixed(2).replace(".", ",")
    }));
    const decimalTotal = {
        ...total,
        value: ((total.value)/100).toFixed(2).replace(".", ",")
    };
    return { decimalTransactions, decimalTotal };
}

async function readWallet (request, response) {
    const { session } = response.locals;

    try {
        const wallet = await db.collection('wallets').findOne({ userId: session.userId });
        const integerTotal = getIntegerTotal(wallet.transactions);
        const {
            decimalTransactions: transactions,
            decimalTotal : total
        } = integerToDecimal(wallet.transactions, integerTotal);

        response.send({transactions, total});
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export {
    readWallet
};