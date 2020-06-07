const validateObjectId = require('../middleware/validateObjectId');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { Genre, validate } = require('../models/genre');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name');
    res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send('Genre with given the ID was not found in database');

    res.send(genre);
});

router.post('/', auth , async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = new Genre({ name: req.body.name });

    await genre.save();
    res.send(genre);
});

router.put('/:id', auth , async (req, res) => {
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const genre = await Genre.findByIdAndUpdate(req.params.id, {
        $set: { name: req.body.name }
    }, { new: true });
    if (!genre) return res.status(404).send('Genre with the given ID was not found in database');

    res.send(genre);
});

router.delete('/:id', [auth, admin] , async (req, res) => {
        const genre = await Genre.findByIdAndRemove(req.params.id);
        if (!genre) return res.status(404).send('Genre with given the ID was not found in database');

        res.send(genre);
});

module.exports = router;