/*
     ____  _                   _                ____            _             _ _
    | __ )| | ___   __ _  __ _(_)_ __   __ _   / ___|___  _ __ | |_ _ __ ___ | | | ___ _ __
    |  _ \| |/ _ \ / _` |/ _` | | '_ \ / _` | | |   / _ \| '_ \| __| '__/ _ \| | |/ _ \ '__|
    | |_) | | (_) | (_| | (_| | | | | | (_| | | |__| (_) | | | | |_| | | (_) | | |  __/ |
    |____/|_|\___/ \__, |\__, |_|_| |_|\__, |  \____\___/|_| |_|\__|_|  \___/|_|_|\___|_|
                   |___/ |___/         |___/


    Purpose:

        To render blog-related pages.

 */

const _ = require('lodash');
const Hooks = require('../services/Hooks.js');
const Models = require('../services/Models.js');
const Blogging = require('../models/services/Blogging.js');
const axios = require('axios');

module.exports = {

    initialiseEndpoints(app) {

        app.get("/blog", Hooks.viewEndpoint("blogging/blog_landing", [
            'view.common', 'view.blogging', 'view.blogging.landing'
        ]));

        app.get("/blog/embed", this.embedRetrieval);

        app.get("/blog/authors", Hooks.viewEndpoint("blogging/author_landing", [
            'view.common', 'view.blogging',
            'view.blogging.authors', 'view.blogging.authors.landing'
        ]));

        app.get("/blog/authors/:authorName", Hooks.viewEndpoint("blogging/author_detail", [
            'view.common', 'view.blogging',
            'view.blogging.authors', 'view.blogging.authors.detail'
        ]));

        app.get("/blog/tag/:storyTag", Hooks.viewEndpoint("blogging/blog_taglanding", [
            'view.common', 'view.blogging', 'view.blogging.taglanding'
        ]));

        app.get("/blog/:category", Hooks.viewEndpoint("blogging/blog_category", [
            'view.common', 'view.blogging', 'view.blogging.category'
        ]));

        app.get("/blog/:articlePath(*)", Hooks.viewEndpoint("blogging/blog_detail", [
            'view.common', 'view.blogging', 'view.blogging.article'
        ]));


    },

    async embedRetrieval(req, resp) {
        const model = {
            type: "xinmods:blogexternal",
            items: { url: req.query.url }
        };

        const provider = Models.transform(model, 'embed');
        if (!provider) {
            resp.status(400);
            return null;
        }

        try {
            const oEmbedRequestUrl = provider.endpoint + "?format=json&url=" + encodeURIComponent(req.query.url);
            const embedResponse = await axios.get(oEmbedRequestUrl)
            resp.send(embedResponse.data);
        }
        catch (ex) {
            console.error("Something went wrong trying to get the embed: ", ex.message, 'for', req.query.url);
            resp.status(400);
        }
    },

    /**
     * Author landing hook implementation
     *
     * @param hippo {HippoConnection}
     * @param req Request object
     * @param resp Response object
     * @returns {Promise<{authors: *[]}>}
     */
    async authorLanding(hippo, req, resp) {
        const authors = await Blogging.getAllAuthors(hippo);
        return {
            authors: authors.authors,
            totalAuthors: authors.totalSize
        };
    },

    /**
     * Author detail
     *
     * @param hippo {HippoConnection}
     * @param req Request object
     * @param resp Response object
     * @returns {Promise<{authors: *[]}>}
     */
    async authorDetail(hippo, req, resp) {

        const author = await Blogging.getAuthorAtPath(hippo, req.params.authorName);
        if (!author) {
            resp.status(404);
            return;
        }

        const articles = await Blogging.getPostsByAuthor(hippo, author, 16);

        return {
            baseModel: author,
            author,
            authorImage: hippo.getImageFromLinkSync(author.items.image),
            totalArticles: articles.totalSize,
            articles: articles.articles,
        };

    },

    /**
     * Blog post detail page
     *
     * @param hippo {HippoConnection}
     * @param req
     * @param resp
     */
    async postDetail(hippo, req, resp) {

        const post = await Blogging.getPostAtPath(hippo, req.params.articlePath);
        if (!post) {
            resp.status(404);
            return;
        }

        const author = await Blogging.getAuthorAtPath(hippo, post.items.author.link.ref.name);

        // fetch related post images so we can turn them into cards.
        const relatedPosts = _.values(post.items.related).map(a => a.link.ref).filter(p => !!p);
        for (const relPost of relatedPosts) {
            const relPostHero = relPost.items.heroImage;
            const imgRef = await hippo.getImageFromLink(relPostHero);
            relPostHero.link.ref = imgRef.imageInfo;
        }

        return {
            baseModel: post,
            post,
            author,
            relatedPosts,
            contentItems: _.values(post.items.content),
            heroImage: hippo.getImageFromLinkSync(post.items.heroImage),
        };
    },



    /**
     * initialise the blog-related endpoints
     *
     * @param app   {express.Application}
     * @param hippo {HippoConnection}
     */
    initialise(app, hippo) {

        this.initialiseEndpoints(app);

        Hooks.register('view.blogging.authors.landing', async (req, resp) => {
            return this.authorLanding(hippo, req, resp);
        });

        Hooks.register('view.blogging.authors.detail', async (req, resp) => {
            return this.authorDetail(hippo, req, resp);
        });

        Hooks.register('view.blogging.article', async (req, resp) => {
            return this.postDetail(hippo, req, resp);
        });

    }

}
