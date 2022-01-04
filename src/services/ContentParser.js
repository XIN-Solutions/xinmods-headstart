const _ = require('lodash');
const RewritingStream = require('parse5-html-rewriting-stream');
const {Writable, Readable} = require('stream');

module.exports = {

    /**
     * An image url that needs to be converted to the CDN url if set.
     *
     * @param url	{string} the url to convert
     * @returns {string|*} the converted url or the same of CDN URL is not set.
     */
    cdnUrl(url) {
        if (process.env.HIPPO_CDN_URL) {
            return process.env.HIPPO_CDN_URL + url;
        }
        return url;
    },

    /**
     * Get link path information
     * @param linkInfo
     * @returns {Promise<*>}
     */
    async getLinkPath(hippo, linkInfo) {

		if (linkInfo.type === "binary") {
			return this.cdnUrl(linkInfo.url);
		}

		if (!this.resolver) {
		    console.error("No link resolver set, will not resolve links.");
		    return "#";
        }
        return this.resolver(linkInfo);
    },

    /**
     * Parse the html and replace any internal links with their proper links.
     * @returns {Promise<void>}
     */
    async parseHtml(hippo, textBlock) {
        const linkNames = _.keys(textBlock.links);
        const linkInfo = {};

        for (const linkName of linkNames) {
            linkInfo[linkName] = await this.getLinkPath(hippo, textBlock.links[linkName]);
        }

        return new Promise((resolve, reject) => {
            const rewriter = new RewritingStream();

            const chunks = [];

            const writer = new Writable({
                write(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback(null);
                },

            });

            writer.on("finish", () => {
                const resultStr = Buffer.concat(chunks).toString('utf8');
                resolve(resultStr);
            })

            // waiting on an 'a' tag with some hippo link in it.
            rewriter.on('startTag', startTag => {

				if (startTag.tagName === 'img') {

					const linkAttr = (
						startTag.attrs
							? _.find(startTag.attrs, (attr) => attr.name === 'data-hippo-link')
							: null
					);

					if (linkAttr) {
						const linkName = linkAttr.value;

						// get link path
						linkAttr.name = "src";
						linkAttr.value = linkInfo[linkName] || "#";
					}
				}


				if (startTag.tagName === 'a') {

                	if (startTag.attrs) {
                		let linkAttr = null;
                		for (const attr of startTag.attrs) {
                			if (attr && attr.name === 'data-hippo-link') {
                				linkAttr = attr;
							}
						}

                		if (linkAttr) {
							// get link path
							const linkName = linkAttr.value;
							linkAttr.name = "href";
							linkAttr.value = linkInfo[linkName] || "#";
						}

					}

                }
                rewriter.emitStartTag(startTag);
            })

            // start the process
            const reader = Readable.from(textBlock.content);
            reader.pipe(rewriter).pipe(writer);
        });

    },

    /**
     * Sets the link resolver we're after.
     * @param resolver
     */
    setLinkResolver(resolver) {
        this.resolver = resolver;
    }


};
