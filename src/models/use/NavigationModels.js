const _ = require('lodash');
const {Models, HotReload} = require("../../../index.js");

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

    convertNavItem(navItem, base) {
        return  {
            label: navItem.items.label,
            link: navItem.items.link?.link?.ref ? Models.transform(navItem.items.link.link.ref, 'link') : null,
            children: _.values(navItem.items.children).map(child => convertChild(child))
        };
    },

    /**
     * @returns {Navbar} navigation bar
     */
    convertNavbar(navDoc) {

        /** @type {HippoConnection} */
        const hippo = navDoc.hippo;
        const homelink = navDoc.items.homeLink;

        const navbar = {
            id: navDoc.id,
            link: Models.transform(homelink.link.ref, 'link'),
            name: navDoc.items.title ?? null,
            image: hippo.getImageFromLinkSync(navDoc.items.image).scaleHeight(80).toUrl(),
            navigation: _.values(navDoc.items.children).map(child => convertChild(child))
        };

        return navbar;
    },

    /**
     * @returns {?string} the redirect target link.
     */
    redirectLink(redirectDoc) {
        return redirectDoc?.items?.redirectTarget ?? null;
    },


    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:navigationitem", "navigation", this.convertNavItem);
        Models.register("xinmods:navigation", "navbar", this.convertNavbar);
        Models.register("xinmods:redirect", "link", this.redirectLink);
    },


    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
    }



}
