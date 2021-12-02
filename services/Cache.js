/*
	  ____           _            _____               _    _
	 / ___|__ _  ___| |__   ___  |_   _| __ __ _  ___| | _(_)_ __   __ _
	| |   / _` |/ __| '_ \ / _ \   | || '__/ _` |/ __| |/ / | '_ \ / _` |
	| |__| (_| | (__| | | |  __/   | || | | (_| | (__|   <| | | | | (_| |
	 \____\__,_|\___|_| |_|\___|   |_||_|  \__,_|\___|_|\_\_|_| |_|\__, |
																   |___/

	Purpose:

		To track all known caches

 */

const _ = require('lodash');

/**
 * A map where the keys are the unique known caches
 * @type {Object}
 */
const knownCaches = {};

module.exports = {

	addCacheName(name) {
		knownCaches[name] = true;
	},

	flushAll() {
		const Hippo = require('./Hippo.js');

		console.log(">> Clearing caches");

		// visit all known keys and flush the caches.
		_.keys(knownCaches).forEach((cacheName) => {
			console.log(" .. clearing ", cacheName);
			const conn = Hippo(cacheName);
			conn.cache.flushCache();
			delete knownCaches[cacheName];
		});

		console.log(" .. completed.");

	}

};

