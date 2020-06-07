const { User } = require('../../../models/user');
const jwt = require('jsonwebtoken');
const config = require('config');
const mongoose = require('mongoose');

describe('user.generateAuthToken', () => {
    it('should return a new valid token', () => {
        const payload = {
            _id: new mongoose.Types.ObjectId().toHexString(),
            isAdmin: true
        };
        const user = new User(payload);
        result = user.generateAuthToken();
        const decoded = jwt.verify(result, config.get('jwtPrivateKey'));
        expect(decoded).toMatchObject(payload);
    });
});