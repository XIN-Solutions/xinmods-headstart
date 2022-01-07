/*
     ____                _            _      ____            _             _ _
    |  _ \ _ __ ___   __| |_   _  ___| |_   / ___|___  _ __ | |_ _ __ ___ | | | ___ _ __
    | |_) | '__/ _ \ / _` | | | |/ __| __| | |   / _ \| '_ \| __| '__/ _ \| | |/ _ \ '__|
    |  __/| | | (_) | (_| | |_| | (__| |_  | |__| (_) | | | | |_| | | (_) | | |  __/ |
    |_|   |_|  \___/ \__,_|\__,_|\___|\__|  \____\___/|_| |_|\__|_|  \___/|_|_|\___|_|

    Purpose:

        Product controller endpoints.

 */

const _ = require('lodash');
const Hooks = require('../services/Hooks.js');
const Products = require("../models/services/Products.js");

module.exports = {

    /**
     * Initialise running the landing hook
     * @param hippo {HippoConnection}
     * @private
     */
    _initialiseLandingHook(hippo) {

        Hooks.register("view.product.landing", async (req, resp) => {
            const productList = await Products.getAllProducts(hippo);

            return {
                productList,
                baseModel: {type: '__default__'}
            };
        });
    },

    /**
     * Initialise the view product detail
     * @param hippo
     * @private
     */
    _initialiseProductDetailHook(hippo) {

        Hooks.register("view.product.detail", async (req, resp) => {

            const product = await Products.getProduct(hippo, req.params.name);

            return {
                product,
                baseModel: product,
            };
        });
    },

    /**
     * Initialise the widget that can be used on the homepage.
     *
     * @param hippo {HippoConnection}
     * @private
     */
    _initialiseWidget(hippo) {

        Hooks.register("view.widgets.home.highlighted", async () => {

            const products = await Products.getHighlightedProducts(hippo);
            return {
                template: "product/widgets/productlist",
                model: {
                    title: "Highlights",
                    products
                }
            };
        });

        Hooks.register("view.widgets.home.recent", async () => {

            const products = await Products.getAllProducts(hippo, 4);
            return {
                template: "product/widgets/productlist",
                model: {
                    title: "Recent",
                    products
                }
            };

        });

    },


    /**
     * Initialise product endpoints
     *
     * @param app   the handlebars app
     * @param hippo the hippo connection to use.
     */
    initialise(app, hippo) {

        console.log("Initialising product controller.");

        this._initialiseProductDetailHook(hippo);
        this._initialiseLandingHook(hippo);
        this._initialiseWidget(hippo);

        app.get("/products", Hooks.viewEndpoint('products/all_products', [
            "view.common",
            "view.product",
            "view.product.landing"
        ]));

        app.get("/product/:name", Hooks.viewEndpoint('products/product', [
            "view.common",
            "view.product",
            "view.product.detail"
        ]));

    }

}
