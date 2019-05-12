'use strict';

const Joi = require('@hapi/joi');
const Schwifty = require('schwifty');
const { DbErrors } = require('objection-db-errors');

exports.Model = class extends DbErrors(Schwifty.Model) {

    static createNotFoundError(ctx) {

        const error = super.createNotFoundError(ctx);

        return Object.assign(error, {
            modelName: this.name
        });
    }

    static field(name) {

        return Joi.reach(this.getJoiSchema(), name)
            .optional()
            .options({ noDefaults: true });
    }
};
