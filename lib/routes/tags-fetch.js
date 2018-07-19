'use strict';

const Joi = require('joi');
const Helpers = require('./helpers');
const User = require('../models/user');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/tags',
    options: {
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: async (request) => {

            const { articleService, displayService } = request.services();

            const tags = await articleService.tags();

            return {
                tags: displayService.tags(tags)
            };
        }
    }
});
