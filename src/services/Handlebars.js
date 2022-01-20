const _ = require('lodash');
const fs = require('fs');
const ContentParser = require("./ContentParser.js");
const Models = require("./Models.js");

module.exports = {

	registerHelpers(hbs) {

		/**
		 * Simple JSON output handlebars helper.
		 */
		hbs.registerHelper('inlineFile', function(context) {
			const file = fs.readFileSync(context);
			return file;
		});


		/**
		 * Simple JSON output handlebars helper.
		 */
		hbs.registerHelper('json', function(context) {
			const skipHippo = (key, value) => {
				if (key === 'hippo') { return null; }
				return value;
			}

			return JSON.stringify(context, skipHippo, 4);
		});

        /**
         * Simple JSON output handlebars helper.
         */
        hbs.registerHelper('jsonflat', function(context) {
			const skipHippo = (key, value) => {
				if (key === 'hippo') { return null; }
				return value;
			}
            return JSON.stringify(context, skipHippo);
        });

        hbs.registerHelper('nl2br', function(context) {
			return context.replace("\n", "<br>");
		});

		hbs.registerHelper("length", function(a, options) {
			return a.length;
		});

		hbs.registerHelper("has-items", function(a, options) {
			return !_.isEmpty(a);
		});

		hbs.registerHelper("not", function(a, options) {
			return !!!a;
		});

		hbs.registerHelper("and", function(a, b, options) {
			if (a && b) {
				return true;
			}
			return null;
		});

		hbs.registerHelper("or", function(a, b, options) {
			if (a || b) {
				return true
			}
			return null;
		});


		hbs.registerHelper('equals', function(first, second) {
			return (first == second);
		});


		hbs.registerHelper('?:', function(v1, thenCond, elseCond, options) {
			if(v1) {
				return thenCond;
			}
			return elseCond;
		});

		hbs.registerHelper("concat", function(...args) {
			const items = [...args];
			items.pop();
			return items.join("");
		});

		hbs.registerHelper('fallback', function(v1, elseCond, options) {
			if(v1) {
				return v1;
			}
			return elseCond;
		});

		hbs.registerHelper('image-url', function(image, options) {
			if (!image) {
				return null;
			}

			if (typeof(image) === 'string') {
				return image;
			}

			const {width, height, cropX, cropY, document} = options.hash ?? {};

			const isRawImg = document && image.type && image.link;
			const cloned = isRawImg? document.hippo.getImageFromLinkSync(image) : image.clone();

			if (width) {
				cloned.scaleWidth(width);
			} else if (height) {
				cloned.scaleHeight(height);
			}

			if (cropX && cropY) {
				cloned.crop(cropX, cropY);
			}

			return cloned.toUrl();
		});

		hbs.registerAsyncHelper('html-field', async function(options, cb) {
			const ContentParser = require('./ContentParser.js');
			const {document, field} = options.hash ?? {};
			if (!document) {
				throw new Error("Expected `document=<value>` with .hippo field in html-field include.");
			}
			if (!field) {
				throw new Error("Expected `field=<html-object>` field in html-field include.");
			}
			const parsedContent = (
				await ContentParser.parseHtml(
					document.hippo,
					(field.items?.html ?? field.items?.text)
				)
			);
			cb(parsedContent);
		});

		hbs.registerHelper('use', function(model, options) {
			const Models = require('./Models.js');

			if (!model) {
				console.error("The model does not exist.")
				return null;
			}

			if (!options) {
				console.error("No options specified.");
				return null;
			}

			const variation = options.hash.as;
			if (!variation) {
				throw new Error("Expected 'variation' parameter on #use helper.");
			}

			const baseDoc = options.hash.document;

			// is an array, or is map with only numeric keys.
			const isMultiple = (
				_.isArray(model) ||
				_.keys(model).filter(number => number == parseInt(number)).length === _.keys(model).length
			);

			if (isMultiple) {
				const elements = _.map(_.values(model), (el) => {
					return Models.transform(el, variation, baseDoc ?? null);
				});
				return options.fn? options.fn(elements) : elements;
			}

			const result = Models.transform(model, variation, baseDoc ?? null);
			return options.fn ? options.fn(result) : result;
		});

		hbs.registerHelper("get-config", function(config) {
			const Config = require('./AppConfig.js');
			return Config[config];
		});

		/**
		 * Handlebars block helper to check if an env var is set to true or not
		 */
		hbs.registerHelper('feature-enabled', function(featureName, options) {
			const envName = `FEATURE_${featureName.toUpperCase()}`;
			if (process.env[envName] === 'enabled') {
				return options.fn(this);
			}

			return '';
		});

	},

	/**
	 * Initialise common handlebars function we need.
	 *
	 * @param hbs	handlebars instance
	 */
	initialise(app, hbs, rootFolder, headstartRootFolder = null) {

		return new Promise((resolve, reject) => {

			this.registerHelpers(hbs);

			const nodeFolder = headstartRootFolder ??`${rootFolder}/node_modules/xinmods-headstart`;

			/**
			 * Configure the handlebars engine
			 */
			app.engine('hbs', hbs.express4({
				partialsDir: [
					`${nodeFolder}/views/components`,
					`${nodeFolder}/views/partials`,
					rootFolder + '/views/partials',
				],
				layoutsDir: rootFolder + '/views/layouts',
				cache: true
			}));

			app.set('view engine', 'hbs');
			app.set('views', [
				`${nodeFolder}/views/pages`,
				`${rootFolder}/views/partials`,
				`${rootFolder}/views/pages`,
				`${rootFolder}/views/components`
			]);

			// precache partials so the markdown engine knows about them
			hbs.cachePartials( () => {
				resolve();
			});

		});

	}
}
