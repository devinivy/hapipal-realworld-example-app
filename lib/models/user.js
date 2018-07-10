'use strict';

const Schwifty = require('schwifty');
const { DbErrors } = require('objection-db-errors');
const Joi = require('joi');
const Boom = require('boom');

module.exports = class User extends DbErrors(Schwifty.Model) {

    static get tableName() {

        return 'Users';
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            email: Joi.string().email().required(),
            username: Joi.string().required(),
            password: Joi.binary(),
            bio: Joi.string().empty('').allow(null).default(null),
            image: Joi.string().uri().empty('').allow(null).default(null)
        });
    }

    static createNotFoundError() {

        return Boom.notFound('User not found');
    }

    static field(name) {

        return Joi.reach(this.getJoiSchema(true), name).options({ noDefaults: true });
    }

    static get relationMappings() {

        return {
            following: {
                relation: Schwifty.Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'Users.id',
                    through: {
                        from: 'Followers.followerId',
                        to: 'Followers.userId'
                    },
                    to: 'Users.id'
                }
            },
            followedBy: {
                relation: Schwifty.Model.ManyToManyRelation,
                modelClass: User,
                join: {
                    from: 'Users.id',
                    through: {
                        from: 'Followers.userId',
                        to: 'Followers.followerId'
                    },
                    to: 'Users.id'
                }
            }
        };
    }
};
