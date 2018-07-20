'use strict';

const Toys = require('toys');

module.exports = Toys.onPreResponse((request, h) => {

    return h.continue; // TODO
});
