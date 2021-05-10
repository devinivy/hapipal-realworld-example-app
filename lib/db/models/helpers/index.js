'use strict';

const Schwifty = require('@hapipal/schwifty');

exports.Model = class extends Schwifty.Model {

    static createNotFoundError(ctx) {

        const error = super.createNotFoundError(ctx);

        return Object.assign(error, {
            modelName: this.name
        });
    }
};
