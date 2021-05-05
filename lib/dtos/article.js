'use strict';

const Joi = require('joi');
const Article = require('../models/article');
const Tag = require('../models/tag');
const Dto = require('./base');

exports.ArticleUpdateDto = class ArticleUpdateDto extends Dto {
    static schema = Joi.object({
        article: Joi.object().required().keys({
            title: Article.field('title'),
            description: Article.field('description'),
            body: Article.field('body'),
            tagList: Joi.array().items(Tag.field('name'))
        })
    });
};
