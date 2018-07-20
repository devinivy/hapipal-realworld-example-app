'use strict';

const Joi = require('joi');
const Helpers = require('./helpers');
const Article = require('../models/article');

module.exports = Helpers.withDefaults({
    method: 'put',
    path: '/articles/{slug}/unfavorite',
    options: {
        validate: {
            params: {
                slug: Article.field('slug')
            }
        },
        auth: 'jwt',
        handler: async (request, h) => {

            const { credentials: { id: currentUserId } } = request.auth;
            const { slug } = request.params;
            const { articleService, displayService } = request.services();

            const article = await articleService.findBySlug(slug);

            const unfavoriteAndFetchArticle = async (txn) => {

                await articleService.unfavorite(currentUserId, article.id, txn);

                return await displayService.articles(currentUserId, article, txn);
            };

            return {
                article: await h.context.transaction(unfavoriteAndFetchArticle)
            };
        }
    }
});
