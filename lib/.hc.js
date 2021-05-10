'use strict';

const HauteCouture = require('@hapipal/haute-couture');

module.exports = {
    models: false,
    'db/models': HauteCouture.amendment('models')
};
