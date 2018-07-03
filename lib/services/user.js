'use strict';

const Util = require('util');

const Boom = require('boom');
const SecurePassword = require('secure-password');
const Schmervice = require('schmervice');
const JWT = require('jsonwebtoken');
const Objection = require('objection');

module.exports = class UserService extends Schmervice.Service {

    constructor(...args) {

        super(...args);

        const pwd = new SecurePassword();

        this.pwd = {
            hash: Util.promisify(pwd.hash.bind(pwd)),
            verify: Util.promisify(pwd.verify.bind(pwd))
        };
    }

    async findById(id, txn) {

        const { User } = this.server.models();

        return await User.query(txn).findById(id);
    }

    async signup({ password, ...userInfo }, txn) {

        const { User } = this.server.models();

        const user = await User.query(txn).insert(userInfo);

        await this.changePassword(user.id, password, txn);

        return user;
    }

    async login({ email, password }, txn) {

        const { User } = this.server.models();

        const user = await User.query(txn).first().where({ email });

        if (!user) {
            throw Boom.notFound('User not found');
        }

        const passwordCheck = await this.pwd.verify(Buffer.from(password), user.password);

        if (passwordCheck === SecurePassword.VALID_NEEDS_REHASH) {
            await this.changePassword(user.id, password, txn);
        }

        if (passwordCheck !== SecurePassword.VALID) {
            throw Boom.notFound('User not found');
        }

        const jwt = await JWT.sign({ id: user.id }, this.options.jwtKey, {
            algorithm: 'HS256',
            expiresIn: '7d'
        });

        return { user, jwt };
    }

    async changePassword(id, password, txn) {

        const { User } = this.server.models();

        return await User.query(txn).where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        });
    }
};
