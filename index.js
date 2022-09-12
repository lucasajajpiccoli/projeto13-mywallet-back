import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import joi from 'joi';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

const server = express();
server.use(cors());
server.use(express.json());

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => { db = mongoClient.db('mywallet') });

const userCredentialsSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

const userDataSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    passwordConfirmation: joi.valid(joi.ref('password')).required()
});

const transactionSchema = joi.object({
    value: joi.number().integer().required(),
    description: joi.string().required()
});

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

function decimalToInteger (value) {
    return parseInt(parseFloat(value.replace(",", "."))*100);
}

server.post('/signin', async (request, response) => {
    const validation = userCredentialsSchema.validate(request.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return response.status(422).send(errors);
    }

    const { email, password } = request.body;

    try {
        const user = await db.collection('users').findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = uuid();
            const name = user.name;
            await db.collection('sessions').insertOne({ userId: user._id, token });
            response.send({ token, name });
        } else {
            response.sendStatus(401);
        }
    } catch (error) {
        response.status(500).send(error.message);
    }
});

server.post('/signup', async (request, response) => {
    const validation = userDataSchema.validate(request.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return response.status(422).send(errors);
    }

    const { name, email } = request.body;

    try {
        const existentUser = await db.collection('users').findOne({ email });
        if (existentUser) {
            return response.sendStatus(409);
        }

        const password = bcrypt.hashSync(request.body.password, 10);

        const insertion = await db.collection('users').insertOne({name, email, password});
        await db.collection('wallets').insertOne({userId: insertion.insertedId, transactions: []});
        response.sendStatus(200);
    } catch (error) {
        response.status(500).send(error.message);
    }
});

server.get('/wallet', async (request, response) => {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return response.sendStatus(401);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return response.sendStatus(401);
        }

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
});

server.post('/cash/:nameTransaction', async (request, response) => {
    const { nameTransaction } = request.params;
    const token = request.headers.authorization?.replace('Bearer ', '');
    const { value, description } = request.body;

    const isValid = (nameTransaction === "in" || nameTransaction === "out")
    if (!isValid) {
        return response.status(400).send("Route parameter is not correct");
    }

    if(!token) {
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
});

server.listen(5000, () => console.log("Listening on port 5000"));