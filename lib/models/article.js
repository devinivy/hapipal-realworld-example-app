'use strict';

const Schwifty = require('schwifty');
const Joi = require('joi');
const Slugify = require('slugify');

const internals = {};

module.exports = class Article extends Schwifty.Model {

    static get tableName() {

        return 'Articles';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            createdAt: Joi.date(),
            updatedAt: Joi.date(),
            authorId: Joi.number().integer().greater(0).required(),
            slug: Joi.string(),
            title: Joi.string().required(),
            description: Joi.string().required(),
            body: Joi.string().required()
        });
    }

    static get relationMappings() {

        const Tag = require('./tag');
        const User = require('./user');

        return {
            author: {
                relation: Schwifty.Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'Articles.authorId',
                    to: 'Users.id'
                }
            },
            tags: {
                relation: Schwifty.Model.ManyToManyRelation,
                modelClass: Tag,
                join: {
                    from: 'Articles.id',
                    through: {
                        from: 'ArticleTags.articleId',
                        to: 'ArticleTags.tagId'
                    },
                    to: 'Tags.id'
                }
            },
            favoritedBy: {
                relation: Schwifty.Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'Articles.id',
                    through: {
                        from: 'ArticleFavorites.articleId',
                        to: 'ArticleFavorites.userId'
                    },
                    to: 'Users.id'
                }
            },
        };
    }

    $beforeInsert() {

        const now = new Date();

        this.createdAt = now;
        this.updatedAt = now;
        this._setSlug();
    }

    $beforeUpdate() {

        const now = new Date();

        this.updatedAt = now;
        this._setSlug();
    }

    $parseDatabaseJson(json) {

        json = super.$parseDatabaseJson(json);

        json.createdAt = json.createdAt && new Date(json.createdAt);
        json.updatedAt = json.updatedAt && new Date(json.updatedAt);

        return json;
    }

    _setSlug() {

        if (typeof this.title !== 'undefined') {
            this.slug = Slugify(this.title, { lower: true });
        }

        return this;
    }
};
