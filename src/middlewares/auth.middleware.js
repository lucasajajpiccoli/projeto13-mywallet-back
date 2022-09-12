import { db } from '../database/db.js';

import { userCredentialsSchema, userDataSchema } from "../schemas/auth.schema.js";

function areCredentialsValid(request, response, next) {
    const validation = userCredentialsSchema.validate(request.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return response.status(422).send(errors);
    }
    next();
}

async function areUserDataValid(request, response, next) {
    const validation = userDataSchema.validate(request.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return response.status(422).send(errors);
    }
    try {
        const existentUser = await db.collection('users').findOne({ email: request.body.email });
        if (existentUser) {
            return response.sendStatus(409);
        }

        next();
    } catch (error) {
        return response.status(500).send(error.message);
    }
}

export {
    areCredentialsValid,
    areUserDataValid
};