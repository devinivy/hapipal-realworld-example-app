'use strict';

const Util = require('util');

const Boom = require('boom');
const SecurePassword = require('secure-password');
const Schmervice = require('schmervice');
const JWT = require('jsonwebtoken');

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

        const { id } = await User.query(txn).insert(userInfo);

        await this.changePassword(id, password, txn);

        return id;
    }

    async login({ email, password }, txn) {

        const { User } = this.server.models();

        const user = await User.query(txn).first().where({
            email: User.raw('? collate nocase', email)
        });

        if (!user) {
            throw Boom.notFound('User not found');
        }

        const passwordCheck = await this.pwd.verify(Buffer.from(password), user.password);

        if (passwordCheck === SecurePassword.VALID_NEEDS_REHASH) {
            await this.changePassword(user.id, password, txn);
        }
        else if (passwordCheck !== SecurePassword.VALID) {
            throw Boom.notFound('User not found');
        }

        return user;
    }

    async createToken(id) {

        return await JWT.sign({ id }, this.options.jwtKey, {
            algorithm: 'HS256',
            expiresIn: '7d'
        });
    }

    async changePassword(id, password, txn) {

        const { User } = this.server.models();

        return await User.query(txn).where({ id }).patch({
            password: await this.pwd.hash(Buffer.from(password))
        });
    }
};
