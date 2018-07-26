'use strict';

const Toys = require('toys');

exports.withDefaults = Toys.withRouteDefaults({
    options: {
        validate: {
            failAction: (request, h, err) => {

                throw err;
            }
        }
    }
});

exports.currentUserId = Toys.reacher('auth.credentials.id');
