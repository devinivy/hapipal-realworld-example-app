'use strict';

const Toys = require('@hapipal/toys');

exports.withDefaults = Toys.withRouteDefaults({
    options: {
        cors: true,
        validate: {
            failAction: (request, h, err) => {

                throw err;
            }
        }
    }
});

exports.currentUserId = Toys.reacher('auth.credentials.id', { default: null });
