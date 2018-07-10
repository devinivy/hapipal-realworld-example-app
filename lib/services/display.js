'use strict';

const Schmervice = require('schmervice');

module.exports = class DisplayService extends Schmervice.Service {

    user({ password, ...user }, token) {

        return { ...user, token };
    }

    async profile(currentUserId, user, txn)  {

        const { User } = this.server.models();

        const result = await User.loadRelated(user, 'followedBy(currentUser)', {
            currentUser: (builder) => builder.where('id', currentUserId)
        }, txn);

        const toProfile = ({ password, followedBy, ...user }) => ({
            ...user,
            following: (followedBy.length > 0)
        });

        return toProfile(result);
    }
};
