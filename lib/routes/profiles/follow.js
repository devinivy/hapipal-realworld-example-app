'use strict';

const Joi = require('joi');
const Boom = require('@hapi/boom');
const Helpers = require('../helpers');
const User = require('../../db/models/user');

module.exports = Helpers.withDefaults({
    method: 'post',
    path: '/profiles/{username}/follow',
    options: {
        validate: {
            params: Joi.object({
                username: User.field('username')
            })
        },
        auth: 'jwt',
        handler: async (request, h) => {

            const { username } = request.params;
            const { userService, displayService } = request.services();
            const currentUserId = Helpers.currentUserId(request);

            const user = await userService.findByUsername(username);

            if (user.id === currentUserId) {
                throw Boom.forbidden('You cannot follow yourself');
            }

            const followUserAndFetchProfile = async (txn) => {

                await userService.follow(currentUserId, user.id, txn);

                return await displayService.profile(currentUserId, user, txn);
            };

            const profile = await h.context.transaction(followUserAndFetchProfile);

            return { profile };
        }
    }
});
