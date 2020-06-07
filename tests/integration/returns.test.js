const { Movie } = require('../../models/movie');
const moment = require('moment');
const { User } = require('../../models/user');
const request = require('supertest');
const { Rental } = require('../../models/rental');
const mongoose = require('mongoose');
describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId;
    let rental;
    let movie;

    beforeEach(async() => {
        server = require('../../index');

        movie = new Movie({
            title: '12345',
            genre: {
                name: 'fantasy'
            },
            numberInStock: 100,
            dailyRentalRate: 2
        });

        await movie.save();

        customerId = mongoose.Types.ObjectId().toHexString();
        movieId = movie._id;

        rental = new Rental({
            customer: {
                _id: customerId,
                name: '12345',
                phone: '12345'
            },
            movie: {
                _id: movieId,
                title: '12345',
                dailyRentalRate: 2
            },
        });

        await rental.save();
    });
    afterEach( async() => {
        await server.close();
        await Rental.remove({});
        await Movie.remove({});
    });

    describe('POST /', () => {
        let token;

        const exec = () => {
            return request(server)
                .post('/api/returns')
                .send({ customerId, movieId })
                .set('x-auth-token', token);
        };

        beforeEach(() => {
            token = new User().generateAuthToken();

        });

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if customerId is not provided', async() => {
            customerId = '';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if movieId is not provided', async() => {
            movieId = '';
            rental.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if no rental found for customer/movie', async() => {
            customerId = mongoose.Types.ObjectId().toHexString();
            movieId = mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 400 if rental is already processed', async() => {
            rental.dateReturned = new Date();
            await rental.save();

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 200 if request is valid', async() => {
            const res = await exec();

            expect(res.status).toBe(200);
        });

        it('should set the return date', async() => {
            const res = await exec();

            const diff = new Date() - Date.parse(res.body.dateReturned);
            expect(diff).toBeLessThan(10 * 1000);
        });

        it('should calculate the rental fee', async() => {

            rental.dateOut = moment().add(-7, 'days').toDate();
            await rental.save();

            const res = await exec();

            expect(res.body.rentalFee).toBe(14);
        });

        it('should increase the stock', async() => {
            let stockBefore = movie.numberInStock;

            const res = await exec();

            stockBefore++;

            const movieInDb = await Movie.findById(movie._id);

            expect(movieInDb.numberInStock).toBe(stockBefore);
        });

        it('should return body of the response', async() => {
            const res = await exec();

            expect(Object.keys(res.body)).toEqual(
                expect.arrayContaining(['dateOut', 'dateReturned', 'rentalFee', 'customer', 'movie'])
            );
        });
    });
});