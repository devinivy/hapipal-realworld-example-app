'use strict';

// Load modules

const Fs = require('fs');
const Util = require('util');
const Bounce = require('bounce');
const Code = require('code');
const Lab = require('lab');
const Toys = require('toys');
const Newman = require('newman');
const Server = require('../server');

// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const { expect } = Code;

describe('Deployment', () => {

    it('passes postman tests', { timeout: 5000 }, async (flags) => {

        try {
            await Util.promisify(Fs.unlink)('.test.db');
        }
        catch (error) {
            Bounce.ignore(error, { code: 'ENOENT' });
        }

        const server = await Server.deployment(true);

        flags.onCleanup = async () => await server.stop();

        // Create a user to follow/unfollow (referenced within postman collection)

        await server.services().userService.signup({
            username: 'rick',
            password: 'secret-rick',
            email: 'rick@rick.com'
        });

        // Run postman tests

        const newman = Newman.run({
            reporters: 'cli',
            collection: require('./postman-collection.json'),
            environment: {
                values: [
                    {
                        enabled: true,
                        key: 'apiUrl',
                        value: `${server.info.uri}/api`,
                        type: 'text'
                    }
                ]
            }
        });

        await Toys.event(newman, 'done');

        expect(newman.summary.run.error).to.not.exist();
        expect(newman.summary.run.failures.length).to.equal(0);
    });
});
