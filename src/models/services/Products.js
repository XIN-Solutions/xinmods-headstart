const _ = require('lodash');

const ProductFullFetch = [
    "images/*/link",
    "related/*/link",
    "html/links/*"
];

module.exports = {

    async getProduct(hippo, name) {

        try {
            const product = await hippo.getDocumentByPath('/content/documents/product/' + name, { fetch: ProductFullFetch });
            return product;
        }
        catch (ex) {
            console.error("Couldn't fetch product", ex);
        }
    },


    /**
     * Get all products from the repository.
     *
     * @param hippo {HippoConnection} the hippo connection to use.
     * @param limit {?number} a potential limit
     * @returns {Promise<*[]>}
     */
    async getHighlightedProducts(hippo, limit = null) {

        const query = (
            hippo.newQuery()
                .type("xinmods:product")
                .includePath("/content/documents")
                .where().equals("xinmods:highlight", true).end()
                .orderBy("hippostdpubwf:publicationDate", "desc")
        );

        if (limit !== null) {
            query.limit(limit);
        }

        const results = await hippo.executeQuery(query.build(), {fetch: ProductFullFetch});
        return results.documents;
    },


    /**
     * Get all products from the repository.
     *
     * @param hippo {HippoConnection} the hippo connection to use.
     * @param limit {?number} a potential limit
     * @returns {Promise<*[]>}
     */
    async getAllProducts(hippo, limit = null) {

        const query = (
            hippo.newQuery()
                .type("xinmods:product")
                .includePath("/content/documents")
                .orderBy("hippostdpubwf:publicationDate", "desc")
        );

        if (limit !== null) {
            query.limit(limit);
        }

        const results = await hippo.executeQuery(query.build(), {fetch: ProductFullFetch});
        return results.documents;
    }

}
