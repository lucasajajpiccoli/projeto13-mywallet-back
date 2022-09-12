import { db } from '../database/db.js';

async function isAuthenticated (request, response, next) {
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return response.sendStatus(401);
    }

    try {
        const session = await db.collection('sessions').findOne({ token });
        if (!session) {
            return response.sendStatus(401);
        }

        response.locals.session = session;

        next();
    } catch (error) {
        return response.status(500).send(error.message);
    }
}

export {
    isAuthenticated
};