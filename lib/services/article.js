'use strict';

const Schmervice = require('schmervice');

module.exports = class ArticleService extends Schmervice.Service {

    async find({ tag, author, favorited, limit, offset }, txn) {

        const { Article } = this.server.models();

        const query = Article.query(txn);

        // Note that these joins don't ruin the result count
        // only because each match must be unique or nil.

        if (tag) {
            query.innerJoinRelation('tags').where('tags.name', tag);
        }

        if (author) {
            query.innerJoinRelation('author').where('author.username', author);
        }

        if (favorited) {
            query.innerJoinRelation('favoritedBy').where('favoritedBy.username', favorited);
        }

        const [articles, total] = await Promise.all([
            query.limit(limit).offset(offset).orderBy('createdAt', 'desc'),
            query.resultSize()
        ]);

        return { articles, total };
    }
};
