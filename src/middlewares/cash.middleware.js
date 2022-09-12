import { db } from '../database/db.js';

import { transactionSchema } from '../schemas/cash.schema.js';

function decimalToInteger(value) {
    return parseInt(parseFloat(value.replace(",", ".")) * 100);
}

async function isTransactionValid(request, response, next) {
    const { nameTransaction } = request.params;
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { value, description } = request.body;

    const isValid = (nameTransaction === "in" || nameTransaction === "out")
    if (!isValid) {
        return response.status(400).send("Route parameter is not correct");
    }

    if (!token) {
        return response.sendStatus(401);
    }

    const decimalValue = decimalToInteger(value);
    const validation = transactionSchema.validate({
        value: decimalValue,
        description
    }, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return response.status(422).send(errors);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return response.sendStatus(401);
        }

        response.locals = {
            description,
            decimalValue,
            nameTransaction,
            session
        };
    
        next();
    } catch (error) {
        return response.status(500).send(error.message);
    }
}

export {
    isTransactionValid
};