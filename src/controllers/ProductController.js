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

module.exports = {


    /**
     * The product landing page rendering
     *
     * @param hippo {HippoConnection} the hippo connection
     * @param req   the request object
     * @param resp  the response object
     */
    async landingPage(hippo, req, resp) {
        const Products = require('../models/services/Products.js');
        const Navigation = require('../models/services/Navigation.js');

        // execute beforeRender hooks and smash them into a single map that
        // will function as the base of the render context object.
        const baseMap = await Hooks.invokeAllAsMap([
            "beforeRender.common",
            "beforeRender.product",
            "beforeRender.product.landing"
        ]);

        const productList = await Products.getAllProducts(hippo);

        resp.render(
            'products/all_products', Object.assign(baseMap, {
                productList,
                baseModel: { type: '__default__' }
            })
        );
    },

    /**
     * The product detail page
     *
     * @param hippo {HippoConnection} the hippo connection
     * @param req   the request object
     * @param resp  the response object
     */
    async detailPage(hippo, req, resp) {

        const Products = require('../models/services/Products.js');

        // execute beforeRender hooks and smash them into a single map that
        // will function as the base of the render context object.
        const baseMap = await Hooks.invokeAllAsMap([
            "beforeRender.common",
            "beforeRender.product",
            "beforeRender.product.detail"
        ]);

        const product = await Products.getProduct(hippo, req.params.name);

        resp.render('products/product', Object.assign(baseMap, {
            product,
            baseModel: product
        }));

    },

    /**
     * Initialise product endpoints
     *
     * @param app   the handlebars app
     * @param hippo the hippo connection to use.
     */
    initialise(app, hippo) {

        console.log("Initialising product controller.");

        app.get("/products", async (req, resp) => {
            try {
                await this.landingPage(hippo, req, resp);
            }
            catch (err) {
                console.error("Exception occurred rendering landing page: ", err);
            }
        });

        app.get('/product/:name', async (req, resp) => {
            try {
                await this.detailPage(hippo, req, resp);
            }
            catch (err) {
                console.error("Exception occurred rendering detail page: ", err);
            }
        });

    }

}
