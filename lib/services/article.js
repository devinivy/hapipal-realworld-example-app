'use strict';

const Hoek = require('@hapi/hoek');
const Bounce = require('@hapi/bounce');
const Schmervice = require('@hapipal/schmervice');
const { UniqueViolationError } = require('objection');
const { ArticleUpdateDto } = require('../dtos/article');

module.exports = class ArticleService extends Schmervice.Service {

    async findById(id, txn) {

        const { Article } = this.server.models();

        return await Article.query(txn).throwIfNotFound().findById(id);
    }

    async findBySlug(slug, txn) {

        const { Article } = this.server.models();

        return await Article.query(txn).throwIfNotFound().first().where({ slug });
    }

    async find({ tag, author, favorited, limit, offset }, txn) {

        const { Article } = this.server.models();

        const query = Article.query(txn);

        // Note that these joins don't ruin the result count
        // only because each match must be unique or nil.

        if (tag) {
            query.innerJoinRelated('tags').where('tags.name', tag);
        }

        if (author) {
            query.innerJoinRelated('author').where('author.username', author);
        }

        if (favorited) {
            query.innerJoinRelated('favoritedBy').where('favoritedBy.username', favorited);
        }

        const [articles, total] = await Promise.all([
            query.limit(limit).offset(offset).orderBy('createdAt', 'desc'),
            query.resultSize()
        ]);

        return { articles, total };
    }

    async feed(currentUserId, { limit, offset }, txn) {

        const { Article } = this.server.models();

        const query = Article.query(txn)
            .joinRelated('author.followedBy')
            .where('author:followedBy.id', currentUserId);

        const [articles, total] = await Promise.all([
            query.limit(limit).offset(offset).orderBy('createdAt', 'desc'),
            query.resultSize()
        ]);

        return { articles, total };
    }

    async create(currentUserId, { tagList, ...articleInfo }, txn) {

        const { Article, Tag } = this.server.models();

        if (tagList) {
            const ensureTag = async (name) => await this._ensureTag(name, txn);
            await Promise.all(tagList.map(ensureTag));
        }

        const tags = tagList && await Tag.query(txn).select('id').whereIn('name', tagList);

        const { id } = await Article.query(txn).insertGraph({
            ...articleInfo,
            authorId: currentUserId,
            tags
        }, {
            relate: true
        });

        return id;
    }

    async update(id, dto, txn) {

        const { Article, Tag } = this.server.models();
        const { article: { tagList, ...articleInfo } } = ArticleUpdateDto.from(dto);

        if (tagList) {
            const ensureTag = async (name) => await this._ensureTag(name, txn);
            await Promise.all(tagList.map(ensureTag));
        }

        const tags = tagList && await Tag.query(txn).select('id').whereIn('name', tagList);

        await Article.query(txn).upsertGraph({
            ...articleInfo,
            id,
            tags
        }, {
            relate: true,
            unrelate: true
        });

        return id;
    }

    async _ensureTag(name, txn) {

        const { Tag } = this.server.models();

        try {
            await Tag.query(txn).insert({ name });
        }
        catch (err) {
            Bounce.ignore(err, UniqueViolationError);
        }
    }

    async delete(id, txn) {

        const { Article } = this.server.models();

        await Article.query(txn).throwIfNotFound().delete().where({ id });
    }

    async favorite(currentUserId, id, txn) {

        const { Article } = this.server.models();

        try {
            await Article.relatedQuery('favoritedBy', txn).for(id).relate(currentUserId);
        }
        catch (err) {
            Bounce.ignore(err, UniqueViolationError);
        }
    }

    async unfavorite(currentUserId, id, txn) {

        const { Article } = this.server.models();

        await Article.relatedQuery('favoritedBy', txn).for(id)
            .unrelate().where({ id: currentUserId });
    }

    async tags(txn) {

        const { Tag } = this.server.models();

        return await Tag.query(txn);
    }

    async findCommentById(commentId, txn) {

        const { Comment } = this.server.models();

        return await Comment.query(txn).throwIfNotFound().findById(commentId);
    }

    async findCommentsByArticle(articleId, txn) {

        const { Comment } = this.server.models();

        return await Comment.query(txn).where({ articleId }).orderBy('createdAt', 'desc');
    }

    async addComment(currentUserId, articleId, { body }, txn) {

        const { Comment } = this.server.models();

        const { id } = await Comment.query(txn).insert({
            authorId: currentUserId,
            articleId,
            body
        });

        return id;
    }

    async removeComment(commentId, txn) {

        const { Comment } = this.server.models();

        return await Comment.query(txn).delete().where({ id: commentId });
    }
};
