const Models = require("../../services/Models.js");
const HotReload = require("../../services/HotReload.js");
const axios = require('axios');

/** @type BlogEmbedConfig[] */
const EmbedConfigs = [
    {
        provider: "Facebook Post",
        endpoint: "https://www.facebook.com/plugins/post/oembed.json",
        scheme: [
            "https?://www\\.facebook\\.com/.*/posts/.*",
            "https?://www\\.facebook\\.com/photos/.*",
            "https?://www\\.facebook\\.com/.*/photos/.*",
            "https?://www\\.facebook\\.com/photo\\.php.*",
            "https?://www\\.facebook\\.com/photo\\.php"
        ]
    },

    {
        provider: "Facebook Video",
        endpoint: "https://www.facebook.com/plugins/video/oembed.json",
        scheme: [
            "https?://www\\.facebook\\.com/.*/videos/.*",
            "https?://www\\.facebook\\.com/video\\.php.*"
        ]
    },

    {
        provider: "TikTok",
        endpoint: "https://www.tiktok.com/oembed",
        scheme: [
            "https?://(www\\.)?tiktok\\.com/.*",
        ]
    },

    {
        provider: "Instagram",
        endpoint: "https://api.instagram.com/oembed",
        scheme: [
            "https?://(www\\.)?instagram\\.com/p/.*",
            "https?://(www\\.)?instagr\\.am/p/.*"
        ]
    },

    {
        provider: "Twitter",
        endpoint: "https://publish.twitter.com/oembed",
        scheme: ["https?://(.*\.)?twitter\.com/.*"],
    },

    {
        provider: "Youtube",
        endpoint: "https://www.youtube.com/oembed",
        scheme: [
            "https://.*\.youtube.com/watch.*",
            "https://.*\.youtube.com/v/.*",
            "https://youtu\.be/.*"
        ]
    },

    {
        provider: "Reddit",
        endpoint: "https://www.reddit.com/oembed",
        scheme: [
            "https?://(www\\.)?reddit.com/.*",
        ]
    }
]


module.exports = {

    /**
     * Get provider information about how embedding works.
     *
     * @param embed {object} the embed block
     * @param embed.items {object}
     * @param embed.items.url {string} the url we're trying to embed
     * @returns {null|BlogEmbedConfig}
     */
    blogExternalEmbed(embed) {

        const url = embed.items.url;

        for (const provider of EmbedConfigs) {
            for (const matchRegex of provider.scheme) {
                if (url.match(matchRegex)) {
                    return {...provider, url};
                }
            }
        }

        return null;
    },


    /**
     * Register all the model transformations for product related elements.
     */
    register() {
        Models.register("xinmods:blogexternal", "embed", this.blogExternalEmbed);
    },

    /**
     * Initialise the product models by registering them immediately, and also registering
     * them with the hotreload mechanism so that they are reloaded when the
     */
    initialise() {
        this.register();
        HotReload.onReload(() => {
            const Clazz = require('./BlogEmbedModels.js');
            Clazz.register();
        }, "Blog Embed Models");
    }
}
