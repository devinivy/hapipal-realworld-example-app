'use strict';

const Joi = require('joi');
const { Model } = require('./helpers');

module.exports = class Tag extends Model {

    static tableName = 'Tags';

    static joiSchema = Joi.object({
        id: Joi.number().integer().greater(0),
        name: Joi.string().required()
    });
};
