const validateReqBody = require('../middleware/validate');
const {Movie} = require('../models/movie');
const { Rental, validate } = require('../models/rental');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');


router.post('/', [auth, validateReqBody(validate)], async(req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if(!rental) return res.status(404).send('Rental not found');

    if(rental.dateReturned) return res.status(400).send('Rental already processed.');

    rental.return();
    rental.save();

    await Movie.update({ _id: rental.movie._id }, {
        $inc: {numberInStock: 1}
    });
    return res.send(rental);
});

module.exports = router;

