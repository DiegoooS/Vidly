const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');
const mongoose = require('mongoose');

let server;

describe('/api/genres', () => {
    beforeEach(() => { server = require('../../index'); });
    afterEach( async() => {
        await server.close();
        await Genre.remove({});
    });

    describe('GET /', () => {
        it('should return all genres',async () => {
            await Genre.collection.insertMany([
                { name: 'genre1'},
                { name: 'genre2'}
            ]);

            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });

    describe('GET /:id', () => {
        it('should return one genre if valid id is passed',async () => {
            const genre = new Genre({ name: 'genre1'});
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 genre if no genre with the given ID exist',async () => {
            const id = mongoose.Types.ObjectId().toHexString();
            const res = await request(server).get(`/api/genres/${id}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', () => {

        //define a Happy Path, and then in each test, we change one parameter that clearly
        // aligns with the name of the test.
        let token;
        let name;

        const exec = async() => {
            return await request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 3 characters', async() => {
            name = '12';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async() => {
            name = Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save genre if it is valid', async() => {
            const res = await exec();

            const genre = await Genre.find({ name: 'genre1' });

            expect(genre).not.toBeNull();
            expect(res.status).toBe(200);
        });

        it('should return the genre if it is valid', async() => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
            expect(res.status).toBe(200);
        });
    });

    describe('PUT /', () => {
        let token;
        let name;
        let genre;
        let id;

        const exec = () => {
            return request(server)
                .put(`/api/genres/${id}`)
                .set('x-auth-token', token)
                .send({ name });
        };

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'newGenre';

            genre = new Genre({ name:'genre' });
            genre.save();
            id = genre._id;
        });

        it('should change name of the given genre and return it', async() => {
            const res = await exec();

            expect(res.body).toHaveProperty('name', name);
        });

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return status 400 if name is less than 3 characters', async() => {
            name = 'ge';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 400 if name is more than 50 characters', async() => {
            name = Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return status 404 if genre was not founded', async() => {
            id = mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(404);
        });
    });

    describe('DELETE /', () => {

        let token;
        let isAdmin;
        let id;

        const exec = () => {
            return request(server)
                .delete(`/api/genres/${id}`)
                .set('x-auth-token', token);
        };

        beforeEach(() => {
            isAdmin = true;
            let user = { isAdmin: isAdmin };
            token = new User(user).generateAuthToken();

            genre = new Genre({ name:'genre' });
            genre.save();
            id = genre._id;
        });

        it('should delete genre with the given ID', async() =>{
            let res = await exec();

            expect(res.status).toBe(200);
        });

        it('should not delete genre and return status 403 if user is not a admin', async() => {
            isAdmin = false;
            user = { isAdmin: isAdmin };
            token = new User(user).generateAuthToken();

            let res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return status 404 if genre was not founded', async() => {
            id = mongoose.Types.ObjectId().toHexString();

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 401 if client is not logged in', async() => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });
    });
});