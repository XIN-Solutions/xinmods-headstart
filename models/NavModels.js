const _ = require('lodash');
const {Models, HotReload} = require("xinmods-headstart");
const Clazz = require("./ProductModels.js");

/**
 *
 * @param child {object}
 * @returns {NavbarItem}
 */
function convertChild(child) {

    const hasChildren = _.values(child.items.children ?? {}).length > 0;
    const linkRef = child.items.link.link.ref;

    if (!hasChildren) {

        const url = Models.transform(linkRef, 'link') ?? '#';
        return {
            label: child.items.label,
            url
        };

    }

    return {
        id: child.items.label.toLowerCase().replace(/[^a-z0-9]/g, ''),
        label: child.items.label,
        children: _.values(child.items.children).map(convertChild)
    };
}

module.exports = {


    /**
     * @returns {Navbar} navigation bar
     */
    convertNavbar(navDoc) {
        const hippo = navDoc.hippo;
        const homelink = navDoc.items.homeLink;

        const navbar = {
            id: navDoc.id,
            link: null,
            name: navDoc.items.title ?? null,
            image: hippo.getImageFromLinkSync(navDoc.items.image).scaleHeight(80).toUrl(),
            navigation: _.values(navDoc.items.children).map(child => convertChild(child))
        };

        return navbar;
    },


    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:navigation", "navbar", this.convertNavbar);
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
        HotReload.onReload(() => {
            const Clazz = require('./NavModels.js');
            Clazz.register();
        }, "Navigation Models");
    }



}
