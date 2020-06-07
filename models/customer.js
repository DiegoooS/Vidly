const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const Customer = new mongoose.model('Customer', new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    phone: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    }
}));

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(50).required(),
        phone: Joi.string().min(3).max(50).required(),
        isGold: Joi.boolean()
    });

    return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;