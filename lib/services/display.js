'use strict';

const Schmervice = require('schmervice');

module.exports = class DisplayService extends Schmervice.Service {

    user({ password, ...user }, token) {

        return { ...user, token };
    }
};
