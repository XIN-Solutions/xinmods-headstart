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
            baseModel: { "type": "authorLanding" },
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

        const authorName = post.items.author.link?.ref?.name ?? null;
        const author = authorName ? await Blogging.getAuthorAtPath(hippo, authorName) : null;

        // // fetch related post images so we can turn them into cards.
        const relatedPosts = _.values(post.items.related).map(a => a.link.ref).filter(p => !!p);

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
     * Default handler for blog landing page
     *
     * @param hippo {HippoConnection}
     * @param req
     * @param resp
     * @returns {Promise<{}>}
     */
    async blogLanding(hippo, req, resp) {

        // get settings
        const blogSettings = await Blogging.getBlogSettings(hippo, '/content/documents/blog/settings');

        // extra hot tags
        const hotTags = _.values(blogSettings?.items?.hotTags) ?? [];

        // extract feature posts
        const featurePosts = (
            _.values(blogSettings.items.featured)
                .map(post => post?.link?.ref ?? null)
                .filter(o => o !== null)
        );

        // read latest posts for selected categories
        const categoryPaths = (
            _.values(blogSettings?.items?.homeCategories || {})
                .map(catLink => catLink.link.path)
        );

        // retrieve selected categories
        const categories = [];
        for (const path of categoryPaths) {
            const categoryName = _.last(path.split("/"));
            const category = await Blogging.getPostCategoryAtPath(hippo, categoryName);
            const posts = await Blogging.getAllPosts(hippo, path, 6);
            categories.push({
                category,
                posts
            });
        }

        return {
            baseModel: blogSettings,
            blogSettings,
            hotTags,
            featurePosts,
            categories
        };
    },


    /**
     * Default handler for retrieving a blog category.
     *
     * @param hippo {HippoConnection} the hippo connection
     * @param req
     * @param resp
     *
     * @returns {?{}}
     */
    async blogCategory(hippo, req, resp) {

        const categoryName = req.params.category;
        const category = await Blogging.getPostCategoryAtPath(hippo, categoryName);

        if (!category) {
            resp.status(404);
            return;
        }

        const posts = await Blogging.getAllPosts(hippo, category.path, 3 * 10 - 1);

        return {
            baseModel: {type: "virtual:blogcategory", ...category},
            category,
            posts
        };
    },


    /**
     * Populate blog tag landing page view.
     *
     * @param hippo {HippoConnection} the hippo connection to use
     * @param req
     * @param resp
     *
     * @returns {Promise<{*}>}
     */
    async blogTagLanding(hippo, req, resp) {
        const storyTag = req.params.storyTag;
        const posts = await Blogging.getPostsWithStoryTag(hippo, storyTag);

        return {
            baseModel: {type: "virtual:blogtaglanding", storyTag},
            storyTag,
            posts
        };
    },


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
    /**
     * initialise the blog-related endpoints
     *
     * @param app   {express.Application}
     * @param hippo {HippoConnection}
     */
    initialise(app, hippo) {

        this.initialiseEndpoints(app);

        Hooks.register('view.blogging.landing', async (req, resp) => {
            return this.blogLanding(hippo, req, resp);
        });

        Hooks.register('view.blogging.category', async (req, resp) => {
            return this.blogCategory(hippo, req, resp);
        });


        Hooks.register('view.blogging.taglanding', async (req, resp) => {
            return this.blogTagLanding(hippo, req, resp);
        });

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
