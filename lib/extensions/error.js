'use strict';

const Boom = require('boom');
const Toys = require('toys');
const { NotFoundError, ValidationError } = require('objection');

const internals = {};

module.exports = Toys.onPreResponse((request, h) => {

    const { response: error } = request;
    const { formatError, mapError } = internals;

    if (!error.isBoom) {
        return h.continue;
    }

    throw formatError(mapError(error));
});

internals.mapError = (error) => {

    if (error.isJoi) {

        const validation = error.details.reduce((collector, { path, message }) => {

            const field = path[path.length - 1];

            return {
                ...collector,
                [field]: (collector[field] || []).concat(message)
            };
        }, {});

        return Boom.badData(null, { validation });
    }

    if (error instanceof ValidationError) {
        return Boom.badData(null, { validation: {} }); // No specifics, avoid leaking model details
    }

    if (error instanceof NotFoundError) {
        return Boom.notFound(`${error.modelName || Record} not found`);
    }

    return error;
};

internals.formatError = (error) => {

    const origPayload = error.output.payload;
    const payload = error.output.payload = { errors: {} };

    if (error.data && error.data.validation) {
        payload.errors = error.data.validation;
    }
    else {
        payload.errors = {
            [internals.camelize(origPayload.error)]: [origPayload.message]
        };
    }

    return error;
};

internals.camelize = (name) => {

    return name
        .replace(/[_ -]./g, (m) => m[1].toUpperCase())
        .replace(/^./, (m) => m.toLowerCase());
};
