'use strict';

const Joi = require('joi');

module.exports = class Dto {

    constructor(obj, opts) {

        const { value, error } = this.constructor.schema.validate(obj, opts);

        if (error) {
            throw error;
        }

        Object.assign(this, value);
    }

    static schema = Joi.any();

    static get validation() {

        return {
            validate: (obj, opts) => new this(obj, opts)
        };
    }

    static from(obj) {

        if (obj instanceof this) {
            return obj;
        }

        return new this(obj);
    }
};
