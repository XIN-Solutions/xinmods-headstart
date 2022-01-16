const _ = require('lodash');
const Models = require('../../services/Models.js');
const HotReload = require('../../services/HotReload.js');

module.exports = {


    /**
     * Convert a blog into a card.
     *
     * @param doc {object} the document type to convert
     * @returns {Card} a card object
     */
    blogCard(doc) {
        return {};
    },

    /**
     * @param doc the blog document to get the title for
     * @return {string} the title of the blog
     */
    blogTitle(doc) {
        return doc.items.title;
    },

    /**
     * @param doc
     * @returns {MetaTags}
     */
    blogMetaTags(doc) {
        return [];
    },


    blogLink(doc) {
        return '/news/';
    },

    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:blog", "card", this.blogCard);
        Models.register("xinmods:blog", "link", this.blogLink);

        // misc related to blog page
        Models.register("xinmods:blog", "pageTitle", this.blogTitle);
        Models.register("xinmods:blog", "metatags", this.blogMetaTags);
        Models.register("xinmods:blog", "bodyClass", () => "Page--blog");
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
        HotReload.onReload(() => {
            const Clazz = require('./BlogModels.js');
            Clazz.register();
        }, "Blog Models");
    }



}
