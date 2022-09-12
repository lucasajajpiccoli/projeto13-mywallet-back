import { db } from '../database/db.js';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

async function signIn (request, response) {
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
}

async function signUp (request, response) {
    const { name, email } = request.body;

    try {
        const password = bcrypt.hashSync(request.body.password, 10);

        const insertion = await db.collection('users').insertOne({name, email, password});
        await db.collection('wallets').insertOne({userId: insertion.insertedId, transactions: []});
        response.sendStatus(200);
    } catch (error) {
        response.status(500).send(error.message);
    }
}

export {
    signIn,
    signUp
};