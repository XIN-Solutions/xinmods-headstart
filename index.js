/*
	 ____                  _                 ___           _
	/ ___|  ___ _ ____   _(_) ___ ___  ___  |_ _|_ __   __| | _____  __
	\___ \ / _ \ '__\ \ / / |/ __/ _ \/ __|  | || '_ \ / _` |/ _ \ \/ /
	 ___) |  __/ |   \ V /| | (_|  __/\__ \  | || | | | (_| |  __/>  <
	|____/ \___|_|    \_/ |_|\___\___||___/ |___|_| |_|\__,_|\___/_/\_\

	Purpose:

		Exposing services

 */

const express = require("express");
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
	 * Exposes a function that creates an instance to the Bloomreach backend, depending
	 * on the NODE_ENV it will use different paths.
	 */
	Hippo: require('./services/Hippo.js'),
	Bloomreach: require('./services/Hippo.js'),

	/**
	 *
 	 * @param app
	 */
	expressJsInit(express, app, options = {assetsFolder: "/assets"}) {

		const Handlebars = require('./services/Handlebars.js');
		const HotReload = require('./services/HotReload.js');

		// compress all.
		app.use(compression({ filter: () => { return true }}));

		// allow for json bodies
		app.use(express.json());

		// initialise handlebars and attach hotreload.
		Handlebars.initialise(app, hbs, __dirname).then(() => { HotReload.start(); });

		// initialise serving assets (with cors headers and large max-age)
		app.use(options.assetsFolder,
			express.static(
				'assets',
				Object.assign({
					setHeaders(resp, path, stat) {
						resp.set('Access-Control-Allow-Origin', '*');
					},
				}, Config.inDev ? {} : {maxAge: "2592000000" /*"3600000"*/})
			)
		);


	}


};
