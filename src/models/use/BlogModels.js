const _ = require('lodash');
const Models = require('../../services/Models.js');
const HotReload = require('../../services/HotReload.js');

module.exports = {

    /**
     * @param doc
     * @returns {Breadcrumb}
     */
    blogPostBreadcrumb(doc) {
        const categoryUri = _.takeRight(doc.path.split("/"), 2)[0];
        return [
            {url: "/", label: "Home"},
            {url: "/blog", label: "Blog"},
            {url: "/blog/" + doc.category.name , label: doc.category.label},
            {url: "#", label: doc.items.title}
        ];
    },

    /**
     * Convert a blog into a card.
     *
     * @param doc {HippoDocument} the document type to convert
     * @param baseDoc {HippoDocument}
     * @returns {Card} a card object
     */
    blogCard(doc, baseDoc) {
        return {
            link: Models.transform(doc, 'link'),
            title: doc.items.title,
            image: (
                baseDoc.hippo
                    ?.getImageFromLinkSync(doc.items.heroImage)
                    ?.crop(500, 350)
                    ?.toUrl()
            ),
            description: doc.items.summary
        };
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


    /**
     * @returns {string} link to a blog post
     */
    blogLink(doc) {
        const path = doc.path.substring('/content/documents/blog/articles/'.length);
        return `/blog/${path}`;
    },

    /**
     * Convert a blogimage block with image descriptions into a set of slides
     *
     * @param block
     *
     * @param document {object}
     * @param document.hippo {HippoConnection}
     * @returns {Carousel} array of carousel slides
     */
    blogImageSlides(block, document) {

        /** @type {Carousel} */
        const slides = [];
        const images = _.values(block.items.images);

        for (const image of images) {
            const imageUrl = document.hippo.getImageFromLinkSync(image).scaleWidth(1000).crop(1000, 666).toUrl();
            slides.push({
                imageUrl,
                title: block.items.caption ?? null,
                description: image.link.ref.items.description
            })
        }
        return slides;
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
        Models.register("xinmods:blog", "breadcrumb", this.blogPostBreadcrumb);
        Models.register("xinmods:blog", "bodyClass", () => "Page--blog");

        Models.register("xinmods:blogimage", "slides", this.blogImageSlides);
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