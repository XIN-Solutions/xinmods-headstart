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

const Hooks = require('../services/Hooks.js');
const Blogging = require('../models/services/Blogging.js');

module.exports = {

    initialiseEndpoints(app) {

        app.get("/blog", Hooks.viewEndpoint("blogging/blog_landing", [
            'view.common', 'view.blogging', 'view.blogging.landing'
        ]));

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

        app.get("/blog/:category/:articlePath*", Hooks.viewEndpoint("blogging/blog_detail", [
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

        Hooks.register('view.blogging.authors.landing', async (req, resp) => {
            const authors = await Blogging.getAllAuthors(hippo);
            return { authors };
        });

        Hooks.register('view.blogging.authors.detail', async (req, resp) => {
            const author = await Blogging.getAuthorAtPath(hippo, req.params.authorName);
            return {
                baseModel: author,
                author,
                authorImage: hippo.getImageFromLinkSync(author.items.image)
            };
        });

    }

}
