'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');

module.exports = class User extends Schwifty.Model {

    static get tableName() {

        return 'Users';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            email: Joi.string().email().required(),
            password: Joi.binary()
        });
    }
};
