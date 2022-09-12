import joi from 'joi';

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

export {
    userCredentialsSchema,
    userDataSchema
};