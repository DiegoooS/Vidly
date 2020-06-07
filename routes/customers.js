const auth = require('../middleware/auth');
const { Customer, validate } = require('../models/customer');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get( '/', async (req, res) => {
    const customers = await Customer.find().sort('name');
    res.send(customers);
});

router.post( '/', auth , async (req, res) => {
    const valid = validate(req.body);
    if(valid.error) return res.status(404).send(valid.error.message);

    const customer = new Customer({
        isGold: req.body.isGold,
        name: req.body.name,
        phone: req.body.phone
    });

    await customer.save();
    res.send(customer);
});

router.put ('/:id', auth , async (req, res) => {
    const valid = validate(req.body);
    if(valid.error) return res.status(404).send(valid.error.message);

    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        $set: {
            isGold: req.body.isGold || false,
            name: req.body.name,
            phone: req.body.phone
        }
    }, { new: true });
    if (!customer) return res.status(404).send('Customer with the given ID was not found in database');

    res.send(customer);
});

router.delete('/:id', auth , async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id);
    if (!customer) return res.status(404).send('Customer with the given ID was not found in database');

    res.send(customer);
});

router.get('/:id', async (req,res) => {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).send('Customer with the given ID was not found in database');

    res.send(customer);
});

module.exports = router;