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

exports.present = {};

exports.present.user = ({ password, ...user }, token) => ({
    ...user,
    token
});
