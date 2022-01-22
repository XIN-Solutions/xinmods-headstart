/*
     _____           _
    |  ___|__   ___ | |_ ___ _ __
    | |_ / _ \ / _ \| __/ _ \ '__|
    |  _| (_) | (_) | ||  __/ |
    |_|  \___/ \___/ \__\___|_|

    Purpose:

        To retrieve footer

 */

module.exports = {

    /**
     * Retrieve a xinmods:sitefooter document.
     *
     * @param hippo {HippoConnection} the hippo connection to use
     * @param path {string} where to get the information from
     */
    async getFooterByPath(hippo, path) {
        return await hippo.getDocumentByPath(path, { fetch: ['items/link/link'] });
    }

};
