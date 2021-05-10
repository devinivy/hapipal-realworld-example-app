'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../db/models/user');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/profiles/{username}',
    options: {
        validate: {
            params: Joi.object({
                username: User.field('username')
            })
        },
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: async (request) => {

            const { username } = request.params;
            const { userService, displayService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const user = await userService.findByUsername(username);

            return {
                profile: await displayService.profile(currentUserId, user)
            };
        }
    }
});
