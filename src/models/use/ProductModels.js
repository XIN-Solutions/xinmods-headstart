const _ = require('lodash');
const Models = require('../../services/Models.js');
const HotReload = require('../../services/HotReload.js');

module.exports = {

    /**
     * Convert to accordion item.
     * @param question
     */
    accordionItem(question) {
        return {
            title: question.items.question,
            body: question.items.answer
        };
    },

    /**
     * Convert a product into a link fit for browsing to
     * @param product the hippo document of the product
     * @returns {Link} the link for this product.
     */
    link(product) {
        return product.path.replace("/content/documents", "");
    },

    /**
     * Turn the product into a card model
     * @param product
     * @returns {Card}
     */
    productCard(product) {
        const validImages = _.values(product.items.images).filter(obj => obj.link.type === 'local');
        const firstImageUrl =
            product.hippo.getImageFromLinkSync(validImages[0]).scaleHeight(250).crop(300, 250).toUrl()
        ;

        return {
            title: product.items.name,
            subtitle: "Product",
            image: firstImageUrl,
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas id arcu nec urna iaculis accumsan a sit amet turpis.",
            align: "left",
            link: this.link(product)
        };
    },

    /**
     * @param product the product
     */
    productBreadcrumb(product) {
        return [
            { label: "Home", url: "/"},
            { label: "Products", url: "/products"},
            { label: product.items.name }
        ];
    },

    /**
     * Turn prefetched product images into a slide.
     * @param product
     */
    productSlides(product) {

        const {hippo} = product;
        const allImages = _.values(product.items.images).map(image => hippo.getImageFromLinkSync(image));

        const slides = [];
        for (const image of allImages) {
            slides.push({
                title: "Updated Slide #" + (slides.length + 1),
                description: "lorem ipsum woop wooptiedoop",
                imageUrl: image?.scaleHeight(500).crop(600, 500).toUrl(),
            });
        }

        return slides;
    },

    /**
     * Return a set of images for a product
     * @param product
     * @returns {(Promise<Image|null>|*)[]}
     */
    productImages(product) {
        const {hippo} = product;
        return product.items.images.map(image => hippo.getImageFromLinkSync(image));
    },

    productTitle(product) {
        return "Product - " + product.items.name;
    },

    productMetatags(product) {
        return [
            {name: "tag1", content: "tag content"}
        ];
    },

    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:productquestion", "accordionItem", this.accordionItem);
        Models.register("xinmods:product", "link", this.link);
        Models.register("xinmods:product", "card", this.productCard);
        Models.register("xinmods:product", "breadcrumb", this.productBreadcrumb);
        Models.register("xinmods:product", "slides", this.productSlides);
        Models.register("xinmods:product", "images", this.productImages);

        Models.register("xinmods:product", "pageTitle", this.productTitle);
        Models.register("xinmods:product", "metatags", this.productMetatags);
        Models.register("xinmods:product", "bodyClass", () => "Page--product");
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
        HotReload.onReload(() => {
            const Clazz = require('./ProductModels.js');
            Clazz.register();
        }, "Product Models");
    }



}
