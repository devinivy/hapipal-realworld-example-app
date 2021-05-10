'use strict';

const Joi = require('joi');
const Helpers = require('../helpers');
const User = require('../../db/models/user');

module.exports = Helpers.withDefaults({
    method: 'post',
    path: '/users',
    options: {
        validate: {
            payload: Joi.object({
                user: Joi.object().required().keys({
                    email: User.field('email').required(),
                    password: Joi.string().required(),
                    username: User.field('username').required(),
                    bio: User.field('bio'),
                    image: User.field('image')
                })
            })
        },
        handler: async (request, h) => {

            const { user: userInfo } = request.payload;
            const { userService, displayService } = request.services();

            const signupAndFetchUser = async (txn) => {

                const id = await userService.signup(userInfo, txn);

                return await userService.findById(id, txn);
            };

            const user = await h.context.transaction(signupAndFetchUser);
            const token = userService.createToken(user.id);

            return {
                user: displayService.user(user, token)
            };
        }
    }
});
