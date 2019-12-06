'use strict';

const Schwifty = require('schwifty');

exports.Model = class extends Schwifty.Model {

    static createNotFoundError(ctx) {

        const error = super.createNotFoundError(ctx);

        return Object.assign(error, {
            modelName: this.name
        });
    }

    static field(name) {

        return this.getJoiSchema()
            .extract(name)
            .optional()
            .prefs({ noDefaults: true });
    }
};
