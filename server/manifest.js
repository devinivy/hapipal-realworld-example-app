'use strict';

const Dotenv = require('dotenv');
const Confidence = require('confidence');
const Toys = require('toys');

// Pull .env into process.env
Dotenv.config({ path: `${__dirname}/.env` });

// Glue manifest as a confidence store
module.exports = new Confidence.Store({
    server: {
        host: '0.0.0.0',
        port: {
            $filter: 'NODE_ENV',
            $default: process.env.PORT || 3000,
            test: { $value: undefined }         // Let the server find an open port
        },
        debug: {
            $filter: 'NODE_ENV',
            development: {
                log: ['error', 'implementation', 'internal'],
                request: ['error', 'implementation', 'internal']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '../lib', // Main plugin
                routes: {
                    prefix: '/api'
                },
                options: {
                    jwtKey: {
                        $filter: 'NODE_ENV',
                        $default: process.env.APP_SECRET,
                        test: 'app-secret'
                    }
                }
            },
            {
                plugin: {
                    $filter: 'NODE_ENV',
                    $default: 'hpal-debug',
                    production: Toys.noop
                }
            },
            {
                plugin: 'schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        migrateOnStart: true,
                        knex: {
                            client: 'sqlite3',
                            useNullAsDefault: true,         // Suggested for sqlite3
                            connection: {
                                filename: `.${process.env.NODE_ENV || 'tmp'}.db`
                            }
                        }
                    },
                    production: {
                        migrateOnStart: false
                    }
                }
            }
        ]
    }
});
