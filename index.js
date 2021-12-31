/*
	 ____                  _                 ___           _
	/ ___|  ___ _ ____   _(_) ___ ___  ___  |_ _|_ __   __| | _____  __
	\___ \ / _ \ '__\ \ / / |/ __/ _ \/ __|  | || '_ \ / _` |/ _ \ \/ /
	 ___) |  __/ |   \ V /| | (_|  __/\__ \  | || | | | (_| |  __/>  <
	|____/ \___|_|    \_/ |_|\___\___||___/ |___|_| |_|\__,_|\___/_/\_\

	Purpose:

		Exposing services

 */

module.exports = {

	/**
	 * AppInfo helps you get information about the current package.json
	 */
	AppInfo: require('./services/AppInfo.js'),

	/**
	 * Exposes a simple configuration object based on env vars.
	 */
	AppConfig: require('./services/AppConfig.js'),

	/**
	 * Simple Email service that uses SES and is able to inline CSS styles into handlebars template
	 */
	EmailService: require('./services/EmailService.js'),

	/**
	 * A ping service that can touch a file in S3, used for broadcasting frontend events to all the nodes.
	 */
	HostPingService: require('./services/HostPingService.js'),

	/**
	 * Has a great number of useful handlebar template functions
	 */
	Handlebars: require('./services/Handlebars.js'),

	/**
	 * Little helper that clears node requires cache when something changes.
	 */
	HotReload: require('./services/HotReload.js'),

	/**
	 * Helps parse richtext content and substitute links and images
	 */
	ContentParser: require('./services/ContentParser.js'),

	/**
	 * The decorator service.
	 */
	Models: require('./services/Models.js'),

	/**
	 * Exposes a function that creates an instance to the Bloomreach backend, depending
	 * on the NODE_ENV it will use different paths.
	 */
	Hippo: require('./services/Hippo.js'),
	Bloomreach: require('./services/Hippo.js'),

	/**
	 * Initialise the express JS application
	 *
	 * @param express the express module
 	 * @param app the application instance
	 * @param hbs the express-hbs instance
	 *
	 * @param options {object} the options
	 * @param options.onReload {Function[]} a function that transforms `link` objects into a url.
	 * @param options.linkResolver {Function<object>} a function that transforms `link` objects into a url.
	 */
	expressJsInit(express, app, hbs, options = {onReload: []}) {

		const Handlebars = require('./services/Handlebars.js');
		const HotReload = require('./services/HotReload.js');
		const ContentParser = require('./services/ContentParser.js');

		const DefaultResolver = (linkInfo) => {
			const Models = require('./services/Models.js');
			if (!linkInfo.ref) {
				console.log("Cannot determine type for link, `ref` not available.", linkInfo);
				return "#";
			}

			const url = Models.transform(linkInfo.ref, 'link');
			if (url) {
				return url;
			}

			console.log("Did not resolve", JSON.stringify(linkInfo, null, 4));
			return '#';

		};
		ContentParser.setLinkResolver(options.linkResolver || DefaultResolver);

		// allow for json bodies
		app.use(express.json());

		// determine the on reload handler list.
		const onReload = (
			options.onReload && options.onReload.length > 0
				? (options.onReload.length ? options.onReload : [options.onReload])
				: []
		);

		// initialise handlebars and attach hotreload.
		Handlebars
			.initialise(app, hbs, process.cwd())
			.then(() => {
				HotReload.start({ onReload });
			});

		// initialise out-of-the-box model transformations
		require('./models/NavModels.js').initialise();

	}


};
