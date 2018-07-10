'use strict';

const Joi = require('joi');
const Helpers = require('./helpers');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/users',
    options: {
        auth: 'jwt',
        handler: async (request, h) => {

            const { credentials: user, artifacts: token } = request.auth;
            const { displayService } = request.services();

            return {
                user: displayService.user(user, token)
            };
        }
    }
});
