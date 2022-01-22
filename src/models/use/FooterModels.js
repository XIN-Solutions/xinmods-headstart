/*
     _____           _              __  __           _      _
    |  ___|__   ___ | |_ ___ _ __  |  \/  | ___   __| | ___| |___
    | |_ / _ \ / _ \| __/ _ \ '__| | |\/| |/ _ \ / _` |/ _ \ / __|
    |  _| (_) | (_) | ||  __/ |    | |  | | (_) | (_| |  __/ \__ \
    |_|  \___/ \___/ \__\___|_|    |_|  |_|\___/ \__,_|\___|_|___/

    Purpose:

        To convert xinmods:sitefooter into something useful for handlebars to render.

 */

const _ = require('lodash');
const Models = require("../../services/Models.js");

module.exports = {

    /**
     * Convert a site
     * @param doc
     */
    convertSiteFooter(doc) {
        return {
            info: {
                title: doc.items.footerTitle,
                text: doc.items.footerText,
                copyright: doc.items.copyright
            },

            navCols: _.values(doc.items.navCols).map(nav => Models.transform(nav, "navigation")),

            socials: {
                email: doc.items.socialEmail,
                twitter: doc.items.socialTwitter,
                facebook: doc.items.socialFacebook,
                instagram: doc.items.socialInstagram,
            },

        };
    },

    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:sitefooter", "footer", this.convertSiteFooter);
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
    }


};
