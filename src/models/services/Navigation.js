module.exports = {

    /**
     *
     * @param hippo {HippoConnection}
     * @param path {string}
     */
    async getNavigationByPath(hippo, path) {
        const navDoc =
            await hippo.getDocumentByPath(path, {
                fetch: [
                    "items/image/link",
                    "homeLink/link",
                    "link/link"
                ]
            });

        return navDoc;
    }

}
