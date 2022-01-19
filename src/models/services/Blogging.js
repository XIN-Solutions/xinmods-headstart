/*
     ____  _                   _
    | __ )| | ___   __ _  __ _(_)_ __   __ _
    |  _ \| |/ _ \ / _` |/ _` | | '_ \ / _` |
    | |_) | | (_) | (_| | (_| | | | | | (_| |
    |____/|_|\___/ \__, |\__, |_|_| |_|\__, |
                   |___/ |___/         |___/

    Purpose:

        To interface with bloomreach regarding blogging related documents.

 */

const _ = require('lodash');

const PostFetch = [
    "heroImage/link",
    "author/link",
    "items/images/*/link",
    "text/links/*"
];

const AuthorFetch = [
    "image/link"
];

module.exports = {

    /**
     *
     * @param hippo {HippoConnection}
     * @param path {string}
     * @returns {Promise<void>}
     */
    async getPostAtPath(hippo, path) {
        const doc = await hippo.getDocumentByPath(`/content/documents/blog/articles/${path}`, {fetch: PostFetch});
        return doc;
    },

    /**
     * @param hippo {HippoConnection}
     * @param storyTags {string|string[]}
     * @returns {Promise<void>}
     */
    async getPostsWithStoryTag(hippo, storyTags) {
        const allTags = _.isArray(storyTags) ? storyTags : [storyTags];
        const tags = allTags.map(el => `xinmods:storyTag/${el}`).join("/");
        const docsWithTag = await hippo.getFacetAtPath("/content/facets/blogs-story-tags", tags, {fetch: PostFetch});
        return docsWithTag.results;
    },


    /**
     * @param hippo {HippoConnection}
     * @param path {string}
     * @returns {Promise<void>}
     */
    async getAuthorAtPath(hippo, path) {
        const doc = await hippo.getDocumentByPath(`/content/documents/blog/authors/${path}`, {fetch: AuthorFetch});
        return doc;
    },


    /**
     * Get all products from the repository.
     *
     * @param hippo {HippoConnection} the hippo connection to use.
     * @param limit {?number} a potential limit
     * @returns {Promise<*[]>}
     */
    async getAllAuthors(hippo, limit = null) {

        const query = (
            hippo.newQuery()
                .type("xinmods:blogauthor")
                .includePath("/content/documents")
                .orderBy("hippostdpubwf:publicationDate", "desc")
        );

        if (limit !== null) {
            query.limit(limit);
        }

        const results = await hippo.executeQuery(query.build(), {fetch: AuthorFetch});
        return {totalSize: results.totalSize, authors: results.documents};
    },


    /**
     * Get a list of posts by a particular author
     *
     * @param hippo {HippoConnection} the hippo connection
     * @param author {object} the author document to use
     * @param limit {number} the max number of items to retrieve, default: 50.
     * @returns {Promise<Object>}
     */
    async getPostsByAuthor(hippo, author, limit = 50) {

        const query = (
            hippo.newQuery()
                .type("xinmods:blog")
                .includePath("/content/documents")
                .orderBy("hippostdpubwf:publicationDate", "desc")
                .where().equals("xinmods:author/hippo:docbase", author.id).end()
                .limit(limit)
                .build()
        );

        const results = await hippo.executeQuery(query, {fetch: PostFetch});
        return {totalSize: results.totalSize, articles: results.documents};
    },

    /**
     * Get all products from the repository.
     *
     * @param hippo {HippoConnection} the hippo connection to use.
     * @param limit {?number} a potential limit
     * @returns {Promise<{}>}
     */
    async getAllPosts(hippo, limit = null) {

        const query = (
            hippo.newQuery()
                .type("xinmods:blog")
                .includePath("/content/documents")
                .orderBy("hippostdpubwf:publicationDate", "desc")
        );

        if (limit !== null) {
            query.limit(limit);
        }

        const results = await hippo.executeQuery(query.build(), {fetch: PostFetch});
        return {totalSize: results.totalSize, articles: results.documents};
    }


};
