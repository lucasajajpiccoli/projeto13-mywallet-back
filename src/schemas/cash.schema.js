import joi from 'joi';

const transactionSchema = joi.object({
    value: joi.number().integer().required(),
    description: joi.string().required()
});

export {
    transactionSchema
};