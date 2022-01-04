/*
	 _____                                _   _       _     ____      _                 _
	| ____|_  ___ __  _ __ ___  ___ ___  | | | | ___ | |_  |  _ \ ___| | ___   __ _  __| |
	|  _| \ \/ / '_ \| '__/ _ \/ __/ __| | |_| |/ _ \| __| | |_) / _ \ |/ _ \ / _` |/ _` |
	| |___ >  <| |_) | | |  __/\__ \__ \ |  _  | (_) | |_  |  _ <  __/ | (_) | (_| | (_| |
	|_____/_/\_\ .__/|_|  \___||___/___/ |_| |_|\___/ \__| |_| \_\___|_|\___/ \__,_|\__,_|
			   |_|

	Purpose:

		To clear out server require cache when a server side file was changed and to
		notify the frontend through a websocket if the SCSS was touched.
*/

/** Inspiration for code: https://nimblewebdeveloper.com/blog/hot-reload-nodejs-server */

const chokidar = require("chokidar");
const WebSocket = require('ws');
const Config = require('./AppConfig.js');

let wsServer = null;
const reloadHandlers = [];

module.exports = {

	/**
	 * Clear all required files from the cache that have a certain path prefix.
	 */
	clearRequireCache() {
		// Loop through the cached modules
		// The "id" is the FULL path to the cached module
		Object.keys(require.cache).forEach(function (id) {

			//Get the local path to the module
			const localId = id.substr(process.cwd().length);

			//Ignore anything not in server/app
			if (localId.match(/^\/src\//)) {
				//Remove the module from the cache
				delete require.cache[id];
			}
		});
	},


	/**
	 * Send a message through websocket to refresh the CSS
	 */
	notifyFrontend(file) {

		wsServer.clients.forEach((client) => {
			if (client.readyState !== WebSocket.OPEN) {
				return;
			}

			client.send(JSON.stringify({
				action: 'reload',
				file: file
			}));
		});

	},


	/**
	 * Start the websocket server on port 30303 so that we can send notification messages.
	 */
	initialiseWsMessaging() {

		wsServer = new WebSocket.Server({
			port: Config.hotReloadPort,
		});

		console.log("Started hot reload websocket server on port", Config.hotReloadPort);

	},

	/**
	 * Add a new reload handler.
	 *
	 * @param doThis {function} the function to invoke when reload is required.
	 * @param name {string} the name of the handler
	 */
	onReload(doThis, name = null) {
		if (name) {
			console.log("Registering hot reload handler: ", name);
		}
		reloadHandlers.push(doThis);
	},

	/**
	 * Start the hot reloading process
	 */
	start(options = {onReload: []}) {

		if (!Config.hotReload) {
			return;
		}

		if (options.onReload) {
			options.onReload.forEach(handler => reloadHandlers.push(handler));
		}

		//Set up watcher to watch all files in ./server/app
		const watcher = chokidar.watch(
			Config.hotReloadPaths?.split(",") ?? ["./src", "assets/dist/"]
		);

		watcher.on("ready", () => {

			const handler = (type) => {
				return (file) => {

					if (file.match(/\.js$/) && file.indexOf('src/') !== -1) {
						console.log(type + " in JS detected, reloading .. ", file);
						this.clearRequireCache();
						console.log("Reload handlers: ", reloadHandlers.length);
						reloadHandlers.forEach((rCall) => rCall());
					}

					if (file.match(/\.css$/)) {
						console.log("CSS was changed, notifying websocket.");
						this.notifyFrontend(file);
					}

				}
			};

			// On any file change event
			// You could customise this to only run on new/save/delete etc
			// This will also pass the file modified into the callback
			// however for this example we aren't using that information
			watcher.on("change", handler("Change"));
			watcher.on("unlink", handler("Deletion"));
		});

		this.initialiseWsMessaging();

	}

};
