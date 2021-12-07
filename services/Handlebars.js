const _ = require('lodash');
const fs = require('fs');
const ContentParser = require("./ContentParser.js");

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
			return JSON.stringify(context, null, 4);
		});

        /**
         * Simple JSON output handlebars helper.
         */
        hbs.registerHelper('jsonflat', function(context) {
            return JSON.stringify(context);
        });

        hbs.registerHelper('nl2br', function(context) {
			return context.replace("\n", "<br>");
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

		hbs.registerHelper('fallback', function(v1, elseCond, options) {
			if(v1) {
				return v1;
			}
			return elseCond;
		});

		hbs.registerHelper('image-url', function(image, width, height, cropX, cropY) {
			if (!image) {
				return null;
			}

			const cloned = image.clone();

			if (width && width !== '-') {
				cloned.scaleWidth(width);
			} else if (height && height !== '-') {
				cloned.scaleHeight(height);
			}

			if (cropX && cropY) {
				cloned.crop(cropX, cropY);
			}

			return cloned.toUrl();
		});

		hbs.registerHelper('html-field', function(doc, html) {
			return {
				doc,
				html
			};
		});

		hbs.registerAsyncHelper('parse-html', async function(options, cb) {
			const ContentParser = require('./ContentParser.js');
			const parsedContent = (
				await ContentParser.parseHtml(
					options.doc.hippo,
					options.html.items.html
				)
			);
			cb(parsedContent);
		});

		hbs.registerHelper('use', function(model, options) {
			return options.fn(model);
		});

		hbs.registerHelper("model", function(variation, _from_, source, options) {
			const Models = require('./Models.js');

			const result = {};
			result[variation] = Models.transform(source, variation);
			return result;
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
	initialise(app, hbs, rootFolder) {

		return new Promise((resolve, reject) => {

			this.registerHelpers(hbs);

			/**
			 * Configure the handlebars engine
			 */
			app.engine('hbs', hbs.express4({
				partialsDir: rootFolder + '/views/partials',
				layoutsDir: rootFolder + '/views/layouts',
				cache: true
			}));

			app.set('view engine', 'hbs');
			app.set('views', [
				`${rootFolder}/views/pages`,
				`${rootFolder}/views/partials`,
				`${rootFolder}/views/components`
			]);

			// precache partials so the markdown engine knows about them
			hbs.cachePartials( () => {
				resolve();
			});

		});

	}
}
