'use strict';

const Schmervice = require('schmervice');

const internals = {};

module.exports = class DisplayService extends Schmervice.Service {

    user({ password, ...user }, token) {

        return { ...user, token };
    }

    async profile(currentUserId, user, transaction)  {

        const { User } = this.server.models();
        const { toProfile } = internals;

        const result = await User.fetchGraph(user, `[
            followedBy(currentUser) as following
        ]`, {
            transaction
        }).modifiers({
            currentUser: (builder) => builder.where('Users.id', currentUserId)
        });

        return toProfile(result);
    }

    async articles(currentUserId, articles, transaction) {

        const { Article } = this.server.models();
        const { toArticle } = internals;

        const results = await Article.fetchGraph(articles, `[
            tags,
            favoritedBy(currentUser) as favorited,
            favoritedBy(count) as favoritesCount,
            author.[
                followedBy(currentUser) as following
            ]
        ]`, {
            transaction
        }).modifiers({
            currentUser: (builder) => builder.where('Users.id', currentUserId),
            count: (builder) => builder.count('* as count').groupBy('articleId')
        });

        return Array.isArray(results) ? results.map(toArticle) : toArticle(results);
    }

    tags(tags) {

        return tags.map((tag) => tag.name);
    }

    async comments(currentUserId, comments, transaction) {

        const { Comment } = this.server.models();
        const { toComment } = internals;

        const results = await Comment.fetchGraph(comments, `[
            author.[
                followedBy(currentUser) as following
            ]
        ]`, {
            transaction
        }).modifiers({
            currentUser: (builder) => builder.where('Users.id', currentUserId)
        });

        return Array.isArray(results) ? results.map(toComment) : toComment(results);
    }
};

internals.toProfile = ({ password, email, following, ...user }) => ({
    ...user,
    following: (following.length > 0)
});

internals.toArticle = ({ tags, favorited, favoritesCount, authorId, author, ...article }) => ({
    ...article,
    tagList: tags.map((tag) => tag.name),
    favorited: (favorited.length > 0),
    favoritesCount: favoritesCount[0] ? favoritesCount[0].count : 0,
    author: internals.toProfile(author)
});

internals.toComment = ({ articleId, authorId, author, ...comment }) => ({
    ...comment,
    author: internals.toProfile(author)
});
