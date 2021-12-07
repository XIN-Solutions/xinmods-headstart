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
	 *
 	 * @param app
	 */
	expressJsInit(express, app, hbs, options = {assetsFolder: "/assets", linkResolver: () => { return '#'}}) {

		const Handlebars = require('./services/Handlebars.js');
		const HotReload = require('./services/HotReload.js');
		const ContentParser = require('./services/ContentParser.js');

		const NoResolver = (linkInfo) => { console.log("Did not resolve", linkInfo); return '#'};
		ContentParser.setLinkResolver(options.linkResolver || NoResolver);

		// allow for json bodies
		app.use(express.json());

		// initialise handlebars and attach hotreload.
		Handlebars.initialise(app, hbs, process.cwd()).then(() => { HotReload.start(); });

	}


};
