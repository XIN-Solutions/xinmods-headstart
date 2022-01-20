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
    blogAuthorCard(doc) {
        const hippo = doc.hippo;
        return {
            link: Models.transform(doc, 'link'),
            title: doc.items.name,
            description: doc.items.summary,
            image: hippo.getImageFromLinkSync(doc.items.image).scaleWidth(500).crop(500, 400).toUrl()
        };
    },

    /**
     * @param doc
     * @returns {string} the title of the blog author
     */
    blogAuthorTitle(doc) {
        return doc.items.name;
    },

    /**
     * @param doc
     * @returns {MetaTags}
     */
    blogAuthorMetaTags(doc) {
        return [];
    },

    blogAuthorLink(doc) {
        return `/blog/authors/${doc.name}`;
    },


    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("authorLanding", "metatags", () => []);
        Models.register("authorLanding", "bodyClass", () => "Page--blogAuthorLanding");
        Models.register("authorLanding", "pageTitle", () => "Authors");
        Models.register("authorLanding", "breadcrumb", () => [
            {url: "/", label: "Home"},
            {url: "/blog", label: "Blog"},
            {url: "/blog/authors", label: "Authors"}
        ]);

        // misc related to blog author page
        Models.register("xinmods:blogauthor", "pageTitle", this.blogAuthorTitle);
        Models.register("xinmods:blogauthor", "metatags", this.blogAuthorMetaTags);
        Models.register("xinmods:blogauthor", "link", this.blogAuthorLink);
        Models.register("xinmods:blogauthor", "bodyClass", () => "Page--blogAuthor");
        Models.register("xinmods:blogauthor", "card", this.blogAuthorCard);
        Models.register("xinmods:blogauthor", "breadcrumb", (doc) => [
            {url: "/", label: "Home"},
            {url: "/blog", label: "Blog"},
            {url: "/blog/authors", label: "Authors"},
            {url: "#", label: doc.items.name}
        ]);
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
        HotReload.onReload(() => {
            const Clazz = require('./BlogAuthorModels.js');
            Clazz.register();
        }, "Blog Author Models");
    }



}
