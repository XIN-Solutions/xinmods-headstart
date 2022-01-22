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
	AppInfo: require('./src/services/AppInfo.js'),

	/**
	 * Exposes a simple configuration object based on env vars.
	 */
	AppConfig: require('./src/services/AppConfig.js'),

	/**
	 * Simple Email service that uses SES and is able to inline CSS styles into handlebars template
	 */
	EmailService: require('./src/services/EmailService.js'),

	/**
	 * A ping service that can touch a file in S3, used for broadcasting frontend events to all the nodes.
	 */
	HostPingService: require('./src/services/HostPingService.js'),

	/**
	 * Has a great number of useful handlebar template functions
	 */
	Handlebars: require('./src/services/Handlebars.js'),

	/**
	 * Little helper that clears node requires cache when something changes.
	 */
	HotReload: require('./src/services/HotReload.js'),

	/**
	 * Helps parse rich text content and substitute links and images
	 */
	ContentParser: require('./src/services/ContentParser.js'),

	/**
	 * Hooks for registering code to run at predetermined points.
	 */
	Hooks: require('./src/services/Hooks.js'),

	/**
	 * The decorator service.
	 */
	Models: require('./src/services/Models.js'),

	Controllers: {
		Products: require('./src/controllers/ProductController.js'),
		Blogging: require('./src/controllers/BloggingController.js')
	},

	ModelServices: {
		Navigation: require('./src/models/services/Navigation.js'),
		Blogging: require('./src/models/services/Blogging.js'),
		Products: require('./src/models/services/Products.js'),
		Footer: require('./src/models/services/Footer.js')
	},

	/**
	 * Exposes a function that creates an instance to the Bloomreach backend, depending
	 * on the NODE_ENV it will use different paths.
	 */
	Hippo: require('./src/services/Hippo.js'),
	Bloomreach: require('./src/services/Hippo.js'),

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

		const Handlebars = require('./src/services/Handlebars.js');
		const HotReload = require('./src/services/HotReload.js');
		const ContentParser = require('./src/services/ContentParser.js');

		const DefaultResolver = (linkInfo) => {
			const Models = require('./src/services/Models.js');
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

		app.use('/assets', express.static(process.cwd() + "/assets"));
		app.use(
			'/assets/core',
			express.static(__dirname + "/assets", {
				maxAge: "3600000",
			})
		);


		// determine the on reload handler list.
		const onReload = (
			options.onReload && options.onReload.length > 0
				? (options.onReload.length ? options.onReload : [options.onReload])
				: []
		);

		// initialise handlebars and attach hotreload.
		Handlebars
			.initialise(app, hbs, process.cwd())
			.then(() => { HotReload.start({ onReload }); });

		// initialise out-of-the-box model transformations
		require('./src/models/use/NavigationModels.js').initialise();
		require('./src/models/use/FooterModels.js').initialise();
		require('./src/models/use/ProductModels.js').initialise();
		require('./src/models/use/BlogModels.js').initialise();
		require('./src/models/use/BlogAuthorModels.js').initialise();
		require('./src/models/use/BlogEmbedModels.js').initialise();

	}


};
