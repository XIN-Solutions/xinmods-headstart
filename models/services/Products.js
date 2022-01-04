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
     * @returns {Promise<*[]>}
     */
    async getAllProducts(hippo) {

        const query = hippo.newQuery().type("xinmods:product").includePath("/content/documents").build();
        const results = await hippo.executeQuery(query, {fetch: ProductFullFetch});

        return results.documents;
    }

}
