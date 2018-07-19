'use strict';

const Joi = require('joi');
const Helpers = require('./helpers');
const Article = require('../models/article');

module.exports = Helpers.withDefaults({
    method: 'get',
    path: '/articles/{slug}',
    options: {
        validate: {
            params: {
                slug: Article.field('slug')
            }
        },
        auth: { strategy: 'jwt', mode: 'optional' },
        handler: async (request) => {

            const { slug } = request.params;
            const { credentials } = request.auth;
            const { articleService, displayService } = request.services();

            const article = await articleService.findBySlug(slug);
            const currentUserId = credentials && credentials.id;

            return {
                article: await displayService.articles(currentUserId, article)
            };
        }
    }
});
